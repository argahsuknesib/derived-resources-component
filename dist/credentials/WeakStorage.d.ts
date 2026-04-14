import type { KeyValueStorage } from '@solid/community-server';
/**
 * A {@link KeyValueStorage} that uses a {@link WeakMap} to store the values.
 * Because of this, the key value is expected to be an object and not a primitive value.
 */
export declare class WeakStorage<TKey extends Record<string, unknown>, TValue> implements KeyValueStorage<TKey, TValue> {
    protected readonly cache: WeakMap<TKey, TValue>;
    constructor();
    get(key: TKey): Promise<TValue | undefined>;
    has(key: TKey): Promise<boolean>;
    set(key: TKey, value: TValue): Promise<this>;
    delete(key: TKey): Promise<boolean>;
    entries(): never;
}
