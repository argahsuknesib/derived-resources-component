"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparqlFilterParser = void 0;
const community_server_1 = require("@solid/community-server");
const global_logger_factory_1 = require("global-logger-factory");
const sparqljs_1 = require("sparqljs");
const Vocabularies_1 = require("../../Vocabularies");
const FilterParser_1 = require("./FilterParser");
/**
 * Validates whether the filter string is a valid SPARQL query.
 */
class SparqlFilterParser extends FilterParser_1.FilterParser {
    logger = (0, global_logger_factory_1.getLoggerFor)(this);
    parser = new sparqljs_1.Parser();
    async canHandle(input) {
        try {
            this.parser.parse(input.filter);
        }
        catch (error) {
            this.logger.debug(`Not a valid SPARQL query: ${(0, community_server_1.createErrorMessage)(error)}`);
            throw new community_server_1.NotImplementedHttpError('Only supports SPARQL filters');
        }
    }
    async handle(input) {
        return {
            data: input.filter,
            checksum: input.filter,
            type: Vocabularies_1.DERIVED_TYPES.terms.Sparql,
            metadata: new community_server_1.RepresentationMetadata(),
        };
    }
}
exports.SparqlFilterParser = SparqlFilterParser;
//# sourceMappingURL=SparqlFilterParser.js.map