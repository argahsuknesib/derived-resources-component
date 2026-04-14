import type { DerivationConfig } from '../../DerivationConfig';
import type { Filter } from '../Filter';
import { FilterParser } from './FilterParser';
/**
 * Applies mapping values to a filter string in a {@link DerivationConfig}.
 * Replaces `$key$` strings with the corresponding value in the mappings.
 */
export declare class MappingFilterParser<T = unknown> extends FilterParser<T> {
    protected readonly logger: import("global-logger-factory").Logger<unknown>;
    protected readonly source: FilterParser<T>;
    constructor(source: FilterParser<T>);
    handle(input: DerivationConfig): Promise<Filter<T>>;
}
