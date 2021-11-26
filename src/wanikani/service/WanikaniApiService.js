import { memoryCache } from "../../GlobalState"

const cacheModes = {
    default: 'default',
    none: 'none',
    all: 'cache-all',
    allButLastPage: 'cache-all-but-last',
};

const wanikaniApiUrl = 'https://api.wanikani.com';
const cacheKeys = {
    apiKey: 'wanikani-api-key',
    reviews: 'wanikani-all-reviews',
}

const authHeader = (apiKey) => ({ 'Authorization': `Bearer ${apiKey}` })

function fetchWanikaniApi(path, apiKey, cacheMode) {
    let options = {
        headers: { ...authHeader(apiKey) }
    };
    if (cacheModes.none == cacheMode) {
        options.cache = "no-cache";
    }
    return fetch(`${wanikaniApiUrl}${path}`, options);
}

async function getFromMemoryCacheOrFetch(path, _apiKey, cacheMode) {
    if (memoryCache.includes(path)) {
        return memoryCache.get(path);
    }
    const key = !!_apiKey ? _apiKey : apiKey();
    const response = await fetchWanikaniApi(path, key, cacheMode);
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

async function fetchMultiPageRequest(path, cacheMode = cacheModes.none) {
    const headers = {
        headers: { ...authHeader(apiKey()) },
        cache: [cacheModes.all, cacheModes.allButLastPage].includes(cacheMode) ? 'force-cache' : undefined
    };

    const firstPageResponse = await fetch(`${wanikaniApiUrl}${path}`, headers);
    const firstPage = await firstPageResponse.json();
    let data = firstPage.data;
    let nextPage = firstPage.pages['next_url']

    while (!!nextPage) {
        let pageResponse = await fetch(nextPage, headers);
        let page = await pageResponse.json();

        if (cacheMode == cacheModes.allButLastPage && !page.pages['next_url']) {
            pageResponse = await fetch(nextPage, {
                ...headers,
                cache: undefined
            });
            page = await pageResponse.json();
        }

        data = data.concat(page.data);
        nextPage = page.pages['next_url'];
    }
    return data;
}

async function getFromMemoryCacheOrFetchMultiPageRequest(path, cacheMode = cacheModes.none) {
    if (memoryCache.includes(path)) {
        return memoryCache.get(path);
    }
    const data = await fetchMultiPageRequest(path, cacheMode);
    memoryCache.put(path, data);
    return data;
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
    getSummary: () => getFromMemoryCacheOrFetch('/v2/summary', null, cacheModes.none),
    getLevelProgress: () => getFromMemoryCacheOrFetch('/v2/level_progressions'),
    getAssignmentsForLevel: (level) => getFromMemoryCacheOrFetch('/v2/assignments?levels=' + level),

    getReviewStatistics: () => getFromMemoryCacheOrFetchMultiPageRequest('/v2/review_statistics'),
    getAllAssignments: () => getFromMemoryCacheOrFetchMultiPageRequest('/v2/assignments'),
    getSubjects: () => getFromMemoryCacheOrFetchMultiPageRequest('/v2/subjects', cacheModes.all),
    getReviews: () => getFromMemoryCacheOrFetchMultiPageRequest('/v2/reviews', cacheModes.allButLastPage),


}