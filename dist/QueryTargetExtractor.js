"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryTargetExtractor = void 0;
const community_server_1 = require("@solid/community-server");
/**
 * Uses a different {@link TargetExtractor} to generate a {@link ResourceIdentifier},
 * after which it parses the query parameters and adds those as well.
 */
class QueryTargetExtractor extends community_server_1.TargetExtractor {
    targetExtractor;
    constructor(targetExtractor) {
        super();
        this.targetExtractor = targetExtractor;
    }
    async canHandle(input) {
        return this.targetExtractor.canHandle(input);
    }
    async handle(input) {
        const identifier = await this.targetExtractor.handle(input);
        // Base URL doesn't matter as we only care about the query string
        const url = new URL(input.request.url, 'https://example.com/');
        return {
            ...identifier,
            query: {
                ...Object.fromEntries(url.searchParams.entries()),
            },
        };
    }
}
exports.QueryTargetExtractor = QueryTargetExtractor;
//# sourceMappingURL=QueryTargetExtractor.js.map