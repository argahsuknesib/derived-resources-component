import type { ChangeMap, Conditions, IdentifierStrategy, Patch, Representation, RepresentationConverter, RepresentationPreferences, ResourceIdentifier, ResourceStore } from '@solid/community-server';
import { PassthroughStore } from '@solid/community-server';
import type { DerivationManager } from './DerivationManager';
/**
 * A {@link ResourceStore} which adds support for derived resources using a {@link DerivationManager}.
 * Assumes preferences will be handled by a previous store in the chain.
 * Prevents writing to a resource if it is a derived resource.
 */
export declare class DerivedResourceStore extends PassthroughStore {
    protected readonly logger: import("global-logger-factory").Logger<unknown>;
    protected readonly manager: DerivationManager;
    protected readonly identifierStrategy: IdentifierStrategy;
    protected readonly converter: RepresentationConverter;
    constructor(source: ResourceStore, manager: DerivationManager, identifierStrategy: IdentifierStrategy, converter: RepresentationConverter);
    hasResource(identifier: ResourceIdentifier): Promise<boolean>;
    getRepresentation(identifier: ResourceIdentifier, preferences?: RepresentationPreferences, conditions?: Conditions): Promise<Representation>;
    addResource(container: ResourceIdentifier, representation: Representation, conditions?: Conditions): Promise<ChangeMap>;
    setRepresentation(identifier: ResourceIdentifier, representation: Representation, conditions?: Conditions): Promise<ChangeMap>;
    modifyResource(identifier: ResourceIdentifier, patch: Patch, conditions?: Conditions): Promise<ChangeMap>;
    deleteResource(identifier: ResourceIdentifier, conditions?: Conditions): Promise<ChangeMap>;
    /**
     * Asserts the identifier does not correspond to a derived resource.
     */
    protected assertNotDerived(identifier: ResourceIdentifier): Promise<void>;
    /**
     * Derived resources should never be resolved for CSS internal state resources.
     */
    protected isInternalIdentifier(identifier: ResourceIdentifier): boolean;
    /**
     * Determines if the identifier corresponds to a derived resource.
     * `skipFirst` parameter will be passed to `getFirstExistingResource` call.
     */
    protected isDerivedResource(identifier: ResourceIdentifier, skipFirst?: boolean): Promise<boolean>;
    /**
     * Finds the first resource in the container chain that exists, starting from the given identifier.
     * `skipFirst` can be used if you know the input identifier will have no match.
     */
    protected getFirstExistingResource(identifier: ResourceIdentifier, skipFirst?: boolean): Promise<Representation>;
    /**
     * Closes the data stream in the representation, without emitting an error.
     */
    protected closeDataStream(representation: Representation): void;
    /**
     * Ensures derived RDF resources leave this store with an external HTTP media type.
     */
    protected finalizeDerivedRepresentation(identifier: ResourceIdentifier, preferences: RepresentationPreferences, representation: Representation): Promise<Representation>;
    /**
     * Counts the quads that flow through an internal RDF representation.
     */
    protected countInternalQuads(representation: Representation, stats: {
        count: number;
    }): Representation;
    /**
     * Logs the final response characteristics without consuming the stream ahead of CSS.
     */
    protected logFinalRepresentation(identifier: ResourceIdentifier, representation: Representation, quadStats: {
        count: number;
    }): Representation;
}
