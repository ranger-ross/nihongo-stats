import {apiProxyUrl, bunproApiUrl} from "../../Constants.js";
import * as localForage from "localforage/dist/localforage"

// API Notes
// https://github.com/bunpro-srs/BunPro-iOS/blob/main/BunProKit/Sources/BunProKit/Server.swift#L16

const baseBunProUrl = `${apiProxyUrl}/${bunproApiUrl}`;

const cacheKeys = {
    apiKey: 'bunpro-api-key',
    grammarPoints: 'bunpro-grammar-points',
    userProgress: 'bunpro-user-progress',
    allReviews: 'bunpro-all-reviews',
    pendingReviews: 'bunpro-pending-reviews',
    user: 'bunpro-user',
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

// Auth Method
// Header Authorization: "Token token=<api-key>"
function bunproHeaders(token) {
    const _apiKey = !token ? apiKey() : token;
    return {
        "Authorization": `Token token=${_apiKey}`,
        "X-Requested-With": "nihongostats"
    };
}

function getRawBunProUser(token) {
    const _apiKey = !token ? apiKey() : token;
    return fetch(`${baseBunProUrl}/v3/user`, {headers: bunproHeaders(_apiKey)});
}

// Default timeout is 10 minutes
// Timeout = -1    =>   never timeout
async function sendCacheableRequest(request, cacheKey, timeout = 60_000) {
    const cachedValue = await localForage.getItem(cacheKey);
    if (!!cachedValue && (timeout !== -1 && cachedValue.lastUpdated > Date.now() - timeout)) {
        return cachedValue.data;
    }

    const response = await request;
    const data = await response.json();

    localForage.setItem(cacheKey, {
        lastUpdated: Date.now(),
        data: data
    });

    return data;
}

async function getGrammarPoints() {
    return await sendCacheableRequest(
        fetch(`${baseBunProUrl}/v3/grammar_points`, {headers: bunproHeaders()}),
        cacheKeys.grammarPoints,
        1000 * 60 * 10
    );
}

async function getUserProgress() {
    return await sendCacheableRequest(
        fetch(`${baseBunProUrl}/v3/user/progress`, {headers: bunproHeaders()}),
        cacheKeys.userProgress,
        1000 * 60 * 3
    );
}

async function getAllReviews() {
    return await sendCacheableRequest(
        fetch(`${baseBunProUrl}/v3/reviews/all_reviews_total`, {headers: bunproHeaders()}),
        cacheKeys.allReviews,
        1000 * 60 * 3
    );
}

async function getPendingReviews() {
    return await sendCacheableRequest(
        fetch(`${baseBunProUrl}/v3/reviews/current_reviews`, {headers: bunproHeaders()}),
        cacheKeys.pendingReviews,
        1000 * 60 * 3
    );
}

async function getBunProUser() {
    return await sendCacheableRequest(
        getRawBunProUser(),
        cacheKeys.user,
        1000 * 60
    );
}

async function login(apiKey) {
    const response = await getRawBunProUser(apiKey);

    if (response.status === 200) {
        const user = await response.json();
        saveApiKey(apiKey);
        return user;
    }
    console.error('Error logging to BunPro API', response);
    throw new Error('Error logging to BunPro API, [Status]: ' + response.status)
}


export default {
    saveApiKey: saveApiKey,
    apiKey: apiKey,

    login: login,
    getAllReviews: getAllReviews,
    getPendingReviews: getPendingReviews,
    getGrammarPoints: getGrammarPoints,
    getUserProgress: getUserProgress,
    getUser: getBunProUser,
    getStudyQueue: function (token) {
        return fetch('/api/user/' + token + '/study_queue');
    },
    getRecentItems: function (token, limit = 50) {
        return fetch('/api/user/' + token + '/recent_items/' + limit);
    },
};