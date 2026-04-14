"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreDataFilterExecutor = void 0;
const node_events_1 = require("node:events");
const community_server_1 = require("@solid/community-server");
const n3_1 = require("n3");
const FilterExecutor_1 = require("./FilterExecutor");
/**
 * Converts the input quad streams into a single N3.js store and calls an {@link N3FilterExecutor}.
 */
class StoreDataFilterExecutor extends FilterExecutor_1.FilterExecutor {
    source;
    constructor(source) {
        super();
        this.source = source;
    }
    async canHandle(input) {
        const isRdf = input.representations.every((representation) => representation.metadata.contentType === community_server_1.INTERNAL_QUADS);
        if (!isRdf) {
            throw new community_server_1.NotImplementedHttpError('Only RDF input data is supported.');
        }
        return this.source.canHandle({
            ...input,
            data: new n3_1.Store(),
        });
    }
    async handle(input) {
        const data = new n3_1.Store();
        const importPromises = [];
        for (const representation of input.representations) {
            const emitter = data.import(representation.data);
            importPromises.push((0, node_events_1.once)(emitter, 'end'));
        }
        await Promise.all(importPromises);
        return this.source.handle({
            ...input,
            data,
        });
    }
}
exports.StoreDataFilterExecutor = StoreDataFilterExecutor;
//# sourceMappingURL=StoreDataFilterExecutor.js.map