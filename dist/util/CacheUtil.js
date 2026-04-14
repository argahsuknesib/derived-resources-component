"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.duplicateRepresentation = exports.representationToCached = exports.cachedToRepresentation = exports.readStream = exports.calculateCachedRepresentationSize = void 0;
const node_stream_1 = require("node:stream");
const global_logger_factory_1 = require("global-logger-factory");
const community_server_1 = require("@solid/community-server");
const logger = (0, global_logger_factory_1.getLoggerFor)('CacheUtil');
/**
 * Function that can be used as `sizeCalculation` for an LRU cache storing {@link CachedRepresentation}s.
 * The length of the data is used, so in the case of an array, the size of the entries is not taken into account.
 *
 * @param cached - The cached entry to determine the size of.
 */
function calculateCachedRepresentationSize(cached) {
    // Needs to be a positive integer
    return cached.data.length + 1;
}
exports.calculateCachedRepresentationSize = calculateCachedRepresentationSize;
/**
 * Reads a data stream into an array or buffer, depending on if it is in object mode or not.
 *
 * @param stream - Data stream to read.
 */
async function readStream(stream) {
    if (stream.readableObjectMode) {
        const data = [];
        for await (const obj of stream) {
            data.push(obj);
        }
        return data;
    }
    const chunks = [];
    for await (const chunk of stream) {
        if (typeof chunk === 'string') {
            chunks.push(Buffer.from(chunk));
        }
        else if (Buffer.isBuffer(chunk)) {
            chunks.push(chunk);
        }
        else {
            throw new community_server_1.InternalServerError(`Streams that are not in object mode should output Buffers or strings, received ${typeof chunk}`);
        }
    }
    return Buffer.concat(chunks);
}
exports.readStream = readStream;
/**
 * Generates a {@link Representation} based on a {@link CachedRepresentation}.
 * The generated value is not linked to the {@link CachedRepresentation},
 * so any changes to it will not impact the original.
 *
 * @param cached - {@link CachedRepresentation} to create a representation from
 */
function cachedToRepresentation(cached) {
    // Copy the metadata quads to prevent changes to the original cached metadata
    const metadata = new community_server_1.RepresentationMetadata(cached.metadata);
    return new community_server_1.BasicRepresentation((0, community_server_1.guardedStreamFrom)(cached.data, { objectMode: Array.isArray(cached.data) }), metadata);
}
exports.cachedToRepresentation = cachedToRepresentation;
/**
 * Generates a {@link CachedRepresentation} based on a {@link Representation}.
 * The generated value is not linked to the {@link Representation},
 * so any changes to it will not impact the original.
 *
 * Returns undefined if there was an error, implying the data was not fully read.
 *
 * @param representation - Representation to convert.
 */
async function representationToCached(representation) {
    try {
        const data = await readStream(representation.data);
        const metadata = new community_server_1.RepresentationMetadata(representation.metadata);
        return { data, metadata };
    }
    catch (error) {
        // This just means the request was not interested in the data and closed the stream
        if (error.message !== 'Premature close') {
            logger.error(`Unable to cache representation for ${representation.metadata.identifier.value}: ${(0, community_server_1.createErrorMessage)(error)}`);
        }
    }
}
exports.representationToCached = representationToCached;
/**
 * Generates 2 {@link Representation}s from a single one.
 * After this the input representation should not be used any more.
 *
 * @param representation - Representation do duplicate.
 */
function duplicateRepresentation(representation) {
    const stream1 = (0, community_server_1.pipeSafely)(representation.data, new node_stream_1.PassThrough({ objectMode: representation.data.readableObjectMode }));
    const stream2 = (0, community_server_1.pipeSafely)(representation.data, new node_stream_1.PassThrough({ objectMode: representation.data.readableObjectMode }));
    return [
        new community_server_1.BasicRepresentation(stream1, new community_server_1.RepresentationMetadata(representation.metadata)),
        new community_server_1.BasicRepresentation(stream2, new community_server_1.RepresentationMetadata(representation.metadata)),
    ];
}
exports.duplicateRepresentation = duplicateRepresentation;
//# sourceMappingURL=CacheUtil.js.map