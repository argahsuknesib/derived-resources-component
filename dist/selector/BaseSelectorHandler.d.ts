import type { Representation, ResourceStore } from '@solid/community-server';
import type { DerivationConfig } from '../DerivationConfig';
import { SelectorHandler } from './SelectorHandler';
import type { SelectorParser } from './SelectorParser';
/**
 * Determines all the input resources by calling a {@link SelectorParser}
 * and then acquires their representations through the {@link ResourceStore}.
 */
export declare class BaseSelectorHandler extends SelectorHandler {
    protected readonly parser: SelectorParser;
    protected readonly store: ResourceStore;
    constructor(parser: SelectorParser, store: ResourceStore);
    canHandle(config: DerivationConfig): Promise<void>;
    handle(config: DerivationConfig): Promise<Representation[]>;
    protected configToRepresentations(config: DerivationConfig): AsyncIterableIterator<Representation>;
}
