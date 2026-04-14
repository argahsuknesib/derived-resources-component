"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuadPatternFilterParser = void 0;
const community_server_1 = require("@solid/community-server");
const Vocabularies_1 = require("../../Vocabularies");
const FilterParser_1 = require("./FilterParser");
/**
 * Converts a partial representation of JSON quad into an actual Partial<Quad>.
 */
class QuadPatternFilterParser extends FilterParser_1.FilterParser {
    cache = new WeakMap();
    async canHandle(input) {
        let json;
        try {
            json = JSON.parse(input.filter);
        }
        catch {
            throw new community_server_1.NotImplementedHttpError(`Only supports JSON filters`);
        }
        if (!Object.keys(json).every((key) => ['subject', 'predicate', 'object', 'graph'].includes(key))) {
            throw new community_server_1.NotImplementedHttpError('Expected a JSON object with keys subject, predicate, object and/or graph.');
        }
        this.cache.set(input, json);
    }
    async handle(input) {
        const cached = this.cache.get(input);
        if (!cached) {
            throw new community_server_1.InternalServerError('Calling handle before canHandle');
        }
        return {
            data: cached,
            type: Vocabularies_1.DERIVED_TYPES.terms.QuadPattern,
            checksum: input.filter,
            metadata: new community_server_1.RepresentationMetadata(),
        };
    }
}
exports.QuadPatternFilterParser = QuadPatternFilterParser;
//# sourceMappingURL=QuadPatternFilterParser.js.map