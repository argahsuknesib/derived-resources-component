/// <reference types="node" />
import type { Readable } from 'node:stream';
import type { Guarded } from '@solid/community-server';
import type { QuadPatternExecutorArgs } from './QuadPatternExecutor';
import { QuadPatternExecutor } from './QuadPatternExecutor';
/**
 * A {@link QuadPatternExecutor} that removes all triples from a representation data stream
 * that do not match a given quad template.
 */
export declare class BaseQuadPatternExecutor extends QuadPatternExecutor {
    handle({ filter, representation }: QuadPatternExecutorArgs): Promise<Guarded<Readable>>;
}
