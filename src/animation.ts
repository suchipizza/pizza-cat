import type { Animation, Point, Tween, Value } from './types.ts';

export interface Timing { readonly keyTimes?: readonly number[]; readonly discrete?: boolean }
function tween(channel: Tween['channel'], values: readonly Value[], duration: number, timing: Timing = {}): Tween {
  return { kind: 'tween', channel, values, duration, ...timing };
}
export const translate = (values: readonly Point[], duration: number, timing?: Timing): Animation => tween('translate', values, duration, timing);
export const rotate = (values: readonly number[], duration: number, timing?: Timing): Animation => tween('rotate', values, duration, timing);
export const scale = (values: readonly Point[], duration: number, timing?: Timing): Animation => tween('scale', values, duration, timing);
export const fade = (values: readonly number[], duration: number, timing?: Timing): Animation => tween('opacity', values, duration, timing);
export const frameSwap = (values: readonly string[], duration: number, keyTimes?: readonly number[]): Animation => tween('frame', values, duration, { discrete: true, ...(keyTimes ? { keyTimes } : {}) });
/** One path per actor; hold at its endpoints with delay()/sequence(). SVG path coordinates are offsets from the actor's anchor. */
export const motionPath = (path: string, duration: number, keyPoints: readonly number[] = [0, 1], keyTimes?: readonly number[]): Animation => ({
  ...tween('motion', keyPoints, duration, keyTimes ? { keyTimes } : {}), path,
});
export const delay = (duration: number): Animation => ({ kind: 'delay', duration });
export const sequence = (children: readonly Animation[]): Animation => ({ kind: 'sequence', children });
export const parallel = (children: readonly Animation[]): Animation => ({ kind: 'parallel', children });
/** Finite authoring repetition. The scene itself controls infinite SVG playback. */
export const loop = (animation: Animation, count: number): Animation => ({ kind: 'loop', animation, count });
