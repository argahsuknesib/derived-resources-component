import type { DerivationConfig } from '../DerivationConfig';
import type { DerivationMatcherInput } from './DerivationMatcher';
import { DerivationMatcher } from './DerivationMatcher';
/**
 * Adds certain preset values to the resulting mappings of another {@link DerivationMatcher}.
 * `source` will be set to the identifier of the resource where the metadata was found.
 * `identifier` will be set to the identifier of the resource being accessed.
 */
export declare class PresetDerivationMatcher extends DerivationMatcher {
    protected source: DerivationMatcher;
    constructor(source: DerivationMatcher);
    canHandle(input: DerivationMatcherInput): Promise<void>;
    handle(input: DerivationMatcherInput): Promise<DerivationConfig>;
}
