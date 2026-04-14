import type { Quad } from '@rdfjs/types';
import type { DerivationConfig } from '../../DerivationConfig';
import type { Filter } from '../Filter';
import { FilterParser } from './FilterParser';
/**
 * Converts a partial representation of JSON quad into an actual Partial<Quad>.
 */
export declare class QuadPatternFilterParser extends FilterParser {
    protected readonly cache: WeakMap<DerivationConfig, Partial<Quad>>;
    canHandle(input: DerivationConfig): Promise<void>;
    handle(input: DerivationConfig): Promise<Filter<Partial<Quad>>>;
}
