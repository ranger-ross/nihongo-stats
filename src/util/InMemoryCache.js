class InMemoryCache {
    cache = {};

    includes(key) {
        return key in this.cache;
    }

    get(key) {
        return this.cache[key];
    }

    put(key, value) {
        this.cache[key] = value;
    }

}

export default InMemoryCache;