"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparqlFilterExecutor = void 0;
const node_events_1 = require("node:events");
const node_stream_1 = require("node:stream");
const query_sparql_1 = require("@comunica/query-sparql");
const global_logger_factory_1 = require("global-logger-factory");
const community_server_1 = require("@solid/community-server");
const Vocabularies_1 = require("../Vocabularies");
const N3FilterExecutor_1 = require("./N3FilterExecutor");
/**
 * Applies a SPARQL filter to an N3.js store.
 */
class SparqlFilterExecutor extends N3FilterExecutor_1.N3FilterExecutor {
    logger = (0, global_logger_factory_1.getLoggerFor)(this);
    engine;
    constructor() {
        super();
        this.engine = new query_sparql_1.QueryEngine();
    }
    async canHandle({ filter }) {
        if (!filter.type.equals(Vocabularies_1.DERIVED_TYPES.terms.Sparql)) {
            throw new community_server_1.NotImplementedHttpError('Only SPARQL filters are supported.');
        }
    }
    async handle({ filter, data, config }) {
        const query = filter.data;
        this.logger.debug(`Using filter with contents ${query}`);
        try {
            const result = await this.engine.queryQuads(query, { sources: [data] });
            return new community_server_1.BasicRepresentation(node_stream_1.Readable.from(this.convertAsyncIterator(result)), config.identifier, community_server_1.INTERNAL_QUADS);
        }
        catch (error) {
            throw new community_server_1.InternalServerError(`There was a problem applying the filter while generating the derived resource: ${(0, community_server_1.createErrorMessage)(error)}`);
        }
    }
    /**
     * Converts a stream from the AsyncIterator library to an async generator.
     */
    async *convertAsyncIterator(it) {
        const dataIt = (0, node_events_1.on)(it, 'data');
        // eslint-disable-next-line ts/no-misused-promises
        it.on('end', async () => {
            await dataIt.return();
        });
        for await (const data of dataIt) {
            yield* data;
        }
    }
}
exports.SparqlFilterExecutor = SparqlFilterExecutor;
//# sourceMappingURL=SparqlFilterExecutor.js.map