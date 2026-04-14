import type { Store } from 'n3';
import type { DerivationConfig } from '../../DerivationConfig';
import type { Filter } from '../Filter';
import { QuadFilterParser } from './QuadFilterParser';
/**
 * Interprets a filter with text/turtle data as a SHACL document.
 */
export declare class ShaclFilterParser extends QuadFilterParser {
    canHandle(input: DerivationConfig): Promise<void>;
    handle(input: DerivationConfig): Promise<Filter<Store>>;
}
