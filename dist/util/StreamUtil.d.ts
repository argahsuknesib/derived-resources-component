/// <reference types="node" />
import type { Readable } from 'node:stream';
/**
 * Merge the contents of several streams into a single stream.
 *
 * @param streams - The input streams, either as an array or separate parameters.
 */
export declare function mergeStreams(...streams: Readable[] | [Readable[]]): Readable;
/**
 * Takes the first X elements of a stream.
 * Returns those elements, and the stream that should be used to read the remainder from.
 * A new stream is returned instead of letting the old one be reused
 * as it is not possible to reset a stream to its initial undefined reading state,
 * which would force the user into the reading mode we chose for this function.
 * https://nodejs.org/docs/latest-v18.x/api/stream.html#three-states
 *
 * The returned stream will be marked as ended if all the elements were read.
 *
 * Note that `stream.pick` exists, but does not allow you to read the remainder from the stream.
 *
 * @param stream - Stream to take elements from.
 * @param amount - How many elements to take.
 */
export declare function take(stream: Readable, amount: number): Promise<{
    head: unknown[];
    tail: Readable;
}>;
