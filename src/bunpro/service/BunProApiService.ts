import * as localForage from "localforage"
import {APP_URLS} from "../../Constants";
import {PromiseCache} from "../../util/PromiseCache";
import {RawBunProGrammarPoint} from "../models/raw/RawBunProGrammarPoint";
import {mapBunProGrammarPoint, mapBunProReviewResponse, mapBunProUser} from "./BunProMappingService";
import {BunProUser} from "../models/BunProUser";
import {BunProGrammarPoint} from "../models/BunProGrammarPoint";
import { BunProReviewsResponse } from "../models/BunProReviewsResponse";

const {apiProxy, bunproApi} = APP_URLS;

type BunProRequest = {
    url: string,
    options: RequestInit
};

// @ts-ignore
const promiseCache = new PromiseCache<any>();


// API Notes
// https://www.bunpro.jp/api/v4/docs
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

function apiKey(): string {
    return localStorage.getItem(cacheKeys.apiKey) as string
}

function saveApiKey(key: string | null) {
    if (!key) {
        localStorage.removeItem(cacheKeys.apiKey);
    } else {
        localStorage.setItem(cacheKeys.apiKey, key);
    }
}

// Auth Method
// Header Authorization: "Token token=<api-key>"
function bunproHeaders(token?: string): { [key: string]: string } {
    const _apiKey = !token ? apiKey() : token;
    return {
        "Authorization": `Token token=${_apiKey}`,
        "X-Requested-With": "nihongostats"
    };
}

function getRawBunProUser(token: string) {
    const _apiKey = !token ? apiKey() : token;
    return fetch(`${baseBunProUrl}/v4/user`, {headers: bunproHeaders(_apiKey)});
}

// Default timeout is 10 minutes
// Timeout = -1    =>   never timeout
async function sendCacheableRequest(request: BunProRequest, cacheKey: string, timeout = 60_000) {
    const cachedValue = await localForage.getItem<any>(cacheKey);
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
function joinAndSendCacheableRequest(request: BunProRequest, cacheKey: string, timeout = 60_000, ttl = 1000) {
    const name = request.url;
    let promise = promiseCache.get(name);
    if (!promise) {
        promise = sendCacheableRequest(request, cacheKey, timeout);
        promiseCache.put(name, promise, ttl)
    }
    return promise
}

async function getGrammarPoints(): Promise<BunProGrammarPoint[]> {
    const response = await joinAndSendCacheableRequest(
        {
            url: `${baseBunProUrl}/v5/grammar_points`,
            options: {headers: bunproHeaders()}
        },
        cacheKeys.grammarPoints,
        1000 * 60 * 60 * 24 * 3
    );
    return response.data.map((gp: RawBunProGrammarPoint) => mapBunProGrammarPoint(gp));
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

async function getAllReviews(): Promise<BunProReviewsResponse> {
    const response = await joinAndSendCacheableRequest(
        {
            url: `${baseBunProUrl}/v5/reviews/all_reviews_total`,
            options: {headers: bunproHeaders()}
        },
        cacheKeys.allReviews,
        1000 * 60 * 3
    );

    return mapBunProReviewResponse(response);
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

async function getBunProUser(): Promise<BunProUser> {
    const rawUser = await joinAndSendCacheableRequest(
        {
            url: `${baseBunProUrl}/v5/user`,
            options: {headers: bunproHeaders()}
        },
        cacheKeys.user,
        1000 * 60
    );
    return mapBunProUser(rawUser);
}

async function login(apiKey: string) {
    const response = await getRawBunProUser(apiKey);

    if (response.ok) {
        const user = await response.json();
        saveApiKey(apiKey);
        return user;
    }
    console.error('Error logging to BunPro API', response);
    throw new Error('Error logging to BunPro API, [Status]: ' + response.status)
}


async function flushCache() {
    for (const key of Object.keys(cacheKeys)) {
        // @ts-ignore
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
    getStudyQueue: function (token: string) {
        return fetch('/api/user/' + token + '/study_queue');
    },
    getRecentItems: function (token: string, limit = 50) {
        return fetch('/api/user/' + token + '/recent_items/' + limit);
    },
};
