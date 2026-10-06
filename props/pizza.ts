import type { PropDefinition } from '../src/types.ts';
import { motionPath, parallel, rotate } from '../src/animation.ts';
export default {
  id: 'pizza', name: 'A slice with places to be', dimensions: { width: 16, height: 16 },
  palette: { O: '#7b493f', C: '#da8d53', Y: '#ffdc83', P: '#e37868', H: '#fff0b4' },
  appearance: { primary: 'Y', secondary: 'C', accent: 'P' },
  sprites: { idle: [
    '...OOOOOOOOOO...',
    '..OCCCCCCCCCCO..',
    '..OCCCCCCCCCCO..',
    '...OYYYYYYYYO...',
    '...OYPPYYPPYO...',
    '....YPPYYPPY....',
    '....OYYYYYYO....',
    '.....YHYYYH.....',
    '.....OYYYYO.....',
    '......YPPY......',
    '......OPPO......',
    '.......YY.......',
    '.......OO.......',
    '................',
    '................',
    '................',
  ] },
  animations: { fly: parallel([motionPath('M 160 0 C 80 -55 -160 -65 -360 0 S -680 65 -920 10', 8), rotate([0, -720], 8)]) },
  defaultFrame: 'idle',
} satisfies PropDefinition;
