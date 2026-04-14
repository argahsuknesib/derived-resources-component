"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isQueryResourceIdentifier = void 0;
/**
 * Checks if the given {@link ResourceIdentifier} is a {@link QueryResourceIdentifier}
 *
 * @param identifier
 */
function isQueryResourceIdentifier(identifier) {
    return 'query' in identifier;
}
exports.isQueryResourceIdentifier = isQueryResourceIdentifier;
//# sourceMappingURL=QueryResourceIdentifier.js.map