"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedFilterExecutor = void 0;
const node_crypto_1 = require("node:crypto");
const community_server_1 = require("@solid/community-server");
const global_logger_factory_1 = require("global-logger-factory");
const lru_cache_1 = require("lru-cache");
const CacheUtil_1 = require("../util/CacheUtil");
const FilterExecutor_1 = require("./FilterExecutor");
/**
 * A {@link FilterExecutor} that caches the result for faster reuse.
 * For each cache entry, a checksum is generated based on the filter,
 * all resource identifiers, and their corresponding timestamps.
 * If the checksum of the cached entry no longer matches, it will be replaced with the current version.
 *
 * Cache settings can be set to determine the max cache entries, or the max size for the entire cache (in bytes).
 */
class CachedFilterExecutor extends FilterExecutor_1.FilterExecutor {
    logger = (0, global_logger_factory_1.getLoggerFor)(this);
    source;
    cache;
    constructor(source, cacheSettings) {
        super();
        this.source = source;
        const max = cacheSettings?.max ?? 1000;
        // 100 MB
        const maxSize = cacheSettings?.maxSize ?? 100000000;
        this.cache = new lru_cache_1.LRUCache({ max, maxSize, sizeCalculation: CacheUtil_1.calculateCachedRepresentationSize });
    }
    async canHandle(input) {
        return this.source.canHandle(input);
    }
    async handle(input) {
        const key = input.config.identifier.path;
        const checksum = this.getChecksum(input);
        this.logger.debug(`Checking cache with key ${key} and ${checksum}`);
        // No checksum means the filter format did not allow one to be generated, so we don't attempt caching
        if (!checksum) {
            return this.source.handle(input);
        }
        const cached = this.cache.get(key);
        if (cached?.checksum === checksum) {
            this.logger.debug(`Cache hit with key ${key} and checksum ${checksum}`);
            return (0, CacheUtil_1.cachedToRepresentation)(cached);
        }
        const representation = await this.source.handle(input);
        return this.cacheRepresentation(key, checksum, representation);
    }
    /**
     * Cache the given representation with the given key/checksum.
     * Returns a representation that can be used instead of the one given as input,
     * as that one will be read during the caching.
     * Caching will be done async, to prevent blocking the result while caching is in progress.
     */
    cacheRepresentation(key, checksum, representation) {
        const [copy1, copy2] = (0, CacheUtil_1.duplicateRepresentation)(representation);
        // Don't await so the result can immediately be returned while caching
        (0, CacheUtil_1.representationToCached)(copy1).then((newCached) => {
            if (newCached) {
                this.cache.set(key, { ...newCached, checksum });
            }
        }).catch(() => { });
        return copy2;
    }
    /**
     * Generates a checksum based on the filter/resources/timestamps,
     * ensuring this value changes if anything impacting the derived resource changes.
     */
    getChecksum(input) {
        if (!input.filter.checksum) {
            return;
        }
        const resourceKeys = input.representations.map((representation) => {
            const id = representation.metadata.identifier.value;
            const timestamp = representation.metadata.get(community_server_1.DC.terms.modified)?.value;
            return `${id}:${timestamp}`;
        });
        resourceKeys.sort();
        return (0, node_crypto_1.createHash)('md5').update(`${input.filter.checksum} ${resourceKeys.join(' ')}`).digest('hex');
    }
}
exports.CachedFilterExecutor = CachedFilterExecutor;
//# sourceMappingURL=CachedFilterExecutor.js.map