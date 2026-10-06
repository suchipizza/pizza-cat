import type { CharacterDefinition } from '../../src/types.ts';
import { sprites } from './sprites.ts';
import { animations } from './animations.ts';

export default {
  id: 'husky', name: 'The husky', dimensions: { width: 36, height: 30 },
  palette: { O: '#626779', P: '#fff5e7', S: '#232634', F: '#cbd0d9', E: '#75c9f1', N: '#172332', A: '#dc95a8' },
  appearance: { primary: 'P', secondary: 'S', eyes: 'E', accent: 'A' },
  sprites, animations, defaultFrame: 'idle',
} satisfies CharacterDefinition;
