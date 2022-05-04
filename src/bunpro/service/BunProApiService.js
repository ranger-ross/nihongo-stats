import * as localForage from "localforage/dist/localforage"
import {AppUrls} from "../../Constants.js";
import {PromiseCache} from "../../util/PromiseCache.js";

const {apiProxy, bunproApi} = AppUrls;

const promiseCache = new PromiseCache();


// API Notes
// https://github.com/bunpro-srs/BunPro-iOS/blob/main/BunProKit/Sources/BunProKit/Server.swift#L16

const baseBunProUrl = `${apiProxy}/${bunproApi}`;

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
    return fetch(`${baseBunProUrl}/v4/user`, {headers: bunproHeaders(_apiKey)});
}

// Default timeout is 10 minutes
// Timeout = -1    =>   never timeout
async function sendCacheableRequest(request, cacheKey, timeout = 60_000) {
    const cachedValue = await localForage.getItem(cacheKey);
    if (!!cachedValue && (timeout !== -1 && cachedValue.lastUpdated > Date.now() - timeout)) {
        return cachedValue.data;
    }

    try {
        const response = await fetch(request.url, request.options);
        const data = await response.json();

        localForage.setItem(cacheKey, {
            lastUpdated: Date.now(),
            data: data
        });

        return data;
    } catch (error) {
        if (!!cachedValue && !!cachedValue.data) {
            console.error('failed to fetch new data for ' + request.url + ', falling back to cached data...');
            return cachedValue.data;
        } else {
            throw error;
        }
    }
}


// Join meaning when multiple requests for the same endpoint come in at the same time,
// only send one request and return the data to all requests
function joinAndSendCacheableRequest(request, cacheKey, timeout = 60_000, ttl = 1000) {
    const name = request.url;
    let promise = promiseCache.get(name);
    if (!promise) {
        promise = sendCacheableRequest(request, cacheKey, timeout);
        promiseCache.put(name, promise, ttl)
    }
    return promise
}

async function getGrammarPoints() {
    const response = await joinAndSendCacheableRequest(
        {
            url: `${baseBunProUrl}/v5/grammar_points`,
            options: {headers: bunproHeaders()}
        },
        cacheKeys.grammarPoints,
        1000 * 60 * 60 * 24 * 3
    );
    return response.data;
}

async function getUserProgress() {
    return await joinAndSendCacheableRequest(
        {
            url: `${baseBunProUrl}/v3/user/progress`,
            options: {headers: bunproHeaders()}
        },
        cacheKeys.userProgress,
        1000 * 60 * 3
    );
}

async function getAllReviews() {
    return await joinAndSendCacheableRequest(
        {
            url: `${baseBunProUrl}/v5/reviews/all_reviews_total`,
            options: {headers: bunproHeaders()}
        },
        cacheKeys.allReviews,
        1000 * 60 * 3
    );
}

async function getPendingReviews() {
    return await joinAndSendCacheableRequest(
        {
            url: `${baseBunProUrl}/v4/reviews/current_reviews`,
            options: {headers: bunproHeaders()}
        },
        cacheKeys.pendingReviews,
        1000 * 60 * 3
    );
}

async function getBunProUser() {
    return await joinAndSendCacheableRequest(
        {
            url: `${baseBunProUrl}/v5/user`,
            options: {headers: bunproHeaders()}
        },
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


async function flushCache() {
    for (const key of Object.keys(cacheKeys)) {
        await localForage.removeItem(cacheKeys[key]);
    }
}

export default {
    saveApiKey: saveApiKey,
    apiKey: apiKey,
    flushCache: flushCache,

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
