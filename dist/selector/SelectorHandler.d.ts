import type { Representation } from '@solid/community-server';
import { AsyncHandler } from 'asynchronous-handlers';
import type { DerivationConfig } from '../DerivationConfig';
/**
 * Acquires one or more {@link Representation}s based on a {@link DerivationConfig}.
 */
export declare abstract class SelectorHandler extends AsyncHandler<DerivationConfig, Representation[]> {
}
