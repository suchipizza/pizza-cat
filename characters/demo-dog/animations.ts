import { delay, frameSwap, sequence } from '../../src/animation.ts';
export const animations = {
  idle: sequence([delay(2), frameSwap(['idle', 'blink', 'idle'], 0.4, [0, 0.5, 1])]),
  walk: frameSwap(['walk-1', 'walk-2', 'walk-1'], 0.4),
  'look-up': frameSwap(['look-up', 'look-up'], 1),
};
