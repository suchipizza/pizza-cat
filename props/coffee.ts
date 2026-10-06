import type { PropDefinition } from '../src/types.ts';
import { rotate } from '../src/animation.ts';
export default {
  id: 'coffee', name: 'Emergency coffee', dimensions: { width: 12, height: 12 },
  palette: { O: '#75697b', W: '#fff4db', C: '#8b6553', A: '#76d8c3' },
  appearance: { primary: 'A' },
  sprites: { idle: [
    '............',
    '..O...O.....',
    '...O.O......',
    '............',
    '.OOOOOOOO...',
    '.OCCCCCCOOO.',
    '.OAAAAAAO.O.',
    '.OAAAAAAO.O.',
    '.OAAAAAAOOO.',
    '..OAAAAO....',
    '..OOOOOO....',
    '............',
  ] },
  animations: { wobble: rotate([0, -5, 5, 0], 2) },
  defaultFrame: 'idle',
} satisfies PropDefinition;
