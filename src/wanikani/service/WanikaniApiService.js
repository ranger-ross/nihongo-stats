import { memoryCache } from "../../GlobalState"

const wanikaniApiUrl = 'https://api.wanikani.com';
const cacheKeys = {
    apiKey: 'wanikani-api-key',
}

const authHeader = (apiKey) => ({ 'Authorization': `Bearer ${apiKey}` })

function fetchWanikaniApi(path, apiKey) {
    return fetch(`${wanikaniApiUrl}${path}`, {
        headers: { ...authHeader(apiKey) }
    })
}

async function getFromMemoryCacheOrFetch(path, apiKey) {
    if (memoryCache.includes(path)) {
        return memoryCache.get(path);
    }
    const response = await fetchWanikaniApi(path, apiKey);
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

async function getFromMemoryCacheOrFetchMultiPageRequest(path, isForce) {
    if (memoryCache.includes(path)) {
        return memoryCache.get(path);
    }

    const headers = {
        headers: { ...authHeader(apiKey()) },
        cache: isForce ? 'force-cache' : undefined
    };


    const firstPage = await (await fetch(`${wanikaniApiUrl}${path}`, headers)).json()
    let data = firstPage.data;
    let nextPage = firstPage.pages['next_url']

    while (!!nextPage) {
        const page = await (await fetch(nextPage, headers)).json();
        data = data.concat(page.data);
        nextPage = page.pages['next_url'];
    }
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
    getUser: async () => getFromMemoryCacheOrFetch('/v2/user', apiKey()),
    getSummary: () => getFromMemoryCacheOrFetch('/v2/summary', apiKey()),
    getLevelProgress: () => getFromMemoryCacheOrFetch('/v2/level_progressions', apiKey()),
    getAssignmentsForLevel: (level) => getFromMemoryCacheOrFetch('/v2/assignments?levels=' + level, apiKey()),

    getReviewStatistics: () => getFromMemoryCacheOrFetchMultiPageRequest('/v2/review_statistics'),
    getAllAssignments: () => getFromMemoryCacheOrFetchMultiPageRequest('/v2/assignments'),
    getReviews: () => getFromMemoryCacheOrFetchMultiPageRequest('/v2/reviews'),
    getSubjects: () => getFromMemoryCacheOrFetchMultiPageRequest('/v2/subjects', true),

}