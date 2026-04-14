import type { Representation } from '@solid/community-server';
import type { FilterExecutorInput } from './FilterExecutor';
import { FilterExecutor } from './FilterExecutor';
export declare class LatestFilterExecutor extends FilterExecutor {
    canHandle({ filter }: FilterExecutorInput): Promise<void>;
    handle(input: FilterExecutorInput): Promise<Representation>;
}
