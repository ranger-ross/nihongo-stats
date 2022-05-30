type CacheObject<T> = {
    [key: string]: T
};

function InMemoryCache<T>() {
    const cache: CacheObject<T> = {};

    function includes(key: string) {
        return key in cache && !!cache[key];
    }

    function get(key: string) {
        return cache[key];
    }

    function put(key: string, value: T) {
        cache[key] = value;
    }

    return {
        includes,
        get,
        put,
    };
}

export default InMemoryCache;
