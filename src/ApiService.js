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
    getReviewHeatMap: function (token) {
        return fetch('/user/review_heatmap');
    },
    test: function (token) {
        return fetch('/api/todos/1');
    }
};