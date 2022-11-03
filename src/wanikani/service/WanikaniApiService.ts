import * as localForage from "localforage";
import InMemoryCache from "../../util/InMemoryCache";
import {APP_URLS} from "../../Constants";
import {PromiseCache} from "../../util/PromiseCache";
import WanikaniApiServiceRxJs, {EVENT_STATUS} from "./WanikaniApiServiceRxJs";
import {RawWanikaniSummary} from "../models/raw/RawWanikaniSummary";
import {RawWanikaniSubject} from "../models/raw/RawWanikaniSubject";
import {RawWanikaniLevelProgressionPage} from "../models/raw/RawWanikaniLevelProgress";
import {RawWanikaniResetPage} from "../models/raw/RawWanikaniReset";
import {RawWanikaniAssignment} from "../models/raw/RawWanikaniAssignment";
import {WanikaniReview} from "../models/WanikaniReview";
import {throwIfRateLimited} from "../../util/ReactQueryUtils";
import {RawWanikaniUser} from "../models/raw/RawWanikaniUser";

/**
 * @deprecated use React Query cache
 */
// @ts-ignore
const memoryCache = new InMemoryCache<any>();
/**
 * @deprecated use React Query cache
 */
// @ts-ignore
const promiseCache = new PromiseCache();

const wanikaniApiUrl = APP_URLS.wanikaniApi;
const CACHE_KEYS: { [key: string]: string } = {
    apiKey: 'wanikani-api-key',
    reviews: 'wanikani-reviews',
    user: 'wanikani-user',
    login: 'wanikani-login',
    subjects: 'wanikani-subjects',
    assignments: 'wanikani-assignments',
    summary: 'wanikani-summary',
    levelProgression: 'wanikani-level-progressions',
    assignmentsForLevelPrefix: 'wanikani-assignment-for-level-',
    resets: 'wanikani-level-resets',
    srsSystems: 'wanikani-srs-systems',
}

const DEFAULT_WANIKANI_HEADERS = Object.freeze({
    'pragma': 'no-cache',
    'cache-control': 'no-cache',
});

const authHeader = (apiKey: string) => ({'Authorization': `Bearer ${apiKey}`})

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithAutoRetry(input: string, init: RequestInit) {
    let response = await fetch(input, init);

    // Retry logic if rate limit is hit
    let attempts = 0;
    while (response.status == 429 && attempts < 10) {
        await sleep(10_000);
        response = await fetch(input, init);
        attempts += 1;
    }
    return response;
}

async function fetchWanikaniApi(path: string, apiKey: string, headers?: { [key: string]: any } | null) {
    const options = {
        headers: {
            ...authHeader(apiKey),
            'pragma': 'no-cache',
            'cache-control': 'no-cache',
        }
    };
    if (!!headers) {
        options.headers = {
            ...options.headers,
            ...headers
        };
    }

    return fetchWithAutoRetry(`${wanikaniApiUrl}${path}`, options);
}

function apiKey(): string {
    return localStorage.getItem(CACHE_KEYS.apiKey) as string;
}

function saveApiKey(key: string | null) {
    if (!key) {
        localStorage.removeItem(CACHE_KEYS.apiKey);
    } else {
        localStorage.setItem(CACHE_KEYS.apiKey, key);
    }
}

async function fetchMultiPageRequest(path: string, startingId?: number) {
    const options = {
        headers: {
            ...authHeader(apiKey()),
        },
    };

    const startingPageParam = !!startingId ? `?page_after_id=${startingId}` : '';
    const firstPageResponse = await fetchWithAutoRetry(`${wanikaniApiUrl}${path}${startingPageParam}`, options);

    const firstPage = await firstPageResponse.json();
    let data = firstPage.data;
    let nextPage = firstPage.pages['next_url']

    while (!!nextPage) {
        const pageResponse = await fetchWithAutoRetry(nextPage, options);
        const page = await pageResponse.json();
        data = data.concat(page.data);
        nextPage = page.pages['next_url'];
    }
    return data;
}

async function getFromMemoryCacheOrFetchMultiPageRequest(path: string) {
    if (memoryCache.includes(path)) {
        return memoryCache.get(path);
    }
    const data = await fetchMultiPageRequest(path);
    memoryCache.put(path, data);
    return data;
}

export async function getAllAssignments(): Promise<RawWanikaniAssignment[]> {
    if (memoryCache.includes(CACHE_KEYS.assignments)) {
        const cachedValue = memoryCache.get(CACHE_KEYS.assignments);
        // Assignments ttl is 5 mins in Mem Cache
        if (cachedValue.lastUpdated > (Date.now() - 1000 * 60 * 5)) {
            return cachedValue.data;
        }
    }

    const cachedValue = await localForage.getItem<any>(CACHE_KEYS.assignments);
    if (!!cachedValue && cachedValue.lastUpdated > Date.now() - (1000 * 60 * 10)) {
        return cachedValue.data;
    }

    let assignments = await getFromMemoryCacheOrFetchMultiPageRequest('/v2/assignments');

    assignments = sortAndDeduplicateAssignments(assignments);

    const cacheObject = {
        data: assignments,
        lastUpdated: new Date().getTime(),
    };
    localForage.setItem(CACHE_KEYS.assignments, cacheObject);
    memoryCache.put(CACHE_KEYS.assignments, cacheObject);

    return assignments;
}

function sortAndDeduplicateAssignments(assignments: RawWanikaniAssignment[]) {
    const map: { [id: string]: RawWanikaniAssignment } = {};

    for (const assignment of assignments) {
        map[assignment.id] = assignment;
    }

    const result = [];

    for (const key of Object.keys(map)) {
        result.push(map[key]);
    }

    return result.sort((a, b) => a.id - b.id);
}

