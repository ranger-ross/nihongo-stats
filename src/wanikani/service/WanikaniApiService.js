import { memoryCache } from "../../GlobalState"
import * as localForage from "localforage/dist/localforage"

const wanikaniApiUrl = 'https://api.wanikani.com';
const cacheKeys = {
    apiKey: 'wanikani-api-key',
    reviews: 'wanikani-all-reviews',
}

const authHeader = (apiKey) => ({ 'Authorization': `Bearer ${apiKey}` })

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
        headers: { ...authHeader(apiKey()) },
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
    if (memoryCache.includes('wanikani-assignments')) {
        const cachedValue = memoryCache.get('wanikani-assignments');
        // Assignments ttl is 5 mins in Mem Cache
        if (cachedValue.lastUpdated > (Date.now() - 1000 * 60 * 5)) {
            return cachedValue.data;
        }
    }

    const cachedValue = await localForage.getItem('wanikani-assignments');
    if (!!cachedValue && cachedValue.lastUpdated > Date.now() - (1000 * 60 * 10)) {
        return cachedValue.data;
    }

    const assignments = await getFromMemoryCacheOrFetchMultiPageRequest('/v2/assignments');

    const cacheObject = {
        data: assignments,
        lastUpdated: new Date().getTime(),
    };
    localForage.setItem('wanikani-assignments', cacheObject);
    memoryCache.put('wanikani-assignments', cacheObject);

    return assignments;
}

export default {
    saveApiKey: saveApiKey,
    apiKey: apiKey,

    login: async (apiKey) => {
        const user = await getFromMemoryCacheOrFetch('/v2/user', apiKey);
        saveApiKey(apiKey);
        return user;
    },
    getUser: async () => getFromMemoryCacheOrFetch('/v2/user'),
    getSummary: async () => {
        const cachedValue = await localForage.getItem('wanikani-summary');
        if (!!cachedValue && cachedValue.lastUpdated > Date.now() - (1000 * 60 * 5)) {
            return cachedValue.data;
        }

        const response = await fetchWanikaniApi('/v2/summary', apiKey());
        const summary = await response.json();

        localForage.setItem('wanikani-summary', {
            data: summary,
            lastUpdated: new Date().getTime(),
        });

        return summary;
    },
    getLevelProgress: async () => {
        const cachedValue = await localForage.getItem('wanikani-level-progressions');
        if (!!cachedValue && cachedValue.lastUpdated > Date.now() - (1000 * 60 * 60)) {
            return cachedValue.data;
        }

        const response = await fetchWanikaniApi('/v2/level_progressions', apiKey());
        const data = await response.json();

        localForage.setItem('wanikani-level-progressions', {
            data: data,
            lastUpdated: new Date().getTime(),
        });

        return data;
    },
    getAssignmentsForLevel: (level) => getFromMemoryCacheOrFetch('/v2/assignments?levels=' + level),
    getReviewStatistics: () => getFromMemoryCacheOrFetchMultiPageRequest('/v2/review_statistics'),
    getAllAssignments: getAllAssignments,
    getSubjects: async () => {
        if (memoryCache.includes('wanikani-subjects')) {
            return memoryCache.get('wanikani-subjects');
        }

        const cachedValue = await localForage.getItem('wanikani-subjects');
        if (!!cachedValue) {
            memoryCache.put('wanikani-subjects', cachedValue.data);
            return cachedValue.data;
        }

        const subjects = await fetchMultiPageRequest('/v2/subjects');

        localForage.setItem('wanikani-subjects', {
            data: subjects,
            lastUpdated: new Date().getTime(),
        });
        memoryCache.put('wanikani-subjects', subjects);
        return subjects;
    },
    getReviews: async () => {
        if (memoryCache.includes('wanikani-reviews')) {
            const cachedValue = memoryCache.get('wanikani-reviews');
            // Only check for new reviews every 60 seconds
            if (cachedValue.lastUpdated > (Date.now() - 1000 * 60)) {
                return cachedValue.data;
            }
        }

        const cachedValue = await localForage.getItem('wanikani-reviews');
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
        localForage.setItem('wanikani-reviews', cacheObject);
        memoryCache.put('wanikani-reviews', cacheObject);

        return reviews;
    },
}