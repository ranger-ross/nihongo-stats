const wanikaniApiUrl = 'https://api.wanikani.com'

const authHeader = (apiKey) => ({ 'Authorization': `Bearer ${apiKey}` })

function fetchWanikaniApi(path, apiKey) {
    return fetch(`${wanikaniApiUrl}${path}`, {
        headers: { ...authHeader(apiKey) }
    })
}

export default {
    getUser: (apiKey) => fetchWanikaniApi('/v2/user', apiKey),
    getReviews: (apiKey) => fetchWanikaniApi('/v2/reviews', apiKey),
    getLevelProgress: (apiKey) => fetchWanikaniApi('/v2/level_progressions', apiKey),
    getSubjects: async (apiKey) => {
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
        return data;
    },
}