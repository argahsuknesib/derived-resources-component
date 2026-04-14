"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedResourceStore = void 0;
const global_logger_factory_1 = require("global-logger-factory");
const community_server_1 = require("@solid/community-server");
const lru_cache_1 = require("lru-cache");
const CacheUtil_1 = require("./util/CacheUtil");
/**
 * A {@link ResourceStore} that caches representation responses.
 * Caching is done using the identifier as key, so this should be at the end of the store chain.
 * after content negotiation, as that results in different representations for the same identifier.
 *
 * Cache entries are invalidated after any successful write operation.
 * Because of this, this store does not work with worker threads,
 * as the thread invalidating the cache might not be the one that has that cache entry.
 *
 * Cache settings can be set to determine the max cache entries, or the max size for the entire cache (in bytes).
 * `maxSize` only works for binary data streams.
 */
class CachedResourceStore extends community_server_1.PassthroughStore {
    logger = (0, global_logger_factory_1.getLoggerFor)(this);
    metadataStrategy;
    cache;
    // Allows canceling caching if the resource was invalidated before caching was finished
    cacheProgress = {};
    constructor(args) {
        super(args.source);
        this.metadataStrategy = args.metadataStrategy;
        const max = args.cacheSettings?.max ?? 1000;
        // 100 MB
        const maxSize = args.cacheSettings?.maxSize ?? 100000000;
        this.cache = new lru_cache_1.LRUCache({ max, maxSize, sizeCalculation: CacheUtil_1.calculateCachedRepresentationSize });
    }
    async hasResource(identifier) {
        if (this.cache.has(identifier.path) || this.cacheProgress[identifier.path]) {
            return true;
        }
        return super.hasResource(identifier);
    }
    async getRepresentation(identifier, preferences, conditions) {
        this.logger.debug(`Checking cache with key ${identifier.path}`);
        const cached = this.cache.get(identifier.path);
        if (cached) {
            this.logger.debug(`Cache hit with key ${identifier.path}`);
            return (0, CacheUtil_1.cachedToRepresentation)(cached);
        }
        const representation = await super.getRepresentation(identifier, preferences, conditions);
        return this.cacheRepresentation(identifier, representation);
    }
    async addResource(container, representation, conditions) {
        const changes = await super.addResource(container, representation, conditions);
        this.invalidateCache(changes);
        return changes;
    }
    async setRepresentation(identifier, representation, conditions) {
        const changes = await super.setRepresentation(identifier, representation, conditions);
        this.invalidateCache(changes);
        return changes;
    }
    async modifyResource(identifier, patch, conditions) {
        const changes = await super.modifyResource(identifier, patch, conditions);
        this.invalidateCache(changes);
        return changes;
    }
    async deleteResource(identifier, conditions) {
        const changes = await super.deleteResource(identifier, conditions);
        this.invalidateCache(changes);
        return changes;
    }
    /**
     * Cache the given representation for the given identifier.
     * Returns a representation that can be used instead of the one given as input,
     * as that one will be read during the caching.
     * Caching will be done async, to prevent blocking the result while caching is in progress.
     * If caching is already in progress for the identifier,
     * no new caching process will be started.
     */
    cacheRepresentation(identifier, representation) {
        if (this.cacheProgress[identifier.path]) {
            return representation;
        }
        const [copy1, copy2] = (0, CacheUtil_1.duplicateRepresentation)(representation);
        this.cacheProgress[identifier.path] = { identifier, representation: copy1 };
        // Don't await so caching doesn't block returning a result
        (0, CacheUtil_1.representationToCached)(copy1).then((newCached) => {
            // Progress entry being removed implies that the result was invalidated in the meantime
            if (newCached && this.cacheProgress[identifier.path]?.identifier === identifier) {
                this.cache.set(identifier.path, newCached);
                delete this.cacheProgress[identifier.path];
            }
        }).catch(() => { });
        return copy2;
    }
    /**
     * Invalidates the cache for all identifiers in the {@link ChangeMap}.
     * Also invalidates the corresponding metadata resource,
     * or the corresponding subject resource in the case the identifier is a metadata resource,
     * since the CSS backend does not return those in the response (yet).
     */
    invalidateCache(changeMap) {
        for (const identifier of changeMap.keys()) {
            this.invalidateIdentifier(identifier);
            if (this.metadataStrategy.isAuxiliaryIdentifier(identifier)) {
                this.invalidateIdentifier(this.metadataStrategy.getSubjectIdentifier(identifier));
            }
            else {
                this.invalidateIdentifier(this.metadataStrategy.getAuxiliaryIdentifier(identifier));
            }
        }
    }
    /**
     * Invalidate caching of the given identifier.
     * This will also terminate any incomplete caching for that identifier.
     */
    invalidateIdentifier(identifier) {
        this.cache.delete(identifier.path);
        if (this.cacheProgress[identifier.path]) {
            this.cacheProgress[identifier.path].representation.data.destroy();
            delete this.cacheProgress[identifier.path];
        }
    }
}
exports.CachedResourceStore = CachedResourceStore;
//# sourceMappingURL=CachedResourceStore.js.map