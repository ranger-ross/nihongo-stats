import { memoryCache } from "../../GlobalState"

const wanikaniApiUrl = 'https://api.wanikani.com'

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

export default {
    getUser: async (apiKey) => getFromMemoryCacheOrFetch('/v2/user', apiKey),
    getReviews: (apiKey) => getFromMemoryCacheOrFetch('/v2/reviews', apiKey),
    getLevelProgress: (apiKey) => getFromMemoryCacheOrFetch('/v2/level_progressions', apiKey),
    getAssignmentsForLevel: (apiKey, level) => getFromMemoryCacheOrFetch('/v2/assignments?levels=' + level, apiKey),
    getSubjects: async (apiKey) => {
        if (memoryCache.includes('wanikani-all-subjects')) {
            return memoryCache.get('wanikani-all-subjects');
        }
        const firstPage = await (await fetch(`${wanikaniApiUrl}/v2/subjects`, {
            headers: { ...authHeader(apiKey) },
            cache: 'force-cache'
        })).json()
        let data = firstPage.data;
        let nextPage = firstPage.pages['next_url']

        while (!!nextPage) {
            const page = await (await fetch(nextPage, {
                headers: authHeader(apiKey),
                cache: 'force-cache'
            })).json();
            data = data.concat(page.data);
            nextPage = page.pages['next_url'];
        }
        memoryCache.put('wanikani-all-subjects', data);
        return data;
    },
}