"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachedQuadPatternExecutor = void 0;
const node_stream_1 = require("node:stream");
const community_server_1 = require("@solid/community-server");
const global_logger_factory_1 = require("global-logger-factory");
const lru_cache_1 = require("lru-cache");
const rdf_string_1 = require("rdf-string");
const QuadPatternExecutor_1 = require("./QuadPatternExecutor");
function sizeCalculation({ quads }) {
    let size = 1;
    for (const quad of quads) {
        size += quad.subject.value.length;
        size += quad.predicate.value.length;
        size += quad.object.value.length;
        size += quad.graph.value.length;
    }
    return size;
}
/**
 * A {@link QuadPatternExecutor} that caches results.
 * The identifier, the last time the resource was modified and the filter are combined to generate a checksum.
 * If the checksum of the cached entry no longer matches, it will be replaced with the current version
 *
 * Cache settings can be set to determine the max cache entries, or the max size for the entire cache (in bytes).
 */
class CachedQuadPatternExecutor extends QuadPatternExecutor_1.QuadPatternExecutor {
    logger = (0, global_logger_factory_1.getLoggerFor)(this);
    source;
    cache;
    constructor(source, cacheSettings) {
        super();
        this.source = source;
        const max = cacheSettings?.max ?? 1000;
        // 100MB
        const maxSize = cacheSettings?.maxSize ?? 100000000;
        this.cache = new lru_cache_1.LRUCache({ max, maxSize, sizeCalculation });
    }
    async canHandle(input) {
        return this.source.canHandle(input);
    }
    async handle(input) {
        const key = this.getKey(input);
        const checksum = this.getChecksum(input);
        this.logger.debug(`Checking cache with key ${key} and checksum ${checksum}`);
        const cached = this.cache.get(key);
        if (cached && cached.checksum === checksum) {
            this.logger.debug(`Cache hit with key ${key} and checksum ${checksum}`);
            return (0, community_server_1.guardedStreamFrom)(cached.quads, { objectMode: true });
        }
        const result = await this.source.handle(input);
        // Pipe the stream twice, so we have 2 copies, one for the cache and one to return
        this.cacheResult(key, checksum, (0, community_server_1.pipeSafely)(result, new node_stream_1.PassThrough({ objectMode: true })));
        return (0, community_server_1.pipeSafely)(result, new node_stream_1.PassThrough({ objectMode: true }));
    }
    /**
     * Generates the key based on the identifier/filter.
     */
    getKey(input) {
        const subject = (0, rdf_string_1.termToString)(input.filter.subject);
        const predicate = (0, rdf_string_1.termToString)(input.filter.predicate);
        const object = (0, rdf_string_1.termToString)(input.filter.object);
        const graph = (0, rdf_string_1.termToString)(input.filter.graph);
        return `${input.representation.metadata.identifier.value} ${subject} ${predicate} ${object} ${graph}`;
    }
    /**
     * Generates the checksum based on the timestamp.
     */
    getChecksum(input) {
        const timestamp = input.representation.metadata.get(community_server_1.DC.terms.modified)?.value;
        if (!timestamp) {
            throw new community_server_1.InternalServerError('Index caching is only possible for backends that return a last modified timestamp.');
        }
        return timestamp;
    }
    /**
     * Reads the data stream to add it to the cache with the given key.
     */
    cacheResult(key, checksum, data) {
        const quads = [];
        data.on('data', (quad) => {
            quads.push(quad);
        });
        data.on('end', () => {
            this.cache.set(key, { checksum, quads });
        });
    }
}
exports.CachedQuadPatternExecutor = CachedQuadPatternExecutor;
//# sourceMappingURL=CachedQuadPatternExecutor.js.map