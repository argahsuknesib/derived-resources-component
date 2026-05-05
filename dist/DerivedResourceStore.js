"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DerivedResourceStore = void 0;
const global_logger_factory_1 = require("global-logger-factory");
const community_server_1 = require("@solid/community-server");
/**
 * A {@link ResourceStore} which adds support for derived resources using a {@link DerivationManager}.
 * Assumes preferences will be handled by a previous store in the chain.
 * Prevents writing to a resource if it is a derived resource.
 */
class DerivedResourceStore extends community_server_1.PassthroughStore {
    logger = (0, global_logger_factory_1.getLoggerFor)(this);
    manager;
    identifierStrategy;
    constructor(source, manager, identifierStrategy) {
        super(source);
        this.manager = manager;
        this.identifierStrategy = identifierStrategy;
    }
    async hasResource(identifier) {
        if (this.isInternalIdentifier(identifier)) {
            return this.source.hasResource(identifier);
        }
        const exists = await this.source.hasResource(identifier);
        if (exists) {
            return exists;
        }
        return this.isDerivedResource(identifier, true);
    }
    async getRepresentation(identifier, preferences = {}, conditions) {
        if (this.isInternalIdentifier(identifier)) {
            return this.source.getRepresentation(identifier, preferences, conditions);
        }
        const firstResource = await this.getFirstExistingResource(identifier);
        this.logger.debug(`${firstResource.metadata.identifier.value} is the first resource that exists starting from ${identifier.path}`);
        const identifierExists = firstResource.metadata.identifier.value === identifier.path;
        const config = await this.manager.getDerivationConfig(identifier, firstResource.metadata);
        if (!config && identifierExists) {
            this.logger.info(`No derivation config found for existing resource ${identifier.path}; returning stored representation.`);
            return firstResource;
        }
        this.closeDataStream(firstResource);
        if (!config) {
            this.logger.info(`No derivation config found for ${identifier.path} using ancestor ${firstResource.metadata.identifier.value}; throwing 404.`);
            throw new community_server_1.NotFoundHttpError();
        }
        this.logger.info(`Resolved derivation config for ${identifier.path}: selectors=${JSON.stringify(config.selectors)}, filter=${config.filter}`);
        const result = await this.manager.deriveResource(identifier, config);
        // Reuse metadata if the resource had existing metadata
        if (identifierExists) {
            // Removing original content type to prevent duplicates
            firstResource.metadata.contentType = undefined;
            // Don't want to use the existing timestamp
            firstResource.metadata.removeAll(community_server_1.DC.terms.modified);
            result.metadata.setMetadata(firstResource.metadata);
        }
        return result;
    }
    async addResource(container, representation, conditions) {
        await this.assertNotDerived(container);
        return this.source.addResource(container, representation, conditions);
    }
    async setRepresentation(identifier, representation, conditions) {
        await this.assertNotDerived(identifier);
        return this.source.setRepresentation(identifier, representation, conditions);
    }
    async modifyResource(identifier, patch, conditions) {
        await this.assertNotDerived(identifier);
        return this.source.modifyResource(identifier, patch, conditions);
    }
    async deleteResource(identifier, conditions) {
        await this.assertNotDerived(identifier);
        return this.source.deleteResource(identifier, conditions);
    }
    /**
     * Asserts the identifier does not correspond to a derived resource.
     */
    async assertNotDerived(identifier) {
        if (this.isInternalIdentifier(identifier)) {
            return;
        }
        if (await this.isDerivedResource(identifier)) {
            throw new community_server_1.MethodNotAllowedHttpError(['POST', 'PUT', 'PATCH', 'DELETE']);
        }
    }
    /**
     * Derived resources should never be resolved for CSS internal state resources.
     */
    isInternalIdentifier(identifier) {
        return /\/\.internal(?:\/|$)/u.test(identifier.path);
    }
    /**
     * Determines if the identifier corresponds to a derived resource.
     * `skipFirst` parameter will be passed to `getFirstExistingResource` call.
     */
    async isDerivedResource(identifier, skipFirst = false) {
        try {
            const parent = await this.getFirstExistingResource(identifier, skipFirst);
            this.closeDataStream(parent);
            this.logger.debug(`${parent.metadata.identifier.value} is the first resource that exists starting from ${identifier.path}`);
            const config = await this.manager.getDerivationConfig(identifier, parent.metadata);
            return Boolean(config);
        }
        catch (error) {
            // Depending on the backend, it is possible that the root container does not exist yet, which could throw an error
            if (community_server_1.NotFoundHttpError.isInstance(error)) {
                return false;
            }
            throw error;
        }
    }
    /**
     * Finds the first resource in the container chain that exists, starting from the given identifier.
     * `skipFirst` can be used if you know the input identifier will have no match.
     */
    async getFirstExistingResource(identifier, skipFirst = false) {
        try {
            if (skipFirst) {
                throw new community_server_1.NotFoundHttpError();
            }
            // `await` is important here to make sure the error triggers
            return await this.source.getRepresentation(identifier, {});
        }
        catch (error) {
            if (community_server_1.NotFoundHttpError.isInstance(error) && !this.identifierStrategy.isRootContainer(identifier)) {
                this.logger.debug(`${identifier.path} does not exist, going up the container chain.`);
                const parent = this.identifierStrategy.getParentContainer(identifier);
                return this.getFirstExistingResource(parent);
            }
            throw error;
        }
    }
    /**
     * Closes the data stream in the representation, without emitting an error.
     */
    closeDataStream(representation) {
        // Best-effort drain of the stream. Destroying can surface as "premature close"
        // in downstream pipeline consumers during startup/initialization probes.
        representation.data.on('error', () => { });
        representation.data.resume();
    }
}
exports.DerivedResourceStore = DerivedResourceStore;
//# sourceMappingURL=DerivedResourceStore.js.map