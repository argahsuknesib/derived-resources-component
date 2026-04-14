import type { Quad } from '@rdfjs/types';
import type { Representation, ResourceIdentifier } from '@solid/community-server';
import type { FilterExecutorInput } from '../FilterExecutor';
import { FilterExecutor } from '../FilterExecutor';
import type { QuadPatternExecutor } from './QuadPatternExecutor';
/**
 * A {@link FilterExecutor} exposing a QPF endpoint.
 * Due to the streaming nature of how data is used,
 * the response will always be two pages:
 * the first page is empty with only the metadata,
 * the next page will contain all the data as well.
 * For the same reason, the triple count will always be set to 1 million.
 * The reason for using two pages is to prevent querying engines that are checking the counts
 * from having to download all the data as well.
 * The reason we don't return partial data on the first page
 * is because we can't guarantee the order of the incoming data stream,
 * so we can't know which triples would need to be returned on the second page.
 *
 * To somewhat circumvent this issue,
 * a set amount of triples will be read into memory from the data stream,
 * before we generate the result stream.
 * If this causes the entire stream to be read,
 * we can give an accurate count result,
 * meaning only large result streams will have inaccurate results.
 * Such cases will also immediately return all their results on the first page,
 * instead of hiding their data on a second page.
 * By default, this value is set to 1000.
 * It can be set to 0 to always first read all results into memory for an accurate count.
 */
export declare class QpfFilterExecutor extends FilterExecutor {
    protected readonly quadPatternExecutor: QuadPatternExecutor;
    protected readonly quadLimit: number;
    constructor(quadFilterParser: QuadPatternExecutor, quadLimit?: number);
    canHandle({ representations, filter }: FilterExecutorInput): Promise<void>;
    handle({ representations, config }: FilterExecutorInput): Promise<Representation>;
    protected generateFilter(mappings: Partial<Record<string, string>>): Partial<Quad>;
    protected getMetaQuads(identifier: ResourceIdentifier, size?: number, nextPage?: boolean): Quad[];
    protected identifierToString(identifier: ResourceIdentifier): string;
}
