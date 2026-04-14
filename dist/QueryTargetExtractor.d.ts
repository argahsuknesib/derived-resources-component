import type { HttpRequest } from '@solid/community-server';
import { TargetExtractor } from '@solid/community-server';
import type { QueryResourceIdentifier } from './QueryResourceIdentifier';
/**
 * Uses a different {@link TargetExtractor} to generate a {@link ResourceIdentifier},
 * after which it parses the query parameters and adds those as well.
 */
export declare class QueryTargetExtractor extends TargetExtractor {
    protected readonly targetExtractor: TargetExtractor;
    constructor(targetExtractor: TargetExtractor);
    canHandle(input: {
        request: HttpRequest;
    }): Promise<void>;
    handle(input: {
        request: HttpRequest;
    }): Promise<QueryResourceIdentifier>;
}
