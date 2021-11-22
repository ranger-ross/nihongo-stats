import { memoryCache } from "../../GlobalState"

const wanikaniApiUrl = 'https://api.wanikani.com';
const cacheKeys = {
    apiKey: 'wanikani-api-key',
    assignments: 'wanikani-all-assignments',
    subjects: 'wanikani-all-subjects',
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
    getReviews: () => getFromMemoryCacheOrFetch('/v2/reviews', apiKey()),
    getLevelProgress: () => getFromMemoryCacheOrFetch('/v2/level_progressions', apiKey()),
    getAssignmentsForLevel: (level) => getFromMemoryCacheOrFetch('/v2/assignments?levels=' + level, apiKey()),


    getAllAssignments: async () => {
        if (memoryCache.includes(cacheKeys.assignments)) {
            return memoryCache.get(cacheKeys.assignments);
        }
        const firstPage = await (await fetch(`${wanikaniApiUrl}/v2/assignments`, { headers: { ...authHeader(apiKey()) }, })).json()
        let data = firstPage.data;
        let nextPage = firstPage.pages['next_url']

        while (!!nextPage) {
            const page = await (await fetch(nextPage, { headers: authHeader(apiKey()) })).json();
            data = data.concat(page.data);
            nextPage = page.pages['next_url'];
        }
        memoryCache.put(cacheKeys.assignments, data);
        return data;
    },

    getSubjects: async () => {
        if (memoryCache.includes(cacheKeys.subjects)) {
            return memoryCache.get(cacheKeys.subjects);
        }
        const firstPage = await (await fetch(`${wanikaniApiUrl}/v2/subjects`, {
            headers: { ...authHeader(apiKey()) },
            cache: 'force-cache'
        })).json()
        let data = firstPage.data;
        let nextPage = firstPage.pages['next_url']

        while (!!nextPage) {
            const page = await (await fetch(nextPage, {
                headers: authHeader(apiKey()),
                cache: 'force-cache'
            })).json();
            data = data.concat(page.data);
            nextPage = page.pages['next_url'];
        }
        memoryCache.put(cacheKeys.subjects, data);
        return data;
    },
}