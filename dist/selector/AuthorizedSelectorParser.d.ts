import type { PermissionReader, ResourceIdentifier } from '@solid/community-server';
import type { CredentialsStorage } from '../credentials/CredentialsStorage';
import type { DerivationConfig } from '../DerivationConfig';
import type { ParamSetter } from '../init/ParamSetter';
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
export declare class AuthorizedSelectorParser extends SelectorParser implements ParamSetter<PermissionReader> {
    protected readonly source: SelectorParser;
    protected readonly storage: CredentialsStorage;
    protected internalPermissionReader: PermissionReader | undefined;
    constructor(source: SelectorParser, storage: CredentialsStorage);
    setParam(permissionReader: PermissionReader): Promise<void>;
    protected get permissionReader(): PermissionReader;
    canHandle(config: DerivationConfig): Promise<void>;
    handle(config: DerivationConfig): Promise<ResourceIdentifier[]>;
}
