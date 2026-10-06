import type { ProfileConfig } from './types.ts';
/** Preserve inference while making configuration mistakes visible in your editor. Validation runs at generation. */
export function defineProfile<const T extends ProfileConfig>(config: T): T { return config; }
