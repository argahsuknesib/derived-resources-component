"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizedSelectorParser = void 0;
const community_server_1 = require("@solid/community-server");
const Vocabularies_1 = require("../Vocabularies");
const SelectorParser_1 = require("./SelectorParser");
/**
 * A {@SelectorParser} that only returns identifiers from its source where the client has read access on.
 * To determine the credentials, a {@link CredentialsStorage} is used.
 * To prevent dependency loop issues when constructing classes,
 * this class is also a {@link ParamSetter} for its {@link PermissionReader} parameter.
 *
 * This removing of identifiers is only done
 * if the {@link DerivationConfig} contains the `derived:ReadableSources` feature.
 */
class AuthorizedSelectorParser extends SelectorParser_1.SelectorParser {
    source;
    storage;
    internalPermissionReader;
    constructor(source, storage) {
        super();
        this.source = source;
        this.storage = storage;
    }
    async setParam(permissionReader) {
        this.internalPermissionReader = permissionReader;
    }
    get permissionReader() {
        if (!this.internalPermissionReader) {
            throw new community_server_1.InternalServerError('Trying to access permission reader before initialization.');
        }
        return this.internalPermissionReader;
    }
    async canHandle(config) {
        return this.source.canHandle(config);
    }
    async handle(config) {
        const identifiers = await this.source.handle(config);
        if (!config.metadata.has(Vocabularies_1.DERIVED.terms.feature, Vocabularies_1.DERIVED.terms.ReadableSources)) {
            return identifiers;
        }
        const credentials = await this.storage.get(config.identifier) ?? {};
        const requestedModes = new community_server_1.IdentifierSetMultiMap();
        for (const identifier of identifiers) {
            requestedModes.set(identifier, 'read');
        }
        const permissions = await this.permissionReader.handleSafe({ credentials, requestedModes });
        return identifiers.filter((identifier) => Boolean(permissions.get(identifier)?.read));
    }
}
exports.AuthorizedSelectorParser = AuthorizedSelectorParser;
//# sourceMappingURL=AuthorizedSelectorParser.js.map