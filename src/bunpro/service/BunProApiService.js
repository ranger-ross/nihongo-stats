// API Notes
// https://github.com/bunpro-srs/BunPro-iOS/blob/main/BunProKit/Sources/BunProKit/Server.swift#L16

// Auth Method
// Header Authorization: "Token token=<api-key>"


// All Reviews
// https://bunpro.jp/api/v3/reviews/all_reviews_total
//
// Current Reviews
// https://bunpro.jp/api/v3/reviews/current_reviews

import {apiProxyUrl, bunproApiUrl} from "../../Constants.js";

const baseBunProUrl = `${apiProxyUrl}/${bunproApiUrl}`;

const cacheKeys = {
    apiKey: 'bunpro-api-key',
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

function bunproHeaders(token) {
    const _apiKey = !token ? apiKey() : token;
    return {
        "Authorization": `Token token=${_apiKey}`,
        "X-Requested-With": "nihongostats"
    };
}

function getBunProUser(token) {
    const _apiKey = !token ? apiKey() : token;
    return fetch(`${baseBunProUrl}/v3/user`, {headers: bunproHeaders(_apiKey)});
}

export default {
    saveApiKey: saveApiKey,
    apiKey: apiKey,

    login: async (apiKey) => {
        const response = await getBunProUser(apiKey);

        if (response.status === 200) {
            const user = await response.json();
            saveApiKey(apiKey);
            return user;
        }
        console.error('Error logging to BunPro API', response);
        throw new Error('Error logging to BunPro API, [Status]: ' + response.status)
    },

    getAllReviews: () => {
        return fetch(`${baseBunProUrl}/v3/reviews/all_reviews_total`, {headers: bunproHeaders()})
            .then(response => response.json());
    },
    getPendingReviews: () => {
        return fetch(`${baseBunProUrl}/v3/reviews/current_reviews`, {headers: bunproHeaders()})
            .then(response => response.json());
    },
    getUser: () => {
        return getBunProUser()
            .then(response => response.json());
    },
    getStudyQueue: function (token) {
        return fetch('/api/user/' + token + '/study_queue');
    },
    getRecentItems: function (token, limit = 50) {
        return fetch('/api/user/' + token + '/recent_items/' + limit);
    },
};