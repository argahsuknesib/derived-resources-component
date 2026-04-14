import type { Representation } from '@solid/community-server';
import type { FilterExecutor } from './FilterExecutor';
import type { FilterHandlerInput } from './FilterHandler';
import { FilterHandler } from './FilterHandler';
import type { FilterParser } from './parser/FilterParser';
/**
 * First parses the filter input into a {@link Filter} object,
 * which it then feeds into a {@link FilterExecutor}.
 *
 * Also adds timestamp en derivation metadata to the resulting {@link Representation}.
 */
export declare class BaseFilterHandler extends FilterHandler {
    protected readonly parser: FilterParser;
    protected readonly executor: FilterExecutor;
    constructor(parser: FilterParser, executor: FilterExecutor);
    canHandle(input: FilterHandlerInput): Promise<void>;
    handle(input: FilterHandlerInput): Promise<Representation>;
}
