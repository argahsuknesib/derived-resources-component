import { Store } from 'n3';
import type { DerivationConfig } from '../../DerivationConfig';
import type { Filter } from '../Filter';
import { FilterParser } from './FilterParser';
/**
 * Interprets the config filter string as turtle and parses it into an N3.js store.
 * Parsing already happens in the `canHandle` call as the parsing is used to verify if the input is valid turtle.
 * The intermediate result is stored in a {@link WeakMap} to return on the `handle` call.
 */
export declare class QuadFilterParser extends FilterParser<Store> {
    protected readonly logger: import("global-logger-factory").Logger<unknown>;
    protected readonly cache: WeakMap<DerivationConfig, Store<import("rdf-js").Quad, import("n3").Quad, import("rdf-js").Quad, import("rdf-js").Quad>>;
    canHandle(input: DerivationConfig): Promise<void>;
    handle(input: DerivationConfig): Promise<Filter<Store>>;
}
