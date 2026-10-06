import type { CharacterDefinition } from '../../src/types.ts';
import { sprites } from './sprites.ts';
import { animations } from './animations.ts';
export default {
  id: 'demo-dog', name: 'Crumb', dimensions: { width: 28, height: 22 },
  palette: { O: '#593641', P: '#f4b76c', S: '#cc795a', W: '#fff1cf', E: '#23485b', N: '#593641', A: '#76d8c3' },
  appearance: { primary: 'P', secondary: 'S', eyes: 'E', accent: 'A' },
  sprites, animations, defaultFrame: 'idle',
} satisfies CharacterDefinition;
