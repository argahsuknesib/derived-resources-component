"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParamInitializer = void 0;
const community_server_1 = require("@solid/community-server");
const global_logger_factory_1 = require("global-logger-factory");
/**
 * Assigns the value for a {@link ParamSetter}.
 * This assignment already happens in the constructor,
 * the actual handle call to this Initializer is irrelevant.
 */
class ParamInitializer extends community_server_1.Initializer {
    logger = (0, global_logger_factory_1.getLoggerFor)(this);
    constructor(paramSetter, param) {
        super();
        if (!Array.isArray(paramSetter)) {
            paramSetter = [paramSetter];
        }
        for (const setter of paramSetter) {
            setter.setParam(param).catch((error) => {
                this.logger.error(`Unable to set parameter: ${(0, community_server_1.createErrorMessage)(error)}`);
                // eslint-disable-next-line unicorn/no-process-exit
                process.exit(1);
            });
        }
    }
    async handle() {
        // Does nothing but we need the function.
    }
}
exports.ParamInitializer = ParamInitializer;
//# sourceMappingURL=ParamInitializer.js.map