"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WeakStorage = void 0;
const community_server_1 = require("@solid/community-server");
/**
 * A {@link KeyValueStorage} that uses a {@link WeakMap} to store the values.
 * Because of this, the key value is expected to be an object and not a primitive value.
 */
class WeakStorage {
    cache;
    constructor() {
        this.cache = new WeakMap();
    }
    async get(key) {
        return this.cache.get(key);
    }
    async has(key) {
        return this.cache.has(key);
    }
    async set(key, value) {
        this.cache.set(key, value);
        return this;
    }
    async delete(key) {
        return this.cache.delete(key);
    }
    entries() {
        throw new community_server_1.NotImplementedHttpError('Entries call is not supported for WeakStorage.');
    }
}
exports.WeakStorage = WeakStorage;
//# sourceMappingURL=WeakStorage.js.map