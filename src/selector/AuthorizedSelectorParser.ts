import type {
  AccessMap,
  PermissionReader,
  ResourceIdentifier,
} from '@solid/community-server';
import {
  IdentifierSetMultiMap,
  InternalServerError,
} from '@solid/community-server';
import { getLoggerFor } from 'global-logger-factory';
import type { CredentialsStorage } from '../credentials/CredentialsStorage';
import type { DerivationConfig } from '../DerivationConfig';
import type { ParamSetter } from '../init/ParamSetter';
import { DERIVED } from '../Vocabularies';
import { SelectorParser } from './SelectorParser';

/**
 * A {@SelectorParser} that only returns identifiers from its source where the client has read access on.
 * To determine the credentials, a {@link CredentialsStorage} is used.
 * To prevent dependency loop issues when constructing classes,
 * this class is also a {@link ParamSetter} for its {@link PermissionReader} parameter.
 *
 * This removing of identifiers is only done
 * if the {@link DerivationConfig} contains the `derived:ReadableSources` feature.
 */
export class AuthorizedSelectorParser extends SelectorParser implements ParamSetter<PermissionReader> {
  protected readonly logger = getLoggerFor(this);

  protected readonly source: SelectorParser;
  protected readonly storage: CredentialsStorage;
  protected internalPermissionReader: PermissionReader | undefined;

  public constructor(source: SelectorParser, storage: CredentialsStorage) {
    super();
    this.source = source;
    this.storage = storage;
  }

  public async setParam(permissionReader: PermissionReader): Promise<void> {
    this.internalPermissionReader = permissionReader;
  }

  protected get permissionReader(): PermissionReader {
    if (!this.internalPermissionReader) {
      throw new InternalServerError('Trying to access permission reader before initialization.');
    }
    return this.internalPermissionReader;
  }

  public async canHandle(config: DerivationConfig): Promise<void> {
    return this.source.canHandle(config);
  }

  public async handle(config: DerivationConfig): Promise<ResourceIdentifier[]> {
    const identifiers = await this.source.handle(config);
    this.logger.info(`AuthorizedSelectorParser.handle: initialIdentifiers=${
      JSON.stringify(identifiers.map((identifier): string => identifier.path))}`);

    if (!config.metadata.has(DERIVED.terms.feature, DERIVED.terms.ReadableSources)) {
      this.logger.info('AuthorizedSelectorParser.handle: readableSources feature disabled, skipping permission filter');
      return identifiers;
    }

    const credentials = await this.storage.get(config.identifier) ?? {};
    const requestedModes: AccessMap = new IdentifierSetMultiMap<string>();
    for (const identifier of identifiers) {
      requestedModes.set(identifier, 'read');
    }

    const permissions = await this.permissionReader.handleSafe({ credentials, requestedModes });
    const filtered = identifiers.filter((identifier): boolean => Boolean(permissions.get(identifier)?.read));
    this.logger.info(`AuthorizedSelectorParser.handle: readableSources feature enabled, filteredIdentifiers=${
      JSON.stringify(filtered.map((identifier): string => identifier.path))}`);
    return filtered;
  }
}
