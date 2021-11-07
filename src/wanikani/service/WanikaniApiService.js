const wanikaniApiUrl = 'https://api.wanikani.com'

const authHeader = (apiKey) => ({'Authorization': `Bearer ${apiKey}`})

function fetchWanikaniApi(path, apiKey) {
    return fetch(`${wanikaniApiUrl}${path}`, {
        headers: {
            ...authHeader(apiKey)
        }
    })
}

export default {
    getUser: (apiKey) => fetchWanikaniApi('/v2/user', apiKey),
    getReviews: (apiKey) => fetchWanikaniApi('/v2/reviews', apiKey),
    getLevelProgress: (apiKey) => fetchWanikaniApi('/v2/level_progressions', apiKey),
}