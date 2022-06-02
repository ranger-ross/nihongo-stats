type CacheObject = {
    [key: string]: Promise<never> | null
};

export function PromiseCache() {

    const cache: CacheObject = {};

    function get(name: string) {
        return cache[name];
    }

    function put(name: string, promise: Promise<never>, ttl: number) {
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
