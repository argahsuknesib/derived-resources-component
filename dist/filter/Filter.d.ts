import type { NamedNode } from '@rdfjs/types';
import type { RepresentationMetadata } from '@solid/community-server';
/**
 * The result of parsing filter metadata.
 */
export interface Filter<T = unknown> {
    data: T;
    type: NamedNode;
    checksum?: string;
    metadata: RepresentationMetadata;
}
