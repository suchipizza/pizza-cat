import type { SpriteFrame } from '../../src/types.ts';

// Start small. Every row is eight pixels; every frame is eight rows.
const idle: SpriteFrame = [
  '..OOOO..',
  '.OPPPPO.',
  'OPPPPPPO',
  'OPEPPEPO',
  'OPPPPPPO',
  '.OPPPO..',
  '..OAAO..',
  '..OOOO..',
];
const blink: SpriteFrame = [
  '..OOOO..',
  '.OPPPPO.',
  'OPPPPPPO',
  'OPSPPSPO',
  'OPPPPPPO',
  '.OPPPO..',
  '..OAAO..',
  '..OOOO..',
];
export const sprites = { idle, blink };
