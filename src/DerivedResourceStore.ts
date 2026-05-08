import type {
  ChangeMap,
  Conditions,
  IdentifierStrategy,
  Patch,
  Representation,
  RepresentationConverter,
  RepresentationPreferences,
  ResourceIdentifier,
  ResourceStore,
} from '@solid/community-server';
import { getLoggerFor } from 'global-logger-factory';
import {
  BasicRepresentation,
  DC,
  INTERNAL_QUADS,
  MethodNotAllowedHttpError,
  NotFoundHttpError,
  PassthroughStore,
  transformSafely,
} from '@solid/community-server';
import type { DerivationManager } from './DerivationManager';

/**
 * A {@link ResourceStore} which adds support for derived resources using a {@link DerivationManager}.
 * Assumes preferences will be handled by a previous store in the chain.
 * Prevents writing to a resource if it is a derived resource.
 */
export class DerivedResourceStore extends PassthroughStore {
  protected readonly logger = getLoggerFor(this);

  protected readonly manager: DerivationManager;
  protected readonly identifierStrategy: IdentifierStrategy;
  protected readonly converter: RepresentationConverter;

  public constructor(
    source: ResourceStore,
    manager: DerivationManager,
    identifierStrategy: IdentifierStrategy,
    converter: RepresentationConverter,
  ) {
    super(source);
    this.manager = manager;
    this.identifierStrategy = identifierStrategy;
    this.converter = converter;
  }

  public async hasResource(identifier: ResourceIdentifier): Promise<boolean> {
    if (this.isInternalIdentifier(identifier)) {
      return this.source.hasResource(identifier);
    }
    const exists = await this.source.hasResource(identifier);
    if (exists) {
      return exists;
    }
    return this.isDerivedResource(identifier, true);
  }

  public async getRepresentation(
    identifier: ResourceIdentifier,
    preferences: RepresentationPreferences = {},
    conditions?: Conditions,
  ): Promise<Representation> {
    if (this.isInternalIdentifier(identifier)) {
      return this.source.getRepresentation(identifier, preferences, conditions);
    }
    const firstResource = await this.getFirstExistingResource(identifier);
    this.logger.debug(`${firstResource.metadata.identifier.value
    } is the first resource that exists starting from ${identifier.path}`);
    const identifierExists = firstResource.metadata.identifier.value === identifier.path;
    const config = await this.manager.getDerivationConfig(identifier, firstResource.metadata);

    if (!config && identifierExists) {
      this.logger.info(`No derivation config found for existing resource ${identifier.path}; returning stored representation.`);
      return firstResource;
    }

    this.closeDataStream(firstResource);

    if (!config) {
      this.logger.info(`No derivation config found for ${identifier.path} using ancestor ${
        firstResource.metadata.identifier.value}; throwing 404.`);
      throw new NotFoundHttpError();
    }
    this.logger.info(`Resolved derivation config for ${identifier.path}: selectors=${
      JSON.stringify(config.selectors)}, filter=${config.filter}`);
    let result = await this.manager.deriveResource(identifier, config);

    // Reuse metadata if the resource had existing metadata
    if (identifierExists) {
      // Removing original content type to prevent duplicates
      firstResource.metadata.contentType = undefined;
      // Don't want to use the existing timestamp
      firstResource.metadata.removeAll(DC.terms.modified);
      result.metadata.setMetadata(firstResource.metadata);
    }

    return this.finalizeDerivedRepresentation(identifier, preferences, result);
  }

  public async addResource(
    container: ResourceIdentifier,
    representation: Representation,
    conditions?: Conditions,
  ): Promise<ChangeMap> {
    await this.assertNotDerived(container);
    return this.source.addResource(container, representation, conditions);
  }

  public async setRepresentation(
    identifier: ResourceIdentifier,
    representation: Representation,
    conditions?: Conditions,
  ): Promise<ChangeMap> {
    await this.assertNotDerived(identifier);
    return this.source.setRepresentation(identifier, representation, conditions);
  }

  public async modifyResource(
    identifier: ResourceIdentifier,
    patch: Patch,
    conditions?: Conditions,
  ): Promise<ChangeMap> {
    await this.assertNotDerived(identifier);
    return this.source.modifyResource(identifier, patch, conditions);
  }

  public async deleteResource(identifier: ResourceIdentifier, conditions?: Conditions): Promise<ChangeMap> {
    await this.assertNotDerived(identifier);
    return this.source.deleteResource(identifier, conditions);
  }

  /**
   * Asserts the identifier does not correspond to a derived resource.
   */
  protected async assertNotDerived(identifier: ResourceIdentifier): Promise<void> {
    if (this.isInternalIdentifier(identifier)) {
      return;
    }
    if (await this.isDerivedResource(identifier)) {
      throw new MethodNotAllowedHttpError([ 'POST', 'PUT', 'PATCH', 'DELETE' ]);
    }
  }

  /**
   * Derived resources should never be resolved for CSS internal state resources.
   */
  protected isInternalIdentifier(identifier: ResourceIdentifier): boolean {
    return /\/\.internal(?:\/|$)/u.test(identifier.path);
  }

  /**
   * Determines if the identifier corresponds to a derived resource.
   * `skipFirst` parameter will be passed to `getFirstExistingResource` call.
   */
  protected async isDerivedResource(identifier: ResourceIdentifier, skipFirst = false): Promise<boolean> {
    try {
      const parent = await this.getFirstExistingResource(identifier, skipFirst);
      this.closeDataStream(parent);
      this.logger.debug(`${parent.metadata.identifier.value
      } is the first resource that exists starting from ${identifier.path}`);
      const config = await this.manager.getDerivationConfig(identifier, parent.metadata);

      return Boolean(config);
    } catch (error: unknown) {
      // Depending on the backend, it is possible that the root container does not exist yet, which could throw an error
      if (NotFoundHttpError.isInstance(error)) {
        return false;
      }
      throw error;
    }
  }

  /**
   * Finds the first resource in the container chain that exists, starting from the given identifier.
   * `skipFirst` can be used if you know the input identifier will have no match.
   */
  protected async getFirstExistingResource(identifier: ResourceIdentifier, skipFirst = false): Promise<Representation> {
    try {
      if (skipFirst) {
        throw new NotFoundHttpError();
      }
      // `await` is important here to make sure the error triggers
      return await this.source.getRepresentation(identifier, {});
    } catch (error: unknown) {
      if (NotFoundHttpError.isInstance(error) && !this.identifierStrategy.isRootContainer(identifier)) {
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
  protected closeDataStream(representation: Representation): void {
    // Best-effort drain of the stream. Destroying can surface as "premature close"
    // in downstream pipeline consumers during startup/initialization probes.
    representation.data.on('error', (): void => {});
    representation.data.resume();
  }

  /**
   * Ensures derived RDF resources leave this store with an external HTTP media type.
   */
  protected async finalizeDerivedRepresentation(
    identifier: ResourceIdentifier,
    preferences: RepresentationPreferences,
    representation: Representation,
  ): Promise<Representation> {
    const quadStats = { count: 0 };
    let result = representation;

    if (representation.metadata.contentType === INTERNAL_QUADS) {
      this.logger.info(`DerivedResourceStore: converting internal RDF representation for ${
        identifier.path} using preferences=${JSON.stringify(preferences.type ?? {})}`);
      result = await this.converter.handleSafe({
        identifier,
        representation: this.countInternalQuads(representation, quadStats),
        preferences,
      });
    }

    return this.logFinalRepresentation(identifier, result, quadStats);
  }

  /**
   * Counts the quads that flow through an internal RDF representation.
   */
  protected countInternalQuads(representation: Representation, stats: { count: number }): Representation {
    const counted = transformSafely(representation.data, {
      objectMode: true,
      transform: (quad): void => {
        stats.count += 1;
        counted.push(quad);
      },
    });

    return new BasicRepresentation(counted, representation.metadata, representation.binary);
  }

  /**
   * Logs the final response characteristics without consuming the stream ahead of CSS.
   */
  protected logFinalRepresentation(
    identifier: ResourceIdentifier,
    representation: Representation,
    quadStats: { count: number },
  ): Representation {
    let byteCount = 0;
    const logged = transformSafely(representation.data, {
      objectMode: representation.data.readableObjectMode,
      transform: (chunk): void => {
        if (typeof chunk === 'string') {
          byteCount += Buffer.byteLength(chunk);
        } else if (Buffer.isBuffer(chunk)) {
          byteCount += chunk.byteLength;
        }
        logged.push(chunk);
      },
      flush: (): void => {
        this.logger.info(`DerivedResourceStore: final representation for ${identifier.path}: contentType=${
          representation.metadata.contentType ?? 'undefined'}, quadCount=${quadStats.count}, byteCount=${byteCount}`);
      },
    });

    return new BasicRepresentation(logged, representation.metadata, representation.binary);
  }
}
