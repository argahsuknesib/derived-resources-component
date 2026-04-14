/// <reference types="node" />
import type { Readable } from 'node:stream';
import type { Quad } from '@rdfjs/types';
import type { Guarded } from '@solid/community-server';
import { LRUCache } from 'lru-cache';
import type { QuadPatternExecutorArgs } from './QuadPatternExecutor';
import { QuadPatternExecutor } from './QuadPatternExecutor';
interface CachedQuads {
    quads: Quad[];
    checksum: string;
}
/**
 * A {@link QuadPatternExecutor} that caches results.
 * The identifier, the last time the resource was modified and the filter are combined to generate a checksum.
 * If the checksum of the cached entry no longer matches, it will be replaced with the current version
 *
 * Cache settings can be set to determine the max cache entries, or the max size for the entire cache (in bytes).
 */
export declare class CachedQuadPatternExecutor extends QuadPatternExecutor {
    protected readonly logger: import("global-logger-factory").Logger<unknown>;
    protected readonly source: QuadPatternExecutor;
    protected readonly cache: LRUCache<string, CachedQuads>;
    constructor(source: QuadPatternExecutor, cacheSettings?: {
        max?: number;
        maxSize?: number;
    });
    canHandle(input: QuadPatternExecutorArgs): Promise<void>;
    handle(input: QuadPatternExecutorArgs): Promise<Guarded<Readable>>;
    /**
     * Generates the key based on the identifier/filter.
     */
    protected getKey(input: QuadPatternExecutorArgs): string;
    /**
     * Generates the checksum based on the timestamp.
     */
    protected getChecksum(input: QuadPatternExecutorArgs): string;
    /**
     * Reads the data stream to add it to the cache with the given key.
     */
    protected cacheResult(key: string, checksum: string, data: Readable): void;
}
export {};
