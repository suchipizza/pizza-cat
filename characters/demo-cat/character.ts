import type { CharacterDefinition } from '../../src/types.ts';
import { sprites } from './sprites.ts';
import { animations } from './animations.ts';
export default {
  id: 'demo-cat', name: 'Miso', dimensions: { width: 24, height: 24 },
  palette: { O: '#827797', P: '#28283e', S: '#49445f', E: '#cce88b', W: '#fcf7e8', N: '#f4acb9', A: '#dc95a8' },
  appearance: { primary: 'P', secondary: 'S', eyes: 'E', accent: 'A' },
  sprites, animations, defaultFrame: 'idle',
} satisfies CharacterDefinition;
