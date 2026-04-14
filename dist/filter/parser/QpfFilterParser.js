"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QpfFilterParser = void 0;
const community_server_1 = require("@solid/community-server");
const QueryResourceIdentifier_1 = require("../../QueryResourceIdentifier");
const Vocabularies_1 = require("../../Vocabularies");
const FilterParser_1 = require("./FilterParser");
/**
 * Parses a QPF filter.
 * Since QPF filters are just a string containing 'qpf' the actual data content of the filter object will be empty.
 * The checksum is determined based on the query parameters of the identifier.
 */
class QpfFilterParser extends FilterParser_1.FilterParser {
    async canHandle({ filter }) {
        const data = filter.trim();
        if (data !== 'tpf' && data !== 'qpf') {
            throw new community_server_1.NotImplementedHttpError('Only QPF filter bodies are supported.');
        }
    }
    async handle(config) {
        return {
            type: Vocabularies_1.DERIVED_TYPES.terms.QPF,
            data: '',
            checksum: (0, QueryResourceIdentifier_1.isQueryResourceIdentifier)(config.identifier) ? JSON.stringify(config.identifier.query) : 'qpf',
            metadata: new community_server_1.RepresentationMetadata(),
        };
    }
}
exports.QpfFilterParser = QpfFilterParser;
//# sourceMappingURL=QpfFilterParser.js.map