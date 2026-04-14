"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PresetDerivationMatcher = void 0;
const DerivationMatcher_1 = require("./DerivationMatcher");
/**
 * Adds certain preset values to the resulting mappings of another {@link DerivationMatcher}.
 * `source` will be set to the identifier of the resource where the metadata was found.
 * `identifier` will be set to the identifier of the resource being accessed.
 */
class PresetDerivationMatcher extends DerivationMatcher_1.DerivationMatcher {
    source;
    constructor(source) {
        super();
        this.source = source;
    }
    async canHandle(input) {
        return this.source.canHandle(input);
    }
    async handle(input) {
        const result = await this.source.handle(input);
        const mappings = {
            ...result.mappings,
            source: input.metadata.identifier.value,
            identifier: input.identifier.path,
        };
        return {
            ...result,
            mappings,
        };
    }
}
exports.PresetDerivationMatcher = PresetDerivationMatcher;
//# sourceMappingURL=PresetDerivationMatcher.js.map