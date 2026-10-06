import type { Animation, Channel, Clip, Track, Value } from './types.ts';

export function animationDuration(animation: Animation): number {
  switch (animation.kind) {
    case 'tween': case 'delay': return animation.duration;
    case 'loop': return animationDuration(animation.animation) * animation.count;
    case 'sequence': return animation.children.reduce((sum, child) => sum + animationDuration(child), 0);
    case 'parallel': return Math.max(0, ...animation.children.map(animationDuration));
  }
}

export function flatten(animation: Animation, start = 0): Clip[] {
  switch (animation.kind) {
    case 'delay': return [];
    case 'tween': return [{ start, tween: animation }];
    case 'sequence': {
      const clips: Clip[] = [];
      let cursor = start;
      for (const child of animation.children) { clips.push(...flatten(child, cursor)); cursor += animationDuration(child); }
      return clips;
    }
    case 'parallel': return animation.children.flatMap(child => flatten(child, start));
    case 'loop': return Array.from({ length: animation.count }, (_, index) => flatten(animation.animation, start + index * animationDuration(animation.animation))).flat();
  }
}

const initial: Record<Channel, Value> = { translate: [0, 0], rotate: 0, scale: [1, 1], opacity: 1, frame: 'idle', motion: 0 };
const same = (one: Value, two: Value): boolean => JSON.stringify(one) === JSON.stringify(two);

/** Each channel becomes one full-scene track. Delays hold values; every loop uses the same clock. */
export function compileTimeline(animation: Animation, duration: number, defaultFrame: string): Track[] {
  if (animationDuration(animation) > duration + 1e-8) throw new Error(`Animation exceeds scene duration (${duration}s)`);
  const groups = new Map<Channel, Clip[]>();
  for (const clip of flatten(animation)) groups.set(clip.tween.channel, [...(groups.get(clip.tween.channel) ?? []), clip]);
  return [...groups].map(([channel, unsorted]) => {
    const clips = unsorted.sort((a, b) => a.start - b.start);
    const discrete = channel === 'frame' || clips[0]!.tween.discrete === true;
    if (clips.some(clip => (clip.tween.discrete === true) !== discrete)) throw new Error(`Cannot mix discrete and continuous ${channel} animations`);
    if (channel === 'motion' && clips.length > 1) throw new Error('Use one motionPath per actor; combine curves into a single path');
    const keys: { time: number; value: Value }[] = [];
    const add = (time: number, value: Value): void => {
      if (Math.abs((keys.at(-1)?.time ?? -1) - time) < 1e-8) keys[keys.length - 1] = { time, value };
      else keys.push({ time, value });
    };
    let end = 0;
    let last = channel === 'frame' ? defaultFrame : initial[channel];
    add(0, last);
    for (const { start, tween } of clips) {
      if (start < end - 1e-8) throw new Error(`Overlapping ${channel} animations on the same actor`);
      const first = tween.values[0]!;
      // A continuous jump cannot be represented by one interpolated track. Make the reset explicit (off-screen or discrete).
      if (!discrete && start > 0 && !same(last, first)) throw new Error(`Discontinuous ${channel} animation at ${start}s: start at the preceding value or use discrete timing`);
      if (start > end) add(start, last);
      const times = tween.keyTimes ?? tween.values.map((_, index) => index / (tween.values.length - 1));
      tween.values.forEach((value, index) => add(start + times[index]! * tween.duration, value));
      end = start + tween.duration;
      last = tween.values.at(-1)!;
    }
    add(duration, last);
    return { channel, values: keys.map(key => key.value), keyTimes: keys.map(key => key.time / duration), discrete, ...(clips[0]!.tween.path ? { path: clips[0]!.tween.path } : {}) };
  });
}
