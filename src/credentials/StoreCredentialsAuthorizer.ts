import type { AuthorizerInput } from '@solid/community-server';
import { Authorizer } from '@solid/community-server';
import { isResourceIdentifier } from '../QueryResourceIdentifier';
import type { CredentialsStorage } from './CredentialsStorage';

/**
 * An {@link Authorizer} that stores the credentials in a {@link CredentialsStorage}.
 * Does nothing else, so you probably also want a different {@link Authorizer} for actual authorization.
 */
export class StoreCredentialsAuthorizer extends Authorizer {
  protected readonly storage: CredentialsStorage;

  public constructor(storage: CredentialsStorage) {
    super();
    this.storage = storage;
  }

  public async handle(input: AuthorizerInput): Promise<void> {
    for (const identifier of input.requestedModes.keys()) {
      if (!isResourceIdentifier(identifier)) {
        throw new TypeError('Unexpected requested mode key: expected ResourceIdentifier.');
      }
      await this.storage.set(identifier, input.credentials);
    }
  }
}