async function flushCache() {
    for (const key of Object.keys(CACHE_KEYS)) {
        await localForage.removeItem(CACHE_KEYS[key]);
    }

    for (let i = 0; i < 60; i++) {
        await localForage.removeItem(CACHE_KEYS.assignmentsForLevelPrefix + (i + 1));
    }
}

function ifModifiedSinceHeader(date: Date | number) {
    if (!date)
        return null;
    return {
        'If-Modified-Since': new Date(date).toUTCString()
    };
}

async function unwrapResponse(response: Response, fallbackValue: any) {
    if (response.status === 304) {
        return fallbackValue;
    }
    return await response.json();
}

async function fetchWithCache(path: string, cacheKey: string, ttl: number, _apiKey?: string) {
    const cachedValue = await localForage.getItem<any>(cacheKey);
    if (!!cachedValue && cachedValue.lastUpdated > Date.now() - ttl) {
        return cachedValue.data;
    }

    try {
        const key = !!_apiKey ? _apiKey : apiKey();
        const response = await fetchWanikaniApi(path, key,
            ifModifiedSinceHeader(cachedValue?.lastUpdated));

        if (response.status >= 400)
            throw new Error(`Failed load data, Path: ${path}, Response: ${response.status}`);

        const data = await unwrapResponse(response, cachedValue?.data);

        if (data?.code === 401)
            throw new Error('Failed to authenticate');

        localForage.setItem(cacheKey, {
            data: data,
            lastUpdated: new Date().getTime(),
        });
        return data;
    } catch (error) {
        if (!!cachedValue && !!cachedValue.data) {
            console.error('failed to fetch new data for ' + path + ', falling back to cached data...');
            return cachedValue.data;
        } else {
            throw error;
        }
    }
}

// Join meaning when multiple requests for the same endpoint come in at the same time,
// only send one request and return the data to all requests
type FetchFactory = typeof fetchWithCache;

/**
 * @deprecated Use React Query pattern instead
 */
function joinAndSendCacheableRequest(request: string, cacheKey: string, factory: FetchFactory, ttl = 1000, _apiKey?: string) {
    const name = request;
    let promise = promiseCache.get(name);
    if (!promise) {
        promise = factory(request, cacheKey, ttl, _apiKey);
        promiseCache.put(name, promise, ttl)
    } else {
        console.debug('joined promise', request)
    }
    return promise
}

async function getSummary(): Promise<RawWanikaniSummary> {
    return await joinAndSendCacheableRequest('/v2/summary', CACHE_KEYS.summary, fetchWithCache, 1000 * 60);
}

async function getResets(): Promise<RawWanikaniResetPage> {
    return await joinAndSendCacheableRequest('/v2/resets', CACHE_KEYS.resets, fetchWithCache, 1000 * 60 * 10);
}

async function getLevelProgress(): Promise<RawWanikaniLevelProgressionPage> {
    return await joinAndSendCacheableRequest('/v2/level_progressions', CACHE_KEYS.levelProgression, fetchWithCache, 1000 * 60);
}

export function getSubjects(): Promise<RawWanikaniSubject[]> {
    const fetchSubjects = async () => {
        if (memoryCache.includes(CACHE_KEYS.subjects)) {
            return memoryCache.get(CACHE_KEYS.subjects);
        }

        const cachedValue = await localForage.getItem<any>(CACHE_KEYS.subjects);
        if (!!cachedValue) {
            memoryCache.put(CACHE_KEYS.subjects, cachedValue.data);
            return cachedValue.data;
        }

        const subjects = await fetchMultiPageRequest('/v2/subjects');

        localForage.setItem(CACHE_KEYS.subjects, {
            data: subjects,
            lastUpdated: new Date().getTime(),
        });
        memoryCache.put(CACHE_KEYS.subjects, subjects);
        return subjects;
    }


    const name = 'getSubjects';
    let promise = promiseCache.get(name);
    if (!promise) {
        promise = fetchSubjects()
        promiseCache.put(name, promise, 60_000)
    } else {
        console.debug('joined promise', name)
    }
    return promise
}

function attemptLogin(apiKey: string) {
    return fetchWanikaniApi('/v2/user', apiKey);
}

function getReviews(): Promise<WanikaniReview[]> {
    const fetchReviews = () => {
        return new Promise((resolve, reject) => {
            WanikaniApiServiceRxJs.getReviewAsObservable()
                .subscribe({
                    next: event => {
                        if (event.status === EVENT_STATUS.COMPLETE) {
                            resolve(event.data);
                        }
                    },
                    error: err => reject(err)
                });
        })
    }

    const name = 'getReviews';
    let promise = promiseCache.get(name);
    if (!promise) {
        promise = fetchReviews()
        promiseCache.put(name, promise, 60_000)
    } else {
        console.debug('joined promise', name)
    }
    return promise;
}

async function getUser(): Promise<RawWanikaniUser> {
    const response = await fetch(APP_URLS.wanikaniApi + '/v2/user', {
        headers: {
            ...DEFAULT_WANIKANI_HEADERS,
            'Authorization': `Bearer ${apiKey()}`
        }
    });
    throwIfRateLimited(response);
    return await response.json();
}

export default {
    saveApiKey: saveApiKey,
    apiKey: apiKey,
    flushCache: flushCache,

    login: attemptLogin,
    getUser: getUser,
    getSummary: getSummary,
    getResets: getResets,
    getLevelProgress: getLevelProgress,
    getAllAssignments: getAllAssignments,
    getSubjects: getSubjects,
    getReviews: getReviews,
    getReviewAsObservable: WanikaniApiServiceRxJs.getReviewAsObservable,
}
