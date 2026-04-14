import type { IdentifierStrategy, ResourceStore } from '@solid/community-server';
import type { DerivationConfig } from '../../DerivationConfig';
import type { Filter } from '../Filter';
import { FilterParser } from './FilterParser';
/**
 * Interprets the filter string from a {@link DerivationConfig} as the URL of a resource.
 * The contents of that resource will then be passed along to the next parser.
 * Only supports resources stored in the given {@link ResourceStore}.g
 */
export declare class ResourceFilterParser<T = unknown> extends FilterParser<T> {
    protected readonly source: FilterParser<T>;
    protected readonly store: ResourceStore;
    protected readonly identifierStrategy: IdentifierStrategy;
    constructor(source: FilterParser<T>, store: ResourceStore, identifierStrategy: IdentifierStrategy);
    canHandle(input: DerivationConfig): Promise<void>;
    handle(input: DerivationConfig): Promise<Filter<T>>;
}
