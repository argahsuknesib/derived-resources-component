import { Initializer } from '@solid/community-server';
import type { ParamSetter } from './ParamSetter';
/**
 * Assigns the value for a {@link ParamSetter}.
 * This assignment already happens in the constructor,
 * the actual handle call to this Initializer is irrelevant.
 */
export declare class ParamInitializer<T> extends Initializer {
    protected readonly logger: import("global-logger-factory").Logger<unknown>;
    constructor(paramSetter: ParamSetter<T> | ParamSetter<T>[], param: T);
    handle(): Promise<void>;
}
