"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseSelectorHandler = void 0;
const community_server_1 = require("@solid/community-server");
const SelectorHandler_1 = require("./SelectorHandler");
/**
 * Determines all the input resources by calling a {@link SelectorParser}
 * and then acquires their representations through the {@link ResourceStore}.
 */
class BaseSelectorHandler extends SelectorHandler_1.SelectorHandler {
    parser;
    store;
    constructor(parser, store) {
        super();
        this.parser = parser;
        this.store = store;
    }
    async canHandle(config) {
        return this.parser.canHandle(config);
    }
    async handle(config) {
        return (0, community_server_1.asyncToArray)(this.configToRepresentations(config));
    }
    async *configToRepresentations(config) {
        const identifiers = await this.parser.handle(config);
        for (const identifier of identifiers) {
            yield this.store.getRepresentation(identifier, { type: { [community_server_1.INTERNAL_QUADS]: 1 } });
        }
    }
}
exports.BaseSelectorHandler = BaseSelectorHandler;
//# sourceMappingURL=BaseSelectorHandler.js.map