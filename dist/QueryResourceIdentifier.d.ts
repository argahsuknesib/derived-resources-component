import type { ResourceIdentifier } from '@solid/community-server';
/**
 * A {@link ResourceIdentifier} that stores the query parameters as well.
 */
export interface QueryResourceIdentifier extends ResourceIdentifier {
    query: Record<string, string>;
}
/**
 * Checks if the given {@link ResourceIdentifier} is a {@link QueryResourceIdentifier}
 *
 * @param identifier
 */
export declare function isQueryResourceIdentifier(identifier: ResourceIdentifier): identifier is QueryResourceIdentifier;
