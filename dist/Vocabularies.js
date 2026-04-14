"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RDF = exports.FOAF = exports.VOID = exports.SH = exports.SD = exports.HYDRA = exports.DERIVED_INDEX = exports.DERIVED_TYPES = exports.DERIVED = void 0;
const community_server_1 = require("@solid/community-server");
const rdf_vocabulary_1 = require("rdf-vocabulary");
exports.DERIVED = (0, rdf_vocabulary_1.createVocabulary)('urn:npm:solid:derived-resources:', 
// Used to link to a single derived resource instance
'derivedResource', 'template', 'selector', 'filter', 'feature', 
// A feature used to indicate that only sources for which the requesting agent has read access should be used
'ReadableSources');
exports.DERIVED_TYPES = (0, rdf_vocabulary_1.createVocabulary)('urn:npm:solid:derived-resources:types:', 'QPF', 'QuadPattern', 'Shacl', 'Sparql', 'Store', 'String');
exports.DERIVED_INDEX = (0, rdf_vocabulary_1.createVocabulary)('urn:npm:solid:derived-index:', 'for', 'instance');
exports.HYDRA = (0, rdf_vocabulary_1.createVocabulary)('http://www.w3.org/ns/hydra/core#', 'first', 'mapping', 'next', 'property', 'search', 'template', 'totalItems', 'variable', 'view');
exports.SD = (0, rdf_vocabulary_1.createVocabulary)('http://www.w3.org/ns/sparql-service-description#', 'defaultGraph', 'graph');
exports.SH = (0, rdf_vocabulary_1.createVocabulary)('http://www.w3.org/ns/shacl#', 'property', 'path', 'node', 
// Validation report
'focusNode', 
// Focus node
'targetNode', 'targetClass', 'targetSubjectsOf', 'targetObjectsOf');
exports.VOID = (0, rdf_vocabulary_1.createVocabulary)('http://rdfs.org/ns/void#', 'triples', 'subset');
exports.FOAF = (0, rdf_vocabulary_1.extendVocabulary)(community_server_1.FOAF, 'primaryTopic');
exports.RDF = (0, rdf_vocabulary_1.extendVocabulary)(community_server_1.RDF, 'subject', 'predicate', 'object');
//# sourceMappingURL=Vocabularies.js.map