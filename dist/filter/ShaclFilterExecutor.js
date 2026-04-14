"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShaclFilterExecutor = void 0;
const node_stream_1 = require("node:stream");
const global_logger_factory_1 = require("global-logger-factory");
const community_server_1 = require("@solid/community-server");
const rdf_validate_shacl_1 = __importDefault(require("rdf-validate-shacl"));
const Vocabularies_1 = require("../Vocabularies");
const N3FilterExecutor_1 = require("./N3FilterExecutor");
class ShaclFilterExecutor extends N3FilterExecutor_1.N3FilterExecutor {
    logger = (0, global_logger_factory_1.getLoggerFor)(this);
    async canHandle(input) {
        if (!input.filter.type.equals(Vocabularies_1.DERIVED_TYPES.terms.Shacl)) {
            throw new community_server_1.NotImplementedHttpError('Only supports SHACL filters');
        }
    }
    async handle(input) {
        return new community_server_1.BasicRepresentation(node_stream_1.Readable.from(this.extractMatchingTriples(input.data, input.filter.data)), input.config.identifier, community_server_1.INTERNAL_QUADS);
    }
    *extractMatchingTriples(data, shapes) {
        const validator = new rdf_validate_shacl_1.default(shapes);
        const report = validator.validate(data);
        const paths = {};
        for (const { focusNode, shapeNode } of this.findFocusNodes(data, shapes)) {
            if (report.dataset.match(null, Vocabularies_1.SH.terms.focusNode, focusNode).size > 0) {
                continue;
            }
            const path = paths[shapeNode.value] ?? this.findValidPath(shapes, shapeNode);
            paths[shapeNode.value] = path;
            yield* this.extractValidTriples(data, path, focusNode);
        }
    }
    *findFocusNodes(data, shapes) {
        for (const { subject: shapeNode, object: focusNode } of shapes.getQuads(null, Vocabularies_1.SH.terms.targetNode, null, null)) {
            yield { focusNode, shapeNode };
        }
        for (const { subject: shapeNode, object: classNode } of shapes.getQuads(null, Vocabularies_1.SH.terms.targetClass, null, null)) {
            for (const focusNode of data.getSubjects(community_server_1.RDF.terms.type, classNode, null)) {
                yield { focusNode, shapeNode };
            }
        }
        for (const { subject: shapeNode, object: pred } of shapes.getQuads(null, Vocabularies_1.SH.terms.targetSubjectsOf, null, null)) {
            for (const focusNode of data.getSubjects(pred, null, null)) {
                yield { focusNode, shapeNode };
            }
        }
        for (const { subject: shapeNode, object: pred } of shapes.getQuads(null, Vocabularies_1.SH.terms.targetObjectsOf, null, null)) {
            for (const focusNode of data.getObjects(null, pred, null)) {
                yield { focusNode, shapeNode };
            }
        }
    }
    findValidPath(shapes, shapeNode) {
        const result = {};
        const properties = shapes.getObjects(shapeNode, Vocabularies_1.SH.terms.property, null);
        for (const property of properties) {
            const pathObjects = shapes.getObjects(property, Vocabularies_1.SH.terms.path, null);
            if (pathObjects.length !== 1) {
                this.logger.warn(`Skipping property with not exactly 1 sh:path node.`);
                continue;
            }
            const predicate = pathObjects[0];
            result[predicate.value] = result[predicate.value] ?? {};
            for (const node of shapes.getObjects(property, Vocabularies_1.SH.terms.node, null)) {
                result[predicate.value] = this.mergePaths(result[predicate.value], this.findValidPath(shapes, node));
            }
        }
        return result;
    }
    mergePaths(pathA, pathB) {
        const result = { ...pathA };
        for (const key of Object.keys(pathB)) {
            if (result[key]) {
                result[key] = this.mergePaths(pathA[key], pathB[key]);
            }
            else {
                result[key] = pathB[key];
            }
        }
        return result;
    }
    *extractValidTriples(data, path, focusNode) {
        for (const [key, childPath] of Object.entries(path)) {
            for (const quad of data.getQuads(focusNode, key, null, null)) {
                yield quad;
                yield* this.extractValidTriples(data, childPath, quad.object);
            }
        }
    }
}
exports.ShaclFilterExecutor = ShaclFilterExecutor;
//# sourceMappingURL=ShaclFilterExecutor.js.map