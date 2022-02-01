import * as localForage from "localforage/dist/localforage"
import InMemoryCache from "../../util/InMemoryCache.js";
import {AppUrls} from "../../Constants.js";

const memoryCache = new InMemoryCache();

const wanikaniApiUrl = AppUrls.wanikaniApi;
const cacheKeys = {
    apiKey: 'wanikani-api-key',
    reviews: 'wanikani-reviews',
    subjects: 'wanikani-subjects',
    assignments: 'wanikani-assignments',
    summary: 'wanikani-summary',
    levelProgression: 'wanikani-level-progressions',
}

const authHeader = (apiKey) => ({'Authorization': `Bearer ${apiKey}`})

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchWithAutoRetry(input, init) {
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

async function fetchWanikaniApi(path, apiKey, headers) {
    let options = {
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

async function getFromMemoryCacheOrFetch(path, _apiKey) {
    if (memoryCache.includes(path)) {
        return memoryCache.get(path);
    }
    const key = !!_apiKey ? _apiKey : apiKey();
    const response = await fetchWanikaniApi(path, key);
    const data = await response.json();

    memoryCache.put(path, data);
    return data;
}

function apiKey() {
    return localStorage.getItem(cacheKeys.apiKey)
}

function saveApiKey(key) {
    if (!key) {
        localStorage.removeItem(cacheKeys.apiKey);
    } else {
        localStorage.setItem(cacheKeys.apiKey, key);
    }
}

async function fetchMultiPageRequest(path, startingId) {
    const headers = {
        headers: {...authHeader(apiKey())},
    };

    const startingPageParam = !!startingId ? `?page_after_id=${startingId}` : '';
    const firstPageResponse = await fetchWithAutoRetry(`${wanikaniApiUrl}${path}${startingPageParam}`, headers);
    const firstPage = await firstPageResponse.json();
    let data = firstPage.data;
    let nextPage = firstPage.pages['next_url']

    while (!!nextPage) {
        let pageResponse = await fetchWithAutoRetry(nextPage, headers);
        let page = await pageResponse.json();
        data = data.concat(page.data);
        nextPage = page.pages['next_url'];
    }
    return data;
}

async function getFromMemoryCacheOrFetchMultiPageRequest(path) {
    if (memoryCache.includes(path)) {
        return memoryCache.get(path);
    }
    const data = await fetchMultiPageRequest(path);
    memoryCache.put(path, data);
    return data;
}

async function getAllAssignments() {
    if (memoryCache.includes(cacheKeys.assignments)) {
        const cachedValue = memoryCache.get(cacheKeys.assignments);
        // Assignments ttl is 5 mins in Mem Cache
        if (cachedValue.lastUpdated > (Date.now() - 1000 * 60 * 5)) {
            return cachedValue.data;
        }
    }

    const cachedValue = await localForage.getItem(cacheKeys.assignments);
    if (!!cachedValue && cachedValue.lastUpdated > Date.now() - (1000 * 60 * 10)) {
        return cachedValue.data;
    }

    const assignments = await getFromMemoryCacheOrFetchMultiPageRequest('/v2/assignments');

    const cacheObject = {
        data: assignments,
        lastUpdated: new Date().getTime(),
    };
    localForage.setItem(cacheKeys.assignments, cacheObject);
    memoryCache.put(cacheKeys.assignments, cacheObject);

    return assignments;
}

async function flushCache() {
    for (const key of Object.keys(cacheKeys)) {
        await localForage.removeItem(cacheKeys[key]);
    }
}

async function getSummary() {
    const cachedValue = await localForage.getItem(cacheKeys.summary);
    if (!!cachedValue && cachedValue.lastUpdated > Date.now() - (1000 * 60 * 5)) {
        return cachedValue.data;
    }

    const response = await fetchWanikaniApi('/v2/summary', apiKey());
    const summary = await response.json();

    localForage.setItem(cacheKeys.summary, {
        data: summary,
        lastUpdated: new Date().getTime(),
    });

    return summary;
}

export default {
    saveApiKey: saveApiKey,
    apiKey: apiKey,
    flushCache: flushCache,


    login: async (apiKey) => {
        const user = await getFromMemoryCacheOrFetch('/v2/user', apiKey);
        saveApiKey(apiKey);
        return user;
    },
    getUser: async () => getFromMemoryCacheOrFetch('/v2/user'),
    getSummary: getSummary,
    getLevelProgress: async () => {
        const cachedValue = await localForage.getItem(cacheKeys.levelProgression);
        if (!!cachedValue && cachedValue.lastUpdated > Date.now() - (1000 * 60 * 60)) {
            return cachedValue.data;
        }

        const response = await fetchWanikaniApi('/v2/level_progressions', apiKey());
        const data = await response.json();

        localForage.setItem(cacheKeys.levelProgression, {
            data: data,
            lastUpdated: new Date().getTime(),
        });

        return data;
    },
    getAssignmentsForLevel: (level) => getFromMemoryCacheOrFetch('/v2/assignments?levels=' + level),
    getReviewStatistics: () => getFromMemoryCacheOrFetchMultiPageRequest('/v2/review_statistics'),
    getAllAssignments: getAllAssignments,
    getSubjects: async () => {
        if (memoryCache.includes(cacheKeys.subjects)) {
            return memoryCache.get(cacheKeys.subjects);
        }

        const cachedValue = await localForage.getItem(cacheKeys.subjects);
        if (!!cachedValue) {
            memoryCache.put(cacheKeys.subjects, cachedValue.data);
            return cachedValue.data;
        }

        const subjects = await fetchMultiPageRequest('/v2/subjects');

        localForage.setItem(cacheKeys.subjects, {
            data: subjects,
            lastUpdated: new Date().getTime(),
        });
        memoryCache.put(cacheKeys.subjects, subjects);
        return subjects;
    },
    getReviews: async () => {
        if (memoryCache.includes(cacheKeys.reviews)) {
            const cachedValue = memoryCache.get(cacheKeys.reviews);
            // Only check for new reviews every 60 seconds
            if (cachedValue.lastUpdated > (Date.now() - 1000 * 60)) {
                return cachedValue.data;
            }
        }

        const cachedValue = await localForage.getItem(cacheKeys.reviews);
        let reviews;
        if (!!cachedValue) {
            reviews = cachedValue.data;
            const lastId = reviews[reviews.length - 1].id;
            const newData = await fetchMultiPageRequest('/v2/reviews', lastId);
            reviews.push(...newData);
        } else {
            reviews = await fetchMultiPageRequest('/v2/reviews');
        }

        const cacheObject = {
            data: reviews,
            lastUpdated: new Date().getTime(),
        };
        localForage.setItem(cacheKeys.reviews, cacheObject);
        memoryCache.put(cacheKeys.reviews, cacheObject);

        return reviews;
    },
    getPendingLessonsAndReviews: async () => {
        const summary = await getSummary();
        let lessons = 0;
        for (const group of summary.data.lessons) {
            if (new Date(group['available_at']).getTime() < Date.now()) {
                lessons += group['subject_ids'].length;
            }
        }

        let reviews = 0;
        for (const group of summary.data.reviews) {
            if (new Date(group['available_at']).getTime() < Date.now()) {
                reviews += group['subject_ids'].length;
            }
        }
        return {
            lessons,
            reviews
        };
    }
}