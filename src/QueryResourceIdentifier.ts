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
export function isQueryResourceIdentifier(identifier: ResourceIdentifier): identifier is QueryResourceIdentifier {
  return 'query' in identifier;
}

/**
 * Checks if the given value is a {@link ResourceIdentifier}.
 *
 * @param value
 */
export function isResourceIdentifier(value: unknown): value is ResourceIdentifier {
  return typeof value === 'object' &&
    value !== null &&
    'path' in value &&
    typeof value.path === 'string';
}
