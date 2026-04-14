import type { DerivationConfig } from '../../DerivationConfig';
import type { Filter } from '../Filter';
import { FilterParser } from './FilterParser';
/**
 * Returns the filter input string as output data.
 */
export declare class InputFilterParser extends FilterParser<string> {
    handle(input: DerivationConfig): Promise<Filter<string>>;
}
