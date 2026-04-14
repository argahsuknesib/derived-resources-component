import type { DerivationConfig } from '../../DerivationConfig';
import type { Filter } from '../Filter';
import { FilterParser } from './FilterParser';
/**
 * Parses a QPF filter.
 * Since QPF filters are just a string containing 'qpf' the actual data content of the filter object will be empty.
 * The checksum is determined based on the query parameters of the identifier.
 */
export declare class QpfFilterParser extends FilterParser {
    canHandle({ filter }: DerivationConfig): Promise<void>;
    handle(config: DerivationConfig): Promise<Filter<string>>;
}
