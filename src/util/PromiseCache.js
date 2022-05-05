export function PromiseCache() {

    let cache = {};

    function get(name) {
        return cache[name];
    }

    function put(name, promise, ttl) {
        cache[name] = promise;
        const removeFromCache = () => cache[name] = null;
        promise.catch(removeFromCache)
        promise.finally(() => setTimeout(removeFromCache, ttl));
    }

    return {
        get,
        put
    };
}
