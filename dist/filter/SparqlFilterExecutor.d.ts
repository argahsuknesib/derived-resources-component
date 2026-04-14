import { QueryEngine } from '@comunica/query-sparql';
import type { Quad } from '@rdfjs/types';
import type { Representation } from '@solid/community-server';
import type * as asyncIt from 'asynciterator';
import type { N3FilterExecutorInput } from './N3FilterExecutor';
import { N3FilterExecutor } from './N3FilterExecutor';
/**
 * Applies a SPARQL filter to an N3.js store.
 */
export declare class SparqlFilterExecutor extends N3FilterExecutor<string> {
    protected readonly logger: import("global-logger-factory").Logger<unknown>;
    protected readonly engine: QueryEngine;
    constructor();
    canHandle({ filter }: N3FilterExecutorInput): Promise<void>;
    handle({ filter, data, config }: N3FilterExecutorInput): Promise<Representation>;
    /**
     * Converts a stream from the AsyncIterator library to an async generator.
     */
    protected convertAsyncIterator(it: asyncIt.AsyncIterator<Quad>): AsyncIterable<Quad>;
}
