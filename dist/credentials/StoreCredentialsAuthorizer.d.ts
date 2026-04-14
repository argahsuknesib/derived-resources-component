import type { AuthorizerInput } from '@solid/community-server';
import { Authorizer } from '@solid/community-server';
import type { CredentialsStorage } from './CredentialsStorage';
/**
 * An {@link Authorizer} that stores the credentials in a {@link CredentialsStorage}.
 * Does nothing else, so you probably also want a different {@link Authorizer} for actual authorization.
 */
export declare class StoreCredentialsAuthorizer extends Authorizer {
    protected readonly storage: CredentialsStorage;
    constructor(storage: CredentialsStorage);
    handle(input: AuthorizerInput): Promise<void>;
}
