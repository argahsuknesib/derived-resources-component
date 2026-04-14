/// <reference types="node" />
/// <reference types="node" />
import type { Readable } from 'node:stream';
import type { Representation } from '@solid/community-server';
import { RepresentationMetadata } from '@solid/community-server';
/**
 * The cached version of a representation.
 */
export interface CachedRepresentation {
    /**
     * The data of the representation.
     * In case the stream was in object mode the value will be an array, otherwise a buffer.
     */
    data: Buffer | unknown[];
    metadata: RepresentationMetadata;
}
/**
 * Function that can be used as `sizeCalculation` for an LRU cache storing {@link CachedRepresentation}s.
 * The length of the data is used, so in the case of an array, the size of the entries is not taken into account.
 *
 * @param cached - The cached entry to determine the size of.
 */
export declare function calculateCachedRepresentationSize<T extends CachedRepresentation>(cached: T): number;
/**
 * Reads a data stream into an array or buffer, depending on if it is in object mode or not.
 *
 * @param stream - Data stream to read.
 */
export declare function readStream(stream: Readable): Promise<Buffer | unknown[]>;
/**
 * Generates a {@link Representation} based on a {@link CachedRepresentation}.
 * The generated value is not linked to the {@link CachedRepresentation},
 * so any changes to it will not impact the original.
 *
 * @param cached - {@link CachedRepresentation} to create a representation from
 */
export declare function cachedToRepresentation(cached: CachedRepresentation): Representation;
/**
 * Generates a {@link CachedRepresentation} based on a {@link Representation}.
 * The generated value is not linked to the {@link Representation},
 * so any changes to it will not impact the original.
 *
 * Returns undefined if there was an error, implying the data was not fully read.
 *
 * @param representation - Representation to convert.
 */
export declare function representationToCached(representation: Representation): Promise<CachedRepresentation | undefined>;
/**
 * Generates 2 {@link Representation}s from a single one.
 * After this the input representation should not be used any more.
 *
 * @param representation - Representation do duplicate.
 */
export declare function duplicateRepresentation(representation: Representation): [Representation, Representation];
