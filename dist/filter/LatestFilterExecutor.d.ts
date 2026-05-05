import type { Representation } from '@solid/community-server';
import type { FilterExecutorInput } from './FilterExecutor';
import { FilterExecutor } from './FilterExecutor';
export declare class LatestFilterExecutor extends FilterExecutor {
    protected logger: import("global-logger-factory").Logger<unknown>;
    canHandle({ filter }: FilterExecutorInput): Promise<void>;
    handle(input: FilterExecutorInput): Promise<Representation>;
}
