import * as localForage from "localforage"
import {APP_URLS} from "../../Constants";
import {RawBunProGrammarPoint} from "../models/raw/RawBunProGrammarPoint";
import {RawBunProReviewsResponse} from "../models/raw/RawBunProReviewsResponse";
import {RawBunProUser} from "../models/raw/RawBunProUser";

const {apiProxy, bunproApi} = APP_URLS;

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

type GrammarPointResponse = { data: RawBunProGrammarPoint[] }

async function getGrammarPoints(): Promise<GrammarPointResponse> {
    const response = await fetch(`${baseBunProUrl}/v5/grammar_points`, {
        headers: bunproHeaders()
    });
    return await response.json();
}

async function getUserProgress() {
    const response = await fetch(`${baseBunProUrl}/v3/user/progress`, {
        headers: bunproHeaders()
    });
    return await response.json();
}

async function getAllReviews(): Promise<RawBunProReviewsResponse> {
    const response = await fetch(`${baseBunProUrl}/v5/reviews/all_reviews_total`, {
        headers: bunproHeaders()
    });
    return await response.json();
}

// TODO: Map to non-raw data type
async function getPendingReviews() {
    const response = await fetch(`${baseBunProUrl}/v4/reviews/current_reviews`, {
        headers: bunproHeaders()
    });
    return await response.json();
}

async function getBunProUser(): Promise<RawBunProUser> {
    const response = await fetch(`${baseBunProUrl}/v5/user`, {
        headers: bunproHeaders()
    });
    return await response.json();
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
