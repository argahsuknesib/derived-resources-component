import type { ResourceIdentifier, ResourceStore } from '@solid/community-server';
import type { DerivationConfig } from '../DerivationConfig';
import { SelectorParser } from './SelectorParser';
export interface GlobParameters {
    glob: string;
    head: string;
    tail: string;
    childPaths: string[];
}
/**
 * Interprets selectors as resource identifiers.
 * The selector can contain glob patterns `*` or `**`.
 * How these are interpreted is based on https://www.digitalocean.com/community/tools/glob.
 */
export declare class GlobSelectorParser extends SelectorParser {
    protected readonly logger: import("global-logger-factory").Logger<unknown>;
    protected readonly store: ResourceStore;
    constructor(store: ResourceStore);
    handle({ selectors }: DerivationConfig): Promise<ResourceIdentifier[]>;
    protected handleSelector(path: string): AsyncIterable<ResourceIdentifier>;
    /**
     * Ensures `ldp:contains` values are absolute against the container path.
     * Some stores expose relative IRIs in metadata (e.g., `<abc123>`), which
     * would never match absolute selectors such as `http://.../spo2/*`.
     */
    protected normalizeChildPath(childPath: string, containerPath: string): string;
    /**
     * Handles the case of having a `*` or `**` next to non-`/` characters.
     * E.g., `/foo/*.js`.
     * `**` is treated identical as `*` in this case.
     */
    protected handleInternalGlob({ glob, head, tail, childPaths }: GlobParameters): AsyncIterable<ResourceIdentifier>;
    /**
     * Handles the case of having a `**` in the path.
     */
    protected handleDouble({ head, tail, childPaths }: GlobParameters): AsyncIterable<ResourceIdentifier>;
    /**
     * Handles the case of having a `*` in the path.
     */
    protected handleSingle({ tail, childPaths }: GlobParameters): AsyncIterable<ResourceIdentifier>;
}
