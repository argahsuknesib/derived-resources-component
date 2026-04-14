"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputFilterParser = void 0;
const community_server_1 = require("@solid/community-server");
const Vocabularies_1 = require("../../Vocabularies");
const FilterParser_1 = require("./FilterParser");
/**
 * Returns the filter input string as output data.
 */
class InputFilterParser extends FilterParser_1.FilterParser {
    async handle(input) {
        return {
            data: input.filter,
            checksum: input.filter,
            type: Vocabularies_1.DERIVED_TYPES.terms.String,
            metadata: new community_server_1.RepresentationMetadata(),
        };
    }
}
exports.InputFilterParser = InputFilterParser;
//# sourceMappingURL=InputFilterParser.js.map