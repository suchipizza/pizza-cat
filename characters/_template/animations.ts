import { delay, frameSwap, sequence } from '../../src/animation.ts';
export const animations = {
  idle: sequence([delay(2), frameSwap(['idle', 'blink', 'idle'], 0.4)]),
};
