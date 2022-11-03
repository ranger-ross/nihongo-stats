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
    const assignments = await getFromMemoryCacheOrFetchMultiPageRequest('/v2/assignments');
    return sortAndDeduplicateAssignments(assignments);
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

export function getSubjects(): Promise<RawWanikaniSubject[]> {
    return fetchMultiPageRequest('/v2/subjects');
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

function defaultWanikaniOptions(): RequestInit {
    return {
        headers: {
            ...DEFAULT_WANIKANI_HEADERS,
            'Authorization': `Bearer ${apiKey()}`
        }
    }
}

export async function fetchWanikani(url: string): Promise<any> {
    const response = await fetch(url, defaultWanikaniOptions());
    throwIfRateLimited(response);
    return await response.json();
}

async function getUser(): Promise<RawWanikaniUser> {
    return fetchWanikani(APP_URLS.wanikaniApi + '/v2/user')
}

async function getResets(): Promise<RawWanikaniResetPage> {
    return fetchWanikani(APP_URLS.wanikaniApi + '/v2/resets')
}

async function getSummary(): Promise<RawWanikaniSummary> {
    return fetchWanikani(APP_URLS.wanikaniApi + '/v2/summary')
}

async function getLevelProgress(): Promise<RawWanikaniLevelProgressionPage> {
    return fetchWanikani(APP_URLS.wanikaniApi + '/v2/level_progressions')
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
