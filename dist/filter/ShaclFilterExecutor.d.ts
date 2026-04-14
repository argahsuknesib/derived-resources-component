import type { Quad, Term } from '@rdfjs/types';
import type { Representation } from '@solid/community-server';
import type { Store } from 'n3';
import type { N3FilterExecutorInput } from './N3FilterExecutor';
import { N3FilterExecutor } from './N3FilterExecutor';
export interface PredicatePath extends Record<string, PredicatePath> {
}
export declare class ShaclFilterExecutor extends N3FilterExecutor<Store> {
    protected readonly logger: import("global-logger-factory").Logger<unknown>;
    canHandle(input: N3FilterExecutorInput<Store>): Promise<void>;
    handle(input: N3FilterExecutorInput<Store>): Promise<Representation>;
    protected extractMatchingTriples(data: Store, shapes: Store): IterableIterator<Quad>;
    protected findFocusNodes(data: Store, shapes: Store): IterableIterator<{
        focusNode: Term;
        shapeNode: Term;
    }>;
    protected findValidPath(shapes: Store, shapeNode: Term): PredicatePath;
    protected mergePaths(pathA: PredicatePath, pathB: PredicatePath): PredicatePath;
    protected extractValidTriples(data: Store, path: PredicatePath, focusNode: Term): IterableIterator<Quad>;
}
