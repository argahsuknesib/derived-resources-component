"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseQuadPatternExecutor = void 0;
const community_server_1 = require("@solid/community-server");
const QuadPatternExecutor_1 = require("./QuadPatternExecutor");
/**
 * A {@link QuadPatternExecutor} that removes all triples from a representation data stream
 * that do not match a given quad template.
 */
class BaseQuadPatternExecutor extends QuadPatternExecutor_1.QuadPatternExecutor {
    async handle({ filter, representation }) {
        function matchFn(quad) {
            for (const pos of ['subject', 'predicate', 'object', 'graph']) {
                if (filter[pos] && filter[pos]?.termType !== 'Variable' && !quad[pos].equals(filter[pos])) {
                    return;
                }
            }
            return quad;
        }
        const transform = (0, community_server_1.transformSafely)(representation.data, {
            transform: (data) => {
                const match = matchFn(data);
                if (match) {
                    transform.push(match);
                }
            },
            objectMode: true,
        });
        return transform;
    }
}
exports.BaseQuadPatternExecutor = BaseQuadPatternExecutor;
//# sourceMappingURL=BaseQuadPatternExecutor.js.map