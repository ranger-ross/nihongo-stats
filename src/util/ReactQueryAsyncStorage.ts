import {dehydrate, hydrate, QueryClient} from "@tanstack/react-query";
import {del, get, set} from "idb-keyval";


// Based off of https://github.com/TanStack/query/discussions/1638

interface IndexedDBCache {
    timestamp: number;
    buster: string;
    cacheState: any;
}

interface Options {
    /**
     * The key to use when storing the cache to IndexDB
     */
    IndexedDBKey?: string;
    /**
     * To avoid indexedDB spamming,
     * pass a time in ms to throttle saving the cache to disk
     */
    throttleTime?: number;
    /**
     * The max-allowed age of the cache.
     * If a persisted cache is found that is older than this
     * time, it will be discarded
     */
    maxAge?: number;
    /**
     * A unique string that can be used to forcefully
     * invalidate existing caches if they do not share the same buster string
     */
    buster?: string;
}

export async function persistWithIndexedDB(
    queryClient: QueryClient,
    {
        IndexedDBKey: indexedDBKey = `REACT_QUERY_OFFLINE_CACHE`,
        throttleTime = 1000,
        maxAge = 1000 * 60 * 60 * 24 * 7, // 7 days
        buster = "v1"
    }: Options = {}
) {
    if (typeof window !== "undefined") {
        // Subscribe to changes
        const saveCache = throttle(() => {
            const storageCache: IndexedDBCache = {
                buster,
                timestamp: Date.now(),
                cacheState: dehydrate(queryClient)
            };
            set(indexedDBKey, JSON.stringify(storageCache)); // set in Indexed DB
        }, throttleTime);

        queryClient.getQueryCache().subscribe(saveCache);

        // Attempt restore
        const cacheStorage = await get(indexedDBKey); // get from Indexed DB

        if (!cacheStorage) {
            return;
        }

        const cache: IndexedDBCache = JSON.parse(cacheStorage);

        if (cache.timestamp) {
            const expired = Date.now() - cache.timestamp > maxAge;
            const busted = cache.buster !== buster;
            if (expired || busted) {
                del(indexedDBKey); // Delete from Indexed DB
            } else {
                hydrate(queryClient, cache.cacheState);
            }
        } else {
            del(indexedDBKey);
        }
    }
}

function throttle(func: (...args: any[]) => any, wait = 100) {
    let timer: NodeJS.Timeout | null = null;

    return function (...args: any[]) {
        if (timer === null) {
            timer = setTimeout(() => {
                func(...args);
                timer = null;
            }, wait);
        }
    };
}


