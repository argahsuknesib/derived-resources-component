"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MappingFilterParser = void 0;
const global_logger_factory_1 = require("global-logger-factory");
const FilterParser_1 = require("./FilterParser");
/**
 * Applies mapping values to a filter string in a {@link DerivationConfig}.
 * Replaces `$key$` strings with the corresponding value in the mappings.
 */
class MappingFilterParser extends FilterParser_1.FilterParser {
    logger = (0, global_logger_factory_1.getLoggerFor)(this);
    source;
    constructor(source) {
        super();
        this.source = source;
    }
    async handle(input) {
        let data = input.filter;
        // Replace vars with values
        for (const [key, val] of Object.entries(input.mappings)) {
            data = data.replaceAll(`$${key}$`, val);
        }
        this.logger.debug(`Applied mappings to filter ${input.filter} resulting in ${data}`);
        return this.source.handleSafe({
            ...input,
            filter: data,
        });
    }
}
exports.MappingFilterParser = MappingFilterParser;
//# sourceMappingURL=MappingFilterParser.js.map