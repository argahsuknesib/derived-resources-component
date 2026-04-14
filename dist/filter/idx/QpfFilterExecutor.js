"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QpfFilterExecutor = void 0;
const node_stream_1 = require("node:stream");
const community_server_1 = require("@solid/community-server");
const n3_1 = require("n3");
const rdf_string_1 = require("rdf-string");
const QueryResourceIdentifier_1 = require("../../QueryResourceIdentifier");
const StreamUtil_1 = require("../../util/StreamUtil");
const Vocabularies_1 = require("../../Vocabularies");
const FilterExecutor_1 = require("../FilterExecutor");
const quad = n3_1.DataFactory.quad.bind(n3_1.DataFactory);
const namedNode = n3_1.DataFactory.namedNode.bind(n3_1.DataFactory);
const literal = n3_1.DataFactory.literal.bind(n3_1.DataFactory);
const blankNode = n3_1.DataFactory.blankNode.bind(n3_1.DataFactory);
const defaultGraph = n3_1.DataFactory.defaultGraph.bind(n3_1.DataFactory);
// Variable mappings for the QPF endpoint.
const VAR_POSITIONS = {
    s: 'subject',
    p: 'predicate',
    o: 'object',
    g: 'graph',
};
// Graph that contains the metadata
const graph = namedNode('meta');
// Graph term that needs to be used if the query only wants results from the default graph
const defaultGraphParam = namedNode('urn:default');
const search = blankNode();
const subjectNode = blankNode();
const predicateNode = blankNode();
const objectNode = blankNode();
const graphNode = blankNode();
const fixedMetaQuads = [
    quad(search, Vocabularies_1.HYDRA.terms.mapping, subjectNode, graph),
    quad(subjectNode, Vocabularies_1.HYDRA.terms.variable, literal('s'), graph),
    quad(subjectNode, Vocabularies_1.HYDRA.terms.property, Vocabularies_1.RDF.terms.subject, graph),
    quad(search, Vocabularies_1.HYDRA.terms.mapping, predicateNode, graph),
    quad(predicateNode, Vocabularies_1.HYDRA.terms.variable, literal('p'), graph),
    quad(predicateNode, Vocabularies_1.HYDRA.terms.property, Vocabularies_1.RDF.terms.predicate, graph),
    quad(search, Vocabularies_1.HYDRA.terms.mapping, objectNode, graph),
    quad(objectNode, Vocabularies_1.HYDRA.terms.variable, literal('o'), graph),
    quad(objectNode, Vocabularies_1.HYDRA.terms.property, Vocabularies_1.RDF.terms.object, graph),
    quad(search, Vocabularies_1.HYDRA.terms.mapping, graphNode, graph),
    quad(graphNode, Vocabularies_1.HYDRA.terms.variable, literal('g'), graph),
    quad(graphNode, Vocabularies_1.HYDRA.terms.property, Vocabularies_1.SD.terms.graph, graph),
];
/**
 * A {@link FilterExecutor} exposing a QPF endpoint.
 * Due to the streaming nature of how data is used,
 * the response will always be two pages:
 * the first page is empty with only the metadata,
 * the next page will contain all the data as well.
 * For the same reason, the triple count will always be set to 1 million.
 * The reason for using two pages is to prevent querying engines that are checking the counts
 * from having to download all the data as well.
 * The reason we don't return partial data on the first page
 * is because we can't guarantee the order of the incoming data stream,
 * so we can't know which triples would need to be returned on the second page.
 *
 * To somewhat circumvent this issue,
 * a set amount of triples will be read into memory from the data stream,
 * before we generate the result stream.
 * If this causes the entire stream to be read,
 * we can give an accurate count result,
 * meaning only large result streams will have inaccurate results.
 * Such cases will also immediately return all their results on the first page,
 * instead of hiding their data on a second page.
 * By default, this value is set to 1000.
 * It can be set to 0 to always first read all results into memory for an accurate count.
 */
class QpfFilterExecutor extends FilterExecutor_1.FilterExecutor {
    quadPatternExecutor;
    quadLimit;
    constructor(quadFilterParser, quadLimit = 1000) {
        super();
        this.quadPatternExecutor = quadFilterParser;
        this.quadLimit = quadLimit;
    }
    async canHandle({ representations, filter }) {
        if (!filter.type.equals(Vocabularies_1.DERIVED_TYPES.terms.QPF)) {
            throw new community_server_1.NotImplementedHttpError('Only QPF filter bodies are supported.');
        }
        for (const representation of representations) {
            await this.quadPatternExecutor.canHandle({ filter: {}, representation });
        }
    }
    async handle({ representations, config }) {
        const filter = this.generateFilter((0, QueryResourceIdentifier_1.isQueryResourceIdentifier)(config.identifier) ? config.identifier.query : {});
        const showData = (0, QueryResourceIdentifier_1.isQueryResourceIdentifier)(config.identifier) ? config.identifier.query.data === 'true' : false;
        const streams = await Promise.all(representations.map(async (representation) => this.quadPatternExecutor.handle({ filter, representation })));
        let merged = (0, StreamUtil_1.mergeStreams)(streams);
        // Checking if the amount of resulting triples is low enough to load into memory to have exact size numbers
        let size;
        if (this.quadLimit === 0) {
            const data = await (0, community_server_1.readableToQuads)(merged);
            size = data.size;
            merged = node_stream_1.Readable.from(data.getQuads(null, null, null, null));
        }
        else {
            const { head, tail } = await (0, StreamUtil_1.take)(merged, this.quadLimit);
            if (tail.readableEnded) {
                merged = node_stream_1.Readable.from(head);
                size = head.length;
            }
            else if (showData) {
                merged = (0, StreamUtil_1.mergeStreams)(node_stream_1.Readable.from(head), tail);
            }
            else {
                tail.on('error', () => { });
                tail.destroy();
                merged = node_stream_1.Readable.from([]);
            }
        }
        const metaQuads = this.getMetaQuads(config.identifier, size, typeof size === 'undefined' && !showData);
        const metaStream = node_stream_1.Readable.from(metaQuads);
        return new community_server_1.BasicRepresentation((0, StreamUtil_1.mergeStreams)(metaStream, merged), config.identifier, community_server_1.INTERNAL_QUADS);
    }
    generateFilter(mappings) {
        const result = {};
        for (const [key, pos] of Object.entries(VAR_POSITIONS)) {
            if (mappings[key]) {
                if (pos === 'graph' && mappings[key] === defaultGraphParam.value) {
                    result[pos] = defaultGraph();
                }
                else {
                    // Not actually correct but let's just assume this is good enough
                    result[pos] = (0, rdf_string_1.stringToTerm)(mappings[key]);
                }
            }
        }
        return result;
    }
    getMetaQuads(identifier, size = 1000000, nextPage = false) {
        const fragment = namedNode(this.identifierToString(identifier));
        const dataset = namedNode(`${identifier.path}#dataset`);
        const quads = [
            quad(graph, Vocabularies_1.FOAF.terms.primaryTopic, fragment, graph),
            quad(fragment, Vocabularies_1.VOID.terms.triples, literal(size), graph),
            quad(fragment, Vocabularies_1.HYDRA.terms.totalItems, literal(size), graph),
            quad(fragment, Vocabularies_1.HYDRA.terms.view, fragment, graph),
            quad(dataset, Vocabularies_1.VOID.terms.subset, fragment, graph),
            quad(dataset, Vocabularies_1.SD.terms.defaultGraph, defaultGraphParam, graph),
            quad(dataset, Vocabularies_1.HYDRA.terms.search, search, graph),
            quad(search, Vocabularies_1.HYDRA.terms.template, literal(`${identifier.path}{?s,p,o,g}`), graph),
            ...fixedMetaQuads,
        ];
        if (nextPage) {
            // Add a link to the data page if necessary
            const nextIdentifier = {
                ...identifier,
                query: {
                    ...(0, QueryResourceIdentifier_1.isQueryResourceIdentifier)(identifier) ? identifier.query : {},
                    data: 'true',
                },
            };
            quads.push(quad(fragment, Vocabularies_1.HYDRA.terms.next, namedNode(this.identifierToString(nextIdentifier))));
        }
        return quads;
    }
    identifierToString(identifier) {
        if (!(0, QueryResourceIdentifier_1.isQueryResourceIdentifier)(identifier)) {
            return identifier.path;
        }
        const search = new URLSearchParams(identifier.query);
        return `${identifier.path}?${search.toString()}`;
    }
}
exports.QpfFilterExecutor = QpfFilterExecutor;
//# sourceMappingURL=QpfFilterExecutor.js.map