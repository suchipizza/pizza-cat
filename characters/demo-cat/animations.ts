import { delay, frameSwap, sequence } from '../../src/animation.ts';
export const animations = {
  idle: sequence([delay(3), frameSwap(['idle', 'blink', 'idle'], 0.3, [0, 0.5, 1])]),
  'tail-flick': frameSwap(['idle', 'tail-flick', 'idle'], 0.7),
  'look-up': frameSwap(['look-up', 'look-up'], 1),
};
