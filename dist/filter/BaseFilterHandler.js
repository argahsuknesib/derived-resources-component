"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseFilterHandler = void 0;
const community_server_1 = require("@solid/community-server");
const FilterHandler_1 = require("./FilterHandler");
/**
 * First parses the filter input into a {@link Filter} object,
 * which it then feeds into a {@link FilterExecutor}.
 *
 * Also adds timestamp en derivation metadata to the resulting {@link Representation}.
 */
class BaseFilterHandler extends FilterHandler_1.FilterHandler {
    parser;
    executor;
    constructor(parser, executor) {
        super();
        this.parser = parser;
        this.executor = executor;
    }
    async canHandle(input) {
        return this.parser.canHandle(input.config);
    }
    async handle(input) {
        const filter = await this.parser.handle(input.config);
        const result = await this.executor.handleSafe({ ...input, filter });
        // Set the last modified date to the current time,
        // this to prevent issues with ETags not changing if the resource changes.
        // To generate a correct ETag we would have to consider all input sources,
        // their timestamps, same for the filter, and potential mappings.
        // CSS currently generates an ETag purely based on the timestamp,
        // so some changes would be needed there before we can even think of that.
        (0, community_server_1.updateModifiedDate)(result.metadata, new Date());
        // Add all the derivation metadata
        input.config.metadata.identifier = result.metadata.identifier;
        result.metadata.setMetadata(input.config.metadata);
        return result;
    }
}
exports.BaseFilterHandler = BaseFilterHandler;
//# sourceMappingURL=BaseFilterHandler.js.map