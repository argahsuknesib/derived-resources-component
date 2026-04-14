"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuadFilterParser = void 0;
const community_server_1 = require("@solid/community-server");
const global_logger_factory_1 = require("global-logger-factory");
const n3_1 = require("n3");
const Vocabularies_1 = require("../../Vocabularies");
const FilterParser_1 = require("./FilterParser");
/**
 * Interprets the config filter string as turtle and parses it into an N3.js store.
 * Parsing already happens in the `canHandle` call as the parsing is used to verify if the input is valid turtle.
 * The intermediate result is stored in a {@link WeakMap} to return on the `handle` call.
 */
class QuadFilterParser extends FilterParser_1.FilterParser {
    logger = (0, global_logger_factory_1.getLoggerFor)(this);
    cache = new WeakMap();
    async canHandle(input) {
        const parser = new n3_1.Parser();
        try {
            const quads = parser.parse(input.filter);
            this.cache.set(input, new n3_1.Store(quads));
        }
        catch (error) {
            this.logger.debug(`Unable to parse filter to quads: ${(0, community_server_1.createErrorMessage)(error)}`);
            throw new community_server_1.NotImplementedHttpError('Only valid turtle input is accepted');
        }
    }
    async handle(input) {
        const store = this.cache.get(input);
        if (!store) {
            throw new community_server_1.InternalServerError('Calling handle before calling canHandle');
        }
        return {
            data: store,
            type: Vocabularies_1.DERIVED_TYPES.terms.Store,
            checksum: input.filter,
            metadata: new community_server_1.RepresentationMetadata(),
        };
    }
}
exports.QuadFilterParser = QuadFilterParser;
//# sourceMappingURL=QuadFilterParser.js.map