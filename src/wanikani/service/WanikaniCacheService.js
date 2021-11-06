export default {
    saveWanikaniApiKey: (apiKey) => localStorage.setItem('wanikani-api-key', apiKey),
    loadWanikaniApiKey: () => localStorage.getItem('wanikani-api-key'),
    saveWanikaniUser: (user) => localStorage.setItem('wanikani-user', JSON.stringify(user)),
    loadWanikaniUser: () => !!localStorage.getItem('wanikani-user') ? JSON.parse(localStorage.getItem('wanikani-user')) : null,
};