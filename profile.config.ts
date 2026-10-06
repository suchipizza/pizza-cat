import { defineProfile } from './src/config.ts';
import { delay, fade, frameSwap, loop, motionPath, parallel, rotate, scale, sequence, translate } from './src/animation.ts';

// Edit this file, characters/, and props/. The renderer can stay happily uninvolved.
export default defineProfile({
  title: 'pizza-cat',
  description: 'Crumb, a golden dog, strolls across a pixel terrace while Miso, a dark cat, blinks and watches pizza and sushi orbit overhead. An original 18-second looping scene.',
  canvas: { width: 900, height: 320, groundY: 244 },
  theme: {
    dark: { background: '#151823', foreground: '#fff1da', muted: '#a8a2b8', ground: '#373345', accent: '#f4b76c', panel: '#232331' },
    light: { background: '#fff9ed', foreground: '#332c40', muted: '#766c80', ground: '#dcd0cb', accent: '#925324', panel: '#eee3d7' },
  },
  scene: { duration: 18, loop: true, label: 'TWO ROOMMATES. ZERO FOOD SECURITY.' },
  characters: [
    {
      id: 'crumb', preset: 'demo-dog', name: 'Crumb', position: { x: 155, y: 244 }, scale: 4,
      appearance: { primary: '#f4b76c', secondary: '#cc795a', eyes: '#23485b', accent: '#76d8c3' },
      animation: parallel([
        // A round trip with pauses. The last position equals the first: no seam snap.
        translate([[0, 0], [0, 0], [290, 0], [290, 0], [0, 0], [0, 0]], 18, { keyTimes: [0, 2 / 18, 6 / 18, 10 / 18, 15 / 18, 1] }),
        scale([[1, 1], [-1, 1], [1, 1], [1, 1]], 18, { keyTimes: [0, 10 / 18, 15 / 18, 1], discrete: true }),
        sequence([
          frameSwap(['idle', 'blink', 'idle'], 2, [0, 0.9, 1]),
          loop(frameSwap(['walk-1', 'walk-2', 'walk-1'], 0.4), 10),
          frameSwap(['look-up', 'look-up'], 4),
          loop(frameSwap(['walk-1', 'walk-2', 'walk-1'], 0.5), 10),
          frameSwap(['idle', 'blink', 'idle'], 3, [0, 0.7, 1]),
        ]),
      ]),
    },
    {
      id: 'miso', preset: 'demo-cat', name: 'Miso', position: { x: 680, y: 244 }, scale: 3.5,
      animation: sequence([
        delay(1), frameSwap(['idle', 'blink', 'idle'], 0.4, [0, 0.5, 1]), delay(3.6),
        frameSwap(['idle', 'tail-flick', 'idle'], 1), delay(3),
        frameSwap(['look-up', 'look-up'], 4),
        frameSwap(['idle', 'blink', 'idle'], 0.4, [0, 0.5, 1]), delay(4.6),
      ]),
    },
  ],
  props: [
    {
      id: 'airborne-pizza', preset: 'pizza', position: { x: 780, y: 135 }, scale: 3,
      animation: parallel([
        sequence([delay(4), motionPath('M 170 0 C 80 -38 -120 -48 -340 0 S -700 58 -850 20', 7)]),
        sequence([delay(4), rotate([0, -720], 7)]),
        fade([0, 0, 1, 1, 0, 0], 18, { keyTimes: [0, 4 / 18, 4.1 / 18, 10.8 / 18, 11 / 18, 1] }),
      ]),
    },
    {
      id: 'escaped-maki', preset: 'sushi', position: { x: 90, y: 160 }, scale: 2.6,
      animation: parallel([
        sequence([delay(10), motionPath('M -150 0 C 60 -65 280 35 490 -10 S 770 -70 880 -20', 6)]),
        sequence([delay(10), rotate([0, 540], 6)]),
        fade([0, 0, 1, 1, 0, 0], 18, { keyTimes: [0, 10 / 18, 10.1 / 18, 15.8 / 18, 16 / 18, 1] }),
      ]),
    },
    { id: 'grounded-coffee', preset: 'coffee', position: { x: 782, y: 244 }, scale: 2.4 },
  ],
});
