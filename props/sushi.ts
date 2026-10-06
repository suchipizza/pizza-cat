import type { PropDefinition } from '../src/types.ts';
import { frameSwap, motionPath, parallel, rotate } from '../src/animation.ts';
const maki = [
  '................',
  '.....OOOOOO.....',
  '...OOWWWWWWOO...',
  '..OWWWWWWWWWWO..',
  '..OWWWPPPPWWWO..',
  '..OWWPPGGPPWWO..',
  '..OWWPPGGPPWWO..',
  '..OWWWPPPPWWWO..',
  '...OWWWWWWWWO...',
  '...OOOOOOOOOO...',
  '...ONNNNNNNNO...',
  '...ONNNNNNNNO...',
  '....OOOOOOOO....',
  '................',
  '................',
  '................',
];
const nigiri = [
  '................',
  '................',
  '................',
  '...PPPPPPPPPP...',
  '..PPHPPHPPHPPP..',
  '.PPHPPHPPHPPPPP.',
  '.PPPPPPPPPPPPPP.',
  '..WWWWNNWWWWWW..',
  '..WWWWNNWWWWWW..',
  '...WWWNNWWWWW...',
  '....WWWWWWWW....',
  '................',
  '................',
  '................',
  '................',
  '................',
];
export default {
  id: 'sushi', name: 'Unsupervised sushi', dimensions: { width: 16, height: 16 },
  palette: { O: '#75697b', W: '#fff4db', P: '#f5988c', H: '#ffd0ac', G: '#91bd7d', N: '#313648' },
  sprites: { maki, nigiri },
  animations: {
    fly: parallel([motionPath('M -140 20 C 80 -75 300 55 550 -20 S 860 -35 980 20', 10), rotate([0, 540], 10)]),
    change: frameSwap(['maki', 'nigiri', 'maki'], 4),
  },
  defaultFrame: 'maki',
} satisfies PropDefinition;
