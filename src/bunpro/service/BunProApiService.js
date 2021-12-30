// API Notes
// https://github.com/bunpro-srs/BunPro-iOS/blob/main/BunProKit/Sources/BunProKit/Server.swift#L16

// All Reviews
// https://bunpro.jp/api/v3/reviews/all_reviews_total
// Header Authorization: "Token token=<api-key>"

export default {
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