const wanikaniApiUrl = 'https://api.wanikani.com'

const authHeader = (apiKey) => ({'Authorization': `Bearer ${apiKey}`})

export default {
    getUser: (apiKey) => {
        return fetch(`${wanikaniApiUrl}/v2/user`, {
            headers: {
                ...authHeader(apiKey)
            }
        })
    }
}