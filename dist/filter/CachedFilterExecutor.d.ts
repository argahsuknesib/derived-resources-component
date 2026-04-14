import type { Representation } from '@solid/community-server';
import { LRUCache } from 'lru-cache';
import type { CachedRepresentation } from '../util/CacheUtil';
import type { FilterExecutorInput } from './FilterExecutor';
import { FilterExecutor } from './FilterExecutor';
interface ChecksumCachedRepresentation extends CachedRepresentation {
    checksum: string;
}
/**
 * A {@link FilterExecutor} that caches the result for faster reuse.
 * For each cache entry, a checksum is generated based on the filter,
 * all resource identifiers, and their corresponding timestamps.
 * If the checksum of the cached entry no longer matches, it will be replaced with the current version.
 *
 * Cache settings can be set to determine the max cache entries, or the max size for the entire cache (in bytes).
 */
export declare class CachedFilterExecutor extends FilterExecutor {
    protected readonly logger: import("global-logger-factory").Logger<unknown>;
    protected readonly source: FilterExecutor;
    protected readonly cache: LRUCache<string, ChecksumCachedRepresentation>;
    constructor(source: FilterExecutor, cacheSettings?: {
        max?: number;
        maxSize?: number;
    });
    canHandle(input: FilterExecutorInput): Promise<void>;
    handle(input: FilterExecutorInput): Promise<Representation>;
    /**
     * Cache the given representation with the given key/checksum.
     * Returns a representation that can be used instead of the one given as input,
     * as that one will be read during the caching.
     * Caching will be done async, to prevent blocking the result while caching is in progress.
     */
    protected cacheRepresentation(key: string, checksum: string, representation: Representation): Representation;
    /**
     * Generates a checksum based on the filter/resources/timestamps,
     * ensuring this value changes if anything impacting the derived resource changes.
     */
    protected getChecksum(input: FilterExecutorInput): string | undefined;
}
export {};
