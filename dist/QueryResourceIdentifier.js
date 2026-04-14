"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isResourceIdentifier = exports.isQueryResourceIdentifier = void 0;
/**
 * Checks if the given {@link ResourceIdentifier} is a {@link QueryResourceIdentifier}
 *
 * @param identifier
 */
function isQueryResourceIdentifier(identifier) {
    return 'query' in identifier;
}
exports.isQueryResourceIdentifier = isQueryResourceIdentifier;
/**
 * Checks if the given value is a {@link ResourceIdentifier}.
 *
 * @param value
 */
function isResourceIdentifier(value) {
    return typeof value === 'object' &&
        value !== null &&
        'path' in value &&
        typeof value.path === 'string';
}
exports.isResourceIdentifier = isResourceIdentifier;
//# sourceMappingURL=QueryResourceIdentifier.js.map