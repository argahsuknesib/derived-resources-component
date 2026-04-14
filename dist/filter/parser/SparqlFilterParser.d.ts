import type { DerivationConfig } from '../../DerivationConfig';
import type { Filter } from '../Filter';
import { FilterParser } from './FilterParser';
/**
 * Validates whether the filter string is a valid SPARQL query.
 */
export declare class SparqlFilterParser extends FilterParser<string> {
    protected readonly logger: import("global-logger-factory").Logger<unknown>;
    protected readonly parser: import("sparqljs").SparqlParser;
    canHandle(input: DerivationConfig): Promise<void>;
    handle(input: DerivationConfig): Promise<Filter<string>>;
}
