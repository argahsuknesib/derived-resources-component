import type { AuxiliaryIdentifierStrategy, ChangeMap, Conditions, Patch, Representation, RepresentationPreferences, ResourceIdentifier, ResourceStore, SingleThreaded } from '@solid/community-server';
import { PassthroughStore } from '@solid/community-server';
import { LRUCache } from 'lru-cache';
import type { CachedRepresentation } from './util/CacheUtil';
export interface CachedResourceStoreArgs {
    source: ResourceStore;
    metadataStrategy: AuxiliaryIdentifierStrategy;
    cacheSettings?: {
        max?: number;
        maxSize?: number;
    };
}
export interface CacheEntry {
    identifier: ResourceIdentifier;
    representation: Representation;
}
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
export declare class CachedResourceStore extends PassthroughStore implements SingleThreaded {
    protected readonly logger: import("global-logger-factory").Logger<unknown>;
    protected readonly metadataStrategy: AuxiliaryIdentifierStrategy;
    protected readonly cache: LRUCache<string, CachedRepresentation>;
    protected readonly cacheProgress: Record<string, CacheEntry>;
    constructor(args: CachedResourceStoreArgs);
    hasResource(identifier: ResourceIdentifier): Promise<boolean>;
    getRepresentation(identifier: ResourceIdentifier, preferences: RepresentationPreferences, conditions?: Conditions): Promise<Representation>;
    addResource(container: ResourceIdentifier, representation: Representation, conditions?: Conditions): Promise<ChangeMap>;
    setRepresentation(identifier: ResourceIdentifier, representation: Representation, conditions?: Conditions): Promise<ChangeMap>;
    modifyResource(identifier: ResourceIdentifier, patch: Patch, conditions?: Conditions): Promise<ChangeMap>;
    deleteResource(identifier: ResourceIdentifier, conditions?: Conditions): Promise<ChangeMap>;
    /**
     * Cache the given representation for the given identifier.
     * Returns a representation that can be used instead of the one given as input,
     * as that one will be read during the caching.
     * Caching will be done async, to prevent blocking the result while caching is in progress.
     * If caching is already in progress for the identifier,
     * no new caching process will be started.
     */
    protected cacheRepresentation(identifier: ResourceIdentifier, representation: Representation): Representation;
    /**
     * Invalidates the cache for all identifiers in the {@link ChangeMap}.
     * Also invalidates the corresponding metadata resource,
     * or the corresponding subject resource in the case the identifier is a metadata resource,
     * since the CSS backend does not return those in the response (yet).
     */
    protected invalidateCache(changeMap: ChangeMap): void;
    /**
     * Invalidate caching of the given identifier.
     * This will also terminate any incomplete caching for that identifier.
     */
    protected invalidateIdentifier(identifier: ResourceIdentifier): void;
}
