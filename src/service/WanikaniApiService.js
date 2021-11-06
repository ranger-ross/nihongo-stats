export default {
    getUser: (apiKey) => {
        return fetch('https://api.wanikani.com/v2/user', {
            headers: {
                'Authorization': 'Bearer ' + apiKey
            }
        })
    }
}