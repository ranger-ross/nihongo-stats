import {dehydrate, hydrate, QueryClient} from "@tanstack/react-query";
import * as localForage from "localforage"


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
        maxAge = Infinity,
        buster = "v1"
    }: Options = {}
) {
    // Subscribe to changes
    const saveCache = throttle(() => {
        const storageCache: IndexedDBCache = {
            buster,
            timestamp: Date.now(),
            cacheState: dehydrate(queryClient)
        };
        localForage.setItem(indexedDBKey, storageCache); // set in Indexed DB
    }, throttleTime);

    queryClient.getQueryCache().subscribe(saveCache);

    // Attempt restore
    const cache = await localForage.getItem<IndexedDBCache>(indexedDBKey); // get from Indexed DB

    if (!cache) {
        return;
    }

    if (cache.timestamp) {
        const expired = Date.now() - cache.timestamp > maxAge;
        const busted = cache.buster !== buster;
        if (expired || busted) {
            await localForage.removeItem(indexedDBKey); // Delete from Indexed DB
        } else {
            hydrate(queryClient, cache.cacheState);
        }
    } else {
        await localForage.removeItem(indexedDBKey)
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


