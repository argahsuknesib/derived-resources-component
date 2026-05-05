"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GlobSelectorParser = void 0;
const global_logger_factory_1 = require("global-logger-factory");
const community_server_1 = require("@solid/community-server");
const SelectorParser_1 = require("./SelectorParser");
/**
 * Interprets selectors as resource identifiers.
 * The selector can contain glob patterns `*` or `**`.
 * How these are interpreted is based on https://www.digitalocean.com/community/tools/glob.
 */
class GlobSelectorParser extends SelectorParser_1.SelectorParser {
    logger = (0, global_logger_factory_1.getLoggerFor)(this);
    store;
    constructor(store) {
        super();
        this.store = store;
    }
    async handle({ selectors }) {
        this.logger.debug(`GlobSelectorParser.handle: selectors=${JSON.stringify(selectors)}`);
        const promises = selectors.map(async (selector) => (0, community_server_1.asyncToArray)(this.handleSelector(selector)));
        const result = (await Promise.all(promises)).flat();
        this.logger.debug(`GlobSelectorParser.handle: matchedIdentifiers=${JSON.stringify(result.map((id) => id.path))}`);
        return result;
    }
    async *handleSelector(path) {
        const match = /\*\*?/u.exec(path);
        if (!match) {
            if (await this.store.hasResource({ path })) {
                this.logger.debug(`Returning selector ${path} as an identifier`);
                return yield { path };
            }
            return;
        }
        // There is (at least) 1 glob pattern in the path
        const head = path.slice(0, match.index);
        const glob = match[0];
        const tail = path.slice(match.index + glob.length);
        const containerPath = head.slice(0, head.lastIndexOf('/') + 1);
        const container = await this.store.getRepresentation({ path: containerPath }, {});
        const childPaths = container.metadata.getAll(community_server_1.LDP.terms.contains).map((term) => term.value)
            .map((child) => this.normalizeChildPath(child, containerPath));
        this.logger.debug(`GlobSelectorParser.handleSelector: path=${path}, containerPath=${containerPath}, childCount=${childPaths.length}`);
        const params = { glob, head, tail, childPaths };
        if (!head.endsWith('/') || (tail.length > 0 && !tail.startsWith('/'))) {
            yield* this.handleInternalGlob(params);
        }
        else if (glob === '**') {
            yield* this.handleDouble(params);
        }
        else if (glob === '*') {
            yield* this.handleSingle(params);
        }
    }
    /**
     * Ensures `ldp:contains` values are absolute against the container path.
     * Some stores expose relative IRIs in metadata (e.g., `<abc123>`), which
     * would never match absolute selectors such as `http://.../spo2/*`.
     */
    normalizeChildPath(childPath, containerPath) {
        if (/^[a-z][a-z0-9+.-]*:/iu.test(childPath) || childPath.startsWith('/')) {
            return childPath;
        }
        try {
            return new URL(childPath, containerPath).toString();
        }
        catch {
            return childPath;
        }
    }
    /**
     * Handles the case of having a `*` or `**` next to non-`/` characters.
     * E.g., `/foo/*.js`.
     * `**` is treated identical as `*` in this case.
     */
    async *handleInternalGlob({ glob, head, tail, childPaths }) {
        const parts = tail.split('/');
        const subTail = parts[0].slice(glob.length) + (parts.length > 1 ? '/' : '');
        // In case there are still characters remaining, we should only find the containers and append them
        const rest = parts.slice(1).join('/');
        this.logger.debug(`Recursively handling all paths starting with "${head}" and ending with "${subTail}"`);
        for (const child of childPaths) {
            if (child.startsWith(head) && child.endsWith(subTail)) {
                yield* this.handleSelector(`${child}${rest}`);
            }
        }
    }
    /**
     * Handles the case of having a `**` in the path.
     */
    async *handleDouble({ head, tail, childPaths }) {
        // Just removing the `**`
        yield* this.handleSelector(`${head}${tail.slice(1)}`);
        for (const child of childPaths) {
            if ((0, community_server_1.isContainerPath)(child)) {
                this.logger.debug(`Recursively handling all paths matching ${child}**${tail}`);
                yield* this.handleSelector(`${child}**${tail}`);
            }
            else if (tail.length === 0) {
                // Only yielding documents here as the containers will be yielded in the recursive call above
                yield* this.handleSelector(child);
            }
        }
    }
    /**
     * Handles the case of having a `*` in the path.
     */
    async *handleSingle({ tail, childPaths }) {
        for (const child of childPaths) {
            if ((0, community_server_1.isContainerPath)(child) && tail.length > 0) {
                this.logger.debug(`Recursively handling all paths matching ${child}${tail.slice(1)}`);
                yield* this.handleSelector(`${child}${tail.slice(1)}`);
            }
            else if (tail.length === 0) {
                yield* this.handleSelector(child);
            }
        }
    }
}
exports.GlobSelectorParser = GlobSelectorParser;
//# sourceMappingURL=GlobSelectorParser.js.map