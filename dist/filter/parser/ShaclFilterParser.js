"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShaclFilterParser = void 0;
const community_server_1 = require("@solid/community-server");
const Vocabularies_1 = require("../../Vocabularies");
const QuadFilterParser_1 = require("./QuadFilterParser");
/**
 * Interprets a filter with text/turtle data as a SHACL document.
 */
class ShaclFilterParser extends QuadFilterParser_1.QuadFilterParser {
    async canHandle(input) {
        await super.canHandle(input);
        const cached = this.cache.get(input);
        if (cached.countQuads(null, Vocabularies_1.SH.terms.property, null, null) === 0) {
            throw new community_server_1.NotImplementedHttpError('Expected at least one sh:property predicate in a SHACL resource');
        }
    }
    async handle(input) {
        const filter = await super.handle(input);
        filter.type = Vocabularies_1.DERIVED_TYPES.terms.Shacl;
        return filter;
    }
}
exports.ShaclFilterParser = ShaclFilterParser;
//# sourceMappingURL=ShaclFilterParser.js.map