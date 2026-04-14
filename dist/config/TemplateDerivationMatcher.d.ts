import type { BlankNode, NamedNode, Quad, Term } from '@rdfjs/types';
import type { ResourceIdentifier } from '@solid/community-server';
import { RepresentationMetadata } from '@solid/community-server';
import type { DerivationConfig } from '../DerivationConfig';
import type { DerivationMatcherInput } from './DerivationMatcher';
import { DerivationMatcher } from './DerivationMatcher';
/**
 * Finds a matching derivation by matching the identifier to a template string.
 *
 * Already generates the result in the `canHandle` call and stores it in a {@link WeakMap}
 * to prevent double work.
 */
export declare class TemplateDerivationMatcher extends DerivationMatcher {
    protected logger: import("global-logger-factory").Logger<unknown>;
    protected cache: WeakMap<ResourceIdentifier, Record<string, string>>;
    constructor();
    canHandle({ identifier, metadata, subject }: DerivationMatcherInput): Promise<void>;
    handle({ identifier, metadata, subject }: DerivationMatcherInput): Promise<DerivationConfig>;
    /**
     * Returns true if the term is a Named or Blank node.
     */
    protected isValidDerivedSubject(term: Term): term is NamedNode | BlankNode;
    protected getRelevantQuads(subject: Term, metadata: RepresentationMetadata, cache?: Set<string>): Iterable<Quad>;
}
