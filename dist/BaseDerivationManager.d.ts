import type { Representation, RepresentationMetadata, ResourceIdentifier } from '@solid/community-server';
import type { DerivationMatcher } from './config/DerivationMatcher';
import type { DerivationConfig } from './DerivationConfig';
import type { DerivationManager } from './DerivationManager';
import type { FilterHandler } from './filter/FilterHandler';
import type { SelectorHandler } from './selector/SelectorHandler';
interface MetadataDerivationManagerArgs {
    derivationMatcher: DerivationMatcher;
    selectorHandler: SelectorHandler;
    filterHandler: FilterHandler;
}
/**
 * Derives resource information with the use of several helper classes.
 * The {@link DerivationMatcher} determines the metadata that corresponds to the incoming identifier,
 * the {@link SelectorHandler} determines the input sources,
 * and the {@link FilterHandler} filters the relevant data from the input sources.
 */
export declare class BaseDerivationManager implements DerivationManager {
    protected logger: import("global-logger-factory").Logger<unknown>;
    protected derivationMatcher: DerivationMatcher;
    protected selectorHandler: SelectorHandler;
    protected filterHandler: FilterHandler;
    constructor(args: MetadataDerivationManagerArgs);
    /**
     * Finds the derivation triples in the given metadata that correspond to the given identifier, if any.
     */
    getDerivationConfig(identifier: ResourceIdentifier, metadata: RepresentationMetadata): Promise<DerivationConfig | undefined>;
    /**
     * Generates the representation for the derived resource.
     */
    deriveResource(identifier: ResourceIdentifier, config: DerivationConfig): Promise<Representation>;
}
export {};
