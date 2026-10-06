import demo from '../../profile.config.ts';
import { defineProfile } from '../../src/config.ts';
import { delay, frameSwap, parallel, sequence } from '../../src/animation.ts';

// Palette/composition study for a future husky + black-cat scene.
// Uses the original demo-dog anatomy; replace its preset with a custom husky when ready.
export default defineProfile({
  ...demo,
  title: 'the midnight snack committee',
  description: 'A white-and-charcoal dog and a black cat share a terrace with flying pizza, a shape-changing sushi roll, and coffee.',
  scene: { ...demo.scene, label: 'PIZZA FOR ONE. SUSHI FOR THE OTHER.' },
  characters: [
    { ...demo.characters[0], name: 'Your future husky', appearance: { primary: '#fff3dc', secondary: '#292c40', eyes: '#4589c6', accent: '#dc95a8' } },
    { ...demo.characters[1], name: 'Your black cat', appearance: { primary: '#1e202d', secondary: '#3d4053', eyes: '#cce88b', accent: '#e6a4ad' } },
  ],
  props: [
    demo.props[0],
    { ...demo.props[1], animation: parallel([demo.props[1].animation, sequence([delay(12), frameSwap(['maki', 'nigiri', 'maki'], 3)])]) },
    demo.props[2],
  ],
});
