export function PromiseCache() {

    let cache = {};

    function get(name) {
        return cache[name];
    }

    function put(name, promise, ttl) {
        cache[name] = promise;
        promise.finally(() => setTimeout(() => {
            cache[name] = null;
        }, ttl));
    }

    return {
        get,
        put
    };
}
