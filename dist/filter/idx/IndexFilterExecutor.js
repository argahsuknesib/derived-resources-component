"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IndexFilterExecutor = void 0;
const community_server_1 = require("@solid/community-server");
const n3_1 = require("n3");
const StreamUtil_1 = require("../../util/StreamUtil");
const Vocabularies_1 = require("../../Vocabularies");
const FilterExecutor_1 = require("../FilterExecutor");
const EXPECTED_KEYS = ['subject', 'predicate', 'object', 'graph'];
/**
 * A {@link FilterExecutor} that generates derived index resources.
 * Supports filter resources containing a JSON object which is a partial Quad.
 * The partial Quad should contain 1 variable.
 * For every triple in the input resources that matches the filter,
 * triples will be generated indicating which resource contained the match,
 * and which value was in the variable position.
 */
class IndexFilterExecutor extends FilterExecutor_1.FilterExecutor {
    quadPatternExecutor;
    constructor(quadPatternExecutor) {
        super();
        this.quadPatternExecutor = quadPatternExecutor;
    }
    async canHandle({ filter, representations }) {
        if (!filter.type.equals(Vocabularies_1.DERIVED_TYPES.terms.QuadPattern)) {
            throw new community_server_1.NotImplementedHttpError('Only supports Quad pattern filters');
        }
        let varCount = 0;
        for (const key of Object.keys(filter.data)) {
            if (filter.data[key].termType === 'Variable') {
                varCount += 1;
            }
        }
        if (varCount !== 1) {
            throw new community_server_1.NotImplementedHttpError('Expected exactly 1 variable in the filter.');
        }
        for (const representation of representations) {
            await this.quadPatternExecutor.canHandle({ filter: filter.data, representation });
        }
    }
    async handle(input) {
        // Find the variable
        let position;
        for (const key of EXPECTED_KEYS) {
            if (input.filter.data[key]?.termType === 'Variable') {
                position = key;
            }
        }
        // We create a new store every time to reset the blank node index value
        const store = new n3_1.Store();
        // We link blank nodes to matches to group all entries of the same match
        const matches = {};
        const streams = await Promise.all(input.representations.map(async (representation) => {
            const createQuads = this.createQuadFn(position, store, matches, representation.metadata.identifier);
            const data = await this.quadPatternExecutor.handle({ representation, filter: input.filter.data });
            return this.createTransform(data, createQuads);
        }));
        const merged = (0, StreamUtil_1.mergeStreams)(streams);
        const representation = new community_server_1.BasicRepresentation(merged, input.config.identifier, community_server_1.INTERNAL_QUADS);
        representation.metadata.addQuad(Vocabularies_1.DERIVED_INDEX.terms.namespace, community_server_1.PREFERRED_PREFIX_TERM, 'derived-index', community_server_1.SOLID_META.terms.ResponseMetadata);
        return representation;
    }
    createQuadFn(position, store, matches, instance) {
        return (quad) => {
            const existingNode = matches[quad[position].value];
            if (existingNode) {
                // If we already have a match, the `derived-index:for` triple has already been generated
                return [
                    n3_1.DataFactory.quad(existingNode, n3_1.DataFactory.namedNode(Vocabularies_1.DERIVED_INDEX.instance), instance),
                ];
            }
            const blankNode = store.createBlankNode();
            matches[quad[position].value] = blankNode;
            return [
                n3_1.DataFactory.quad(blankNode, n3_1.DataFactory.namedNode(Vocabularies_1.DERIVED_INDEX.for), quad[position]),
                n3_1.DataFactory.quad(blankNode, n3_1.DataFactory.namedNode(Vocabularies_1.DERIVED_INDEX.instance), instance),
            ];
        };
    }
    createTransform(data, quadFn) {
        const transformed = (0, community_server_1.transformSafely)(data, {
            transform: (data) => {
                for (const quads of quadFn(data)) {
                    transformed.push(quads);
                }
            },
            objectMode: true,
        });
        return transformed;
    }
}
exports.IndexFilterExecutor = IndexFilterExecutor;
//# sourceMappingURL=IndexFilterExecutor.js.map