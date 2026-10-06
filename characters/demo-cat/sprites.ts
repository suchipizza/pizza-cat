import type { SpriteFrame } from '../../src/types.ts';

// Original artwork. Dots are transparent; symbols are palette entries.
const idle: SpriteFrame = [
  "......OO.......OO.......",
  ".....OPPO.....OPPO......",
  ".....OAPPO...OPPAO......",
  ".....OAAPPOOOPAAAO......",
  ".....OPPPPPPPPPPPO......",
  "....OPPPPPPPPPPPPPO.....",
  "....OPPEEPPPPPEEPPO.....",
  "....OPEWEPPPPPEWEPO.....",
  "....OPPPPPPPPPPPPPO.....",
  ".....OPPPPNNPPPPPO......",
  "......OPPWWWWPPOO.......",
  ".......OPPPPPPO.........",
  ".......OPPPPPPO.........",
  "......OPPPPPPPPO........",
  "......OPPPPPPPPO........",
  "..OO..OPPPPPPPPPO.......",
  ".OPPO.OPPPPPPPPPO.......",
  ".OPPO.OPPPPPPPPPO.......",
  "..OPPOOPPPPPPPPPO.......",
  "...OPPPPPPPPPPPPO.......",
  "....OOPPPPPPPPPPO.......",
  "......OPPSPPPSPPO.......",
  "......OSSSOOOSSSO.......",
  "......OOOOOOOOOOO.......",
];

function edit(frame: SpriteFrame, changes: readonly (readonly [number, number, string])[]): SpriteFrame {
  const rows = frame.map(row => [...row]);
  for (const [x, y, symbol] of changes) rows[y]![x] = symbol;
  return rows.map(row => row.join(''));
}

const blink = edit(idle, [[7, 6, 'P'], [8, 6, 'P'], [14, 6, 'P'], [15, 6, 'P'], [6, 7, 'P'], [7, 7, 'S'], [8, 7, 'P'], [14, 7, 'P'], [15, 7, 'S'], [16, 7, 'P']]);
const lookUp = edit(idle, [[7, 7, 'E'], [15, 7, 'E'], [7, 6, 'W'], [15, 6, 'W']]);
const tailFlick = edit(idle, [[1, 16, '.'], [2, 16, '.'], [1, 17, '.'], [2, 17, '.'], [3, 16, 'O'], [4, 16, 'P'], [3, 17, 'O'], [4, 17, 'P']]);
export const sprites = { idle, sit: idle, blink, 'look-up': lookUp, 'tail-flick': tailFlick };
