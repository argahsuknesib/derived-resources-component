"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TemplateDerivationMatcher = void 0;
const global_logger_factory_1 = require("global-logger-factory");
const community_server_1 = require("@solid/community-server");
const uri_template_lite_1 = __importDefault(require("uri-template-lite"));
const QueryResourceIdentifier_1 = require("../QueryResourceIdentifier");
const Vocabularies_1 = require("../Vocabularies");
const DerivationMatcher_1 = require("./DerivationMatcher");
/**
 * Finds a matching derivation by matching the identifier to a template string.
 *
 * Already generates the result in the `canHandle` call and stores it in a {@link WeakMap}
 * to prevent double work.
 */
class TemplateDerivationMatcher extends DerivationMatcher_1.DerivationMatcher {
    logger = (0, global_logger_factory_1.getLoggerFor)(this);
    cache;
    constructor() {
        super();
        this.cache = new WeakMap();
    }
    async canHandle({ identifier, metadata, subject }) {
        // Templates are relative to the resource they are linked to
        const relative = identifier.path.slice(metadata.identifier.value.length);
        if (!this.isValidDerivedSubject(subject)) {
            throw new community_server_1.NotImplementedHttpError();
        }
        const templates = metadata.quads(subject, Vocabularies_1.DERIVED.terms.template);
        if (templates.length !== 1) {
            throw new community_server_1.NotImplementedHttpError();
        }
        let template = templates[0].object.value;
        // Removing query fragment capturing groups for now as matcher requires exactly (only) those keys to be present.
        const queryMatch = /\{\?[^{}]+\}$/u.exec(template);
        if (queryMatch) {
            template = template.slice(0, queryMatch.index);
        }
        const match = new uri_template_lite_1.default(template).match(relative);
        if (!match) {
            throw new community_server_1.NotImplementedHttpError();
        }
        this.cache.set(identifier, match);
    }
    async handle({ identifier, metadata, subject }) {
        const match = this.cache.get(identifier);
        if (!match) {
            throw new community_server_1.InternalServerError(`Calling handle without a successful canHandle call.`);
        }
        const filters = metadata.quads(subject, Vocabularies_1.DERIVED.terms.filter);
        if (filters.length !== 1) {
            throw new community_server_1.InternalServerError(`Derived resources need exactly 1 filter. Found ${filters.length} for ${subject.value}`);
        }
        const configMetadata = new community_server_1.RepresentationMetadata(subject);
        configMetadata.addQuads([...this.getRelevantQuads(subject, metadata)]);
        this.logger.debug(`Found derived resource match for ${identifier.path} with subject ${subject.value}`);
        return {
            identifier,
            // Since we currently ignore the query part of a URI template we need to add the query parameters here as well
            mappings: { ...match, ...(0, QueryResourceIdentifier_1.isQueryResourceIdentifier)(identifier) ? identifier.query : {} },
            selectors: metadata.quads(subject, Vocabularies_1.DERIVED.terms.selector).map((quad) => quad.object.value),
            filter: filters[0].object.value,
            metadata: configMetadata,
        };
    }
    /**
     * Returns true if the term is a Named or Blank node.
     */
    isValidDerivedSubject(term) {
        return term.termType === 'NamedNode' || term.termType === 'BlankNode';
    }
    *getRelevantQuads(subject, metadata, cache = new Set()) {
        if (subject.termType !== 'NamedNode' && subject.termType !== 'BlankNode') {
            return;
        }
        if (cache.has(subject.value)) {
            return;
        }
        cache.add(subject.value);
        const quads = metadata.quads(subject);
        yield* quads;
        for (const quad of quads) {
            yield* this.getRelevantQuads(quad.object, metadata, cache);
        }
    }
}
exports.TemplateDerivationMatcher = TemplateDerivationMatcher;
//# sourceMappingURL=TemplateDerivationMatcher.js.map