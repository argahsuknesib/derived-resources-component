"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseDerivationManager = void 0;
const community_server_1 = require("@solid/community-server");
const global_logger_factory_1 = require("global-logger-factory");
const Vocabularies_1 = require("./Vocabularies");
/**
 * Derives resource information with the use of several helper classes.
 * The {@link DerivationMatcher} determines the metadata that corresponds to the incoming identifier,
 * the {@link SelectorHandler} determines the input sources,
 * and the {@link FilterHandler} filters the relevant data from the input sources.
 */
class BaseDerivationManager {
    logger = (0, global_logger_factory_1.getLoggerFor)(this);
    derivationMatcher;
    selectorHandler;
    filterHandler;
    constructor(args) {
        this.derivationMatcher = args.derivationMatcher;
        this.selectorHandler = args.selectorHandler;
        this.filterHandler = args.filterHandler;
    }
    /**
     * Finds the derivation triples in the given metadata that correspond to the given identifier, if any.
     */
    async getDerivationConfig(identifier, metadata) {
        const derived = metadata.getAll(Vocabularies_1.DERIVED.terms.derivedResource);
        this.logger.info(`BaseDerivationManager.getDerivationConfig: identifier=${identifier.path}, metadataIdentifier=${metadata.identifier.value}, derivedCount=${derived.length}`);
        for (const subject of derived) {
            try {
                const config = await this.derivationMatcher.handleSafe({ identifier, metadata, subject });
                this.logger.info(`BaseDerivationManager.getDerivationConfig: matched subject ${subject.value} for ${identifier.path}`);
                return config;
            }
            catch (error) {
                this.logger.debug(`Did not found a valid derivation for ${identifier.path}: ${(0, community_server_1.createErrorMessage)(error)}`);
            }
        }
        this.logger.info(`BaseDerivationManager.getDerivationConfig: no matching derivation found for ${identifier.path}`);
    }
    /**
     * Generates the representation for the derived resource.
     */
    async deriveResource(identifier, config) {
        this.logger.debug(`Deriving contents of resource ${identifier.path}`);
        const representations = await this.selectorHandler.handleSafe(config);
        // Apply the filter to the data
        return this.filterHandler.handleSafe({ config, representations });
    }
}
exports.BaseDerivationManager = BaseDerivationManager;
//# sourceMappingURL=BaseDerivationManager.js.map