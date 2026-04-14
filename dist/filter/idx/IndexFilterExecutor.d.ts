/// <reference types="node" />
import type { Readable } from 'node:stream';
import type { BlankNode, Quad, Quad_Object } from '@rdfjs/types';
import type { Representation } from '@solid/community-server';
import { Store } from 'n3';
import type { FilterExecutorInput } from '../FilterExecutor';
import { FilterExecutor } from '../FilterExecutor';
import type { QuadPatternExecutor } from './QuadPatternExecutor';
declare const EXPECTED_KEYS: readonly ["subject", "predicate", "object", "graph"];
/**
 * A {@link FilterExecutor} that generates derived index resources.
 * Supports filter resources containing a JSON object which is a partial Quad.
 * The partial Quad should contain 1 variable.
 * For every triple in the input resources that matches the filter,
 * triples will be generated indicating which resource contained the match,
 * and which value was in the variable position.
 */
export declare class IndexFilterExecutor extends FilterExecutor {
    protected readonly quadPatternExecutor: QuadPatternExecutor;
    constructor(quadPatternExecutor: QuadPatternExecutor);
    canHandle({ filter, representations }: FilterExecutorInput<Partial<Quad>>): Promise<void>;
    handle(input: FilterExecutorInput<Partial<Quad>>): Promise<Representation>;
    protected createQuadFn(position: typeof EXPECTED_KEYS[number], store: Store, matches: Record<string, BlankNode>, instance: Quad_Object): (quad: Quad) => Quad[];
    protected createTransform(data: Readable, quadFn: (quad: Quad) => Quad[]): Readable;
}
export {};
