import demo from '../demo/profile.config.ts';
import { defineProfile } from '../../src/config.ts';
import { delay, fade, frameSwap, loop, motionPath, parallel, rotate, scale, sequence, translate } from '../../src/animation.ts';
import type { ActorInstance } from '../../src/types.ts';

const duration = 20;

/** Independent flights share the scene clock and reset only after fading out. */
function flight(id: string, preset: string, x: number, y: number, magnification: number, path: string, start: number, seconds: number, turns: number, frame?: string): ActorInstance {
  return {
    id, preset, position: { x, y }, scale: magnification,
    ...(frame ? { frame } : {}),
    animation: parallel([
      sequence([delay(start), motionPath(path, seconds)]),
      sequence([delay(start), rotate([0, turns * 360], seconds)]),
      fade([0, 0, 1, 1, 0, 0], duration, {
        keyTimes: [0, start / duration, (start + 0.15) / duration, (start + seconds - 0.15) / duration, (start + seconds) / duration, 1],
      }),
    ]),
  };
}

export default defineProfile({
  ...demo,
  title: 'the midnight snack committee',
  description: 'A black-and-white husky with blue eyes and a curled tail chases flying pizza. A smaller black cat blinks, flicks its tail, and hops toward sushi. Pizza, maki, and nigiri cross the scene on five independent curved, spinning flights.',
  scene: { duration, loop: true, label: 'PIZZA FOR ONE. SUSHI FOR THE OTHER.', showTiming: false },
  characters: [
    {
      id: 'husky', preset: 'husky', name: 'The husky', position: { x: 185, y: 244 }, scale: 3.4,
      animation: parallel([
        translate([[0, 0], [0, 0], [280, 0], [280, 0], [-30, 0], [0, 0], [0, 0]], duration, {
          keyTimes: [0, 1 / duration, 6 / duration, 9 / duration, 15 / duration, 17 / duration, 1],
        }),
        scale([[1, 1], [-1, 1], [1, 1], [1, 1]], duration, { keyTimes: [0, 9 / duration, 15 / duration, 1], discrete: true }),
        sequence([
          frameSwap(['idle', 'blink', 'idle'], 1, [0, 0.85, 1]),
          loop(frameSwap(['walk-1', 'walk-2', 'walk-1'], 0.3125), 16),
          frameSwap(['look-up', 'look-up'], 3),
          loop(frameSwap(['walk-1', 'walk-2', 'walk-1'], 0.375), 16),
          loop(frameSwap(['walk-1', 'walk-2', 'walk-1'], 0.25), 8),
          frameSwap(['idle', 'blink', 'idle'], 3, [0, 0.8, 1]),
        ]),
      ]),
    },
    {
      id: 'cat', preset: 'demo-cat', name: 'The black cat', position: { x: 690, y: 244 }, scale: 3.4,
      appearance: { primary: '#1e202d', secondary: '#3d4053', eyes: '#cce88b', accent: '#e6a4ad' },
      animation: parallel([
        translate([[0, 0], [0, 0], [0, -28], [0, 0], [0, 0], [0, -14], [0, 0], [0, 0]], duration, {
          keyTimes: [0, 8 / duration, 8.7 / duration, 9.2 / duration, 13 / duration, 13.4 / duration, 13.8 / duration, 1],
        }),
        sequence([
          delay(1), frameSwap(['idle', 'blink', 'idle'], 0.3), delay(2.7),
          frameSwap(['idle', 'tail-flick', 'idle'], 1), delay(1),
          frameSwap(['look-up', 'look-up'], 4),
          frameSwap(['idle', 'blink', 'idle'], 0.3), delay(1.7),
          frameSwap(['idle', 'tail-flick', 'idle'], 1), frameSwap(['look-up', 'look-up'], 2),
          frameSwap(['idle', 'blink', 'idle'], 0.4), delay(4.6),
        ]),
      ]),
    },
  ],
  props: [
    flight('pizza-east', 'pizza', 780, 135, 2.7, 'M 180 0 C 0 -85 -180 40 -360 0 S -640 -45 -865 20', 0.5, 8, -2),
    flight('maki-west', 'sushi', 110, 178, 2.4, 'M -185 0 C 50 -50 160 45 360 -20 S 670 -70 850 -35', 3, 9, 1.5),
    flight('nigiri-east', 'sushi', 450, 128, 2.4, 'M 510 20 C 310 60 240 -70 10 -20 S -320 50 -530 0', 8, 9, -1.5, 'nigiri'),
    flight('pizza-west', 'pizza', 340, 115, 2.3, 'M -415 0 C -200 -35 -160 60 20 10 S 410 -85 630 0', 10.5, 8, 2),
    flight('maki-detour', 'sushi', 575, 158, 1.9, 'M 385 -50 C 185 -110 -45 50 -115 0 S 85 10 -35 -70 S -305 50 -645 5', 5.5, 11.5, 2),
    { id: 'coffee', preset: 'coffee', position: { x: 810, y: 244 }, scale: 2.2 },
  ],
});
