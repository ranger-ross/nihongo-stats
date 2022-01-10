function InMemoryCache() {
    let cache = {};

    function includes(key) {
        return key in cache && !!cache[key];
    }

    function get(key) {
        return cache[key];
    }

    function put(key, value) {
        cache[key] = value;
    }

    return {
        includes,
        get,
        put,
    };
}

export default InMemoryCache;