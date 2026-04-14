import type { Representation } from '@solid/community-server';
import type { FilterExecutorInput } from './FilterExecutor';
import { FilterExecutor } from './FilterExecutor';
import type { N3FilterExecutor } from './N3FilterExecutor';
/**
 * Converts the input quad streams into a single N3.js store and calls an {@link N3FilterExecutor}.
 */
export declare class StoreDataFilterExecutor extends FilterExecutor {
    protected readonly source: N3FilterExecutor;
    constructor(source: N3FilterExecutor);
    canHandle(input: FilterExecutorInput): Promise<void>;
    handle(input: FilterExecutorInput): Promise<Representation>;
}
