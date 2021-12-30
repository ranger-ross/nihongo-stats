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

function bunproHeaders(token) {
    return {
        "Authorization": `Token token=${token}`,
        "X-Requested-With": "nihongostats"
    };
}

export default {
    getAllReviews: (token) => {
        return fetch(`${baseBunProUrl}/v3/reviews/all_reviews_total`, {headers: bunproHeaders(token)})
            .then(response => response.json());
    },
    getPendingReviews: (token) => {
        return fetch(`${baseBunProUrl}/v3/reviews/current_reviews`, {headers: bunproHeaders(token)})
            .then(response => response.json());
    },
    getUser: function (token) {
        return fetch('/api/user/' + token);
    },
    getStudyQueue: function (token) {
        return fetch('/api/user/' + token + '/study_queue');
    },
    getRecentItems: function (token, limit = 50) {
        return fetch('/api/user/' + token + '/recent_items/' + limit);
    },
};