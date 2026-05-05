"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LatestFilterExecutor = void 0;
const community_server_1 = require("@solid/community-server");
const global_logger_factory_1 = require("global-logger-factory");
const Vocabularies_1 = require("../Vocabularies");
const FilterExecutor_1 = require("./FilterExecutor");
class LatestFilterExecutor extends FilterExecutor_1.FilterExecutor {
    logger = (0, global_logger_factory_1.getLoggerFor)(this);
    async canHandle({ filter }) {
        if (!filter.type.equals(Vocabularies_1.DERIVED_TYPES.terms.String) || filter.data !== 'latest') {
            throw new community_server_1.NotImplementedHttpError('Only "latest" literals are supported.');
        }
    }
    async handle(input) {
        const ids = input.representations.map((representation) => representation.metadata.identifier.value);
        this.logger.info(`LatestFilterExecutor.handle: representationCount=${input.representations.length}, ids=${JSON.stringify(ids)}`);
        if (input.representations.length === 0) {
            throw new community_server_1.NotFoundHttpError();
        }
        let latest = input.representations[0];
        let lastDate = new Date(0);
        for (const representation of input.representations) {
            const dateTerm = representation.metadata.get(community_server_1.DC.terms.modified);
            if (!dateTerm) {
                throw new community_server_1.InternalServerError(`Missing timestamps in data when using "latest" filter.`);
            }
            const date = new Date(dateTerm.value);
            if (date > lastDate) {
                latest = representation;
                lastDate = date;
            }
        }
        return latest;
    }
}
exports.LatestFilterExecutor = LatestFilterExecutor;
//# sourceMappingURL=LatestFilterExecutor.js.map