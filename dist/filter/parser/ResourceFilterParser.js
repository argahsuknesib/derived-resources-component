"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ResourceFilterParser = void 0;
const community_server_1 = require("@solid/community-server");
const FilterParser_1 = require("./FilterParser");
/**
 * Interprets the filter string from a {@link DerivationConfig} as the URL of a resource.
 * The contents of that resource will then be passed along to the next parser.
 * Only supports resources stored in the given {@link ResourceStore}.g
 */
class ResourceFilterParser extends FilterParser_1.FilterParser {
    source;
    store;
    identifierStrategy;
    constructor(source, store, identifierStrategy) {
        super();
        this.source = source;
        this.store = store;
        this.identifierStrategy = identifierStrategy;
    }
    async canHandle(input) {
        if (!(0, community_server_1.isUrl)(input.filter)) {
            throw new community_server_1.NotImplementedHttpError('Only valid URLs are supported as filter value.');
        }
        if (!this.identifierStrategy.supportsIdentifier({ path: input.filter })) {
            throw new community_server_1.NotImplementedHttpError(`${input.filter} is not in the scope of the server.`);
        }
    }
    async handle(input) {
        let representation;
        let filterData;
        try {
            representation = await this.store.getRepresentation({ path: input.filter }, {});
            filterData = await (0, community_server_1.readableToString)(representation.data);
        }
        catch (error) {
            throw new community_server_1.InternalServerError(`There was a problem acquiring the filter to generate the derived resource: ${(0, community_server_1.createErrorMessage)(error)}`);
        }
        const filter = await this.source.handleSafe({
            ...input,
            filter: filterData,
        });
        filter.metadata.identifier = representation.metadata.identifier;
        representation.metadata.setMetadata(filter.metadata);
        return {
            ...filter,
            metadata: representation.metadata,
        };
    }
}
exports.ResourceFilterParser = ResourceFilterParser;
//# sourceMappingURL=ResourceFilterParser.js.map