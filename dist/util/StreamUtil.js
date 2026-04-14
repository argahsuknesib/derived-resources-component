"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.take = exports.mergeStreams = void 0;
const node_stream_1 = require("node:stream");
const community_server_1 = require("@solid/community-server");
/**
 * Merge the contents of several streams into a single stream.
 *
 * @param streams - The input streams, either as an array or separate parameters.
 */
function mergeStreams(...streams) {
    let input = streams.length === 1 && Array.isArray(streams[0]) ? streams[0] : streams;
    input = input.filter((stream) => !stream.readableEnded);
    let count = input.length;
    const merged = new node_stream_1.PassThrough({ objectMode: true });
    for (const stream of input) {
        stream.pipe(merged, { end: false });
        stream.on('error', (error) => {
            merged.destroy(error);
        });
        stream.on('end', () => {
            count -= 1;
            if (count === 0) {
                merged.end();
            }
        });
    }
    return merged;
}
exports.mergeStreams = mergeStreams;
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
async function take(stream, amount) {
    if (!stream.readableObjectMode) {
        throw new community_server_1.InternalServerError('Trying to split non-object mode stream');
    }
    if (stream.readableEnded) {
        return { head: [], tail: stream };
    }
    const head = await new Promise((resolve, reject) => {
        const result = [];
        function listener(data) {
            result.push(data);
            if (result.length === amount) {
                stream.off('data', listener);
                stream.pause();
                resolve(result);
            }
        }
        stream.on('data', listener);
        stream.on('end', () => {
            resolve(result);
        });
        stream.on('error', (error) => {
            reject(error);
        });
    });
    if (stream.readableEnded) {
        return { head, tail: stream };
    }
    const tail = new node_stream_1.PassThrough({ objectMode: true });
    (0, community_server_1.pipeSafely)(stream, tail);
    stream.resume();
    return { head, tail };
}
exports.take = take;
//# sourceMappingURL=StreamUtil.js.map