import type { CharacterDefinition } from '../../src/types.ts';
import { sprites } from './sprites.ts';
import { animations } from './animations.ts';
export default {
  id: 'my-character', name: 'Your tiny protagonist',
  dimensions: { width: 8, height: 8 },
  palette: { O: '#51405e', P: '#c3b1e1', S: '#9382b0', E: '#26384a', A: '#f5b578' },
  appearance: { primary: 'P', secondary: 'S', eyes: 'E', accent: 'A' },
  sprites, animations, defaultFrame: 'idle',
} satisfies CharacterDefinition;
