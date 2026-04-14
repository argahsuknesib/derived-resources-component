"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StoreCredentialsAuthorizer = void 0;
const community_server_1 = require("@solid/community-server");
/**
 * An {@link Authorizer} that stores the credentials in a {@link CredentialsStorage}.
 * Does nothing else, so you probably also want a different {@link Authorizer} for actual authorization.
 */
class StoreCredentialsAuthorizer extends community_server_1.Authorizer {
    storage;
    constructor(storage) {
        super();
        this.storage = storage;
    }
    async handle(input) {
        const requested = new Set(input.requestedModes.keys());
        for (const identifier of requested) {
            await this.storage.set(identifier, input.credentials);
        }
    }
}
exports.StoreCredentialsAuthorizer = StoreCredentialsAuthorizer;
//# sourceMappingURL=StoreCredentialsAuthorizer.js.map