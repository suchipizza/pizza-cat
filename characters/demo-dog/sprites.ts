import type { SpriteFrame } from '../../src/types.ts';

// Original artwork. Dots are transparent; symbols are palette entries.
const idle: SpriteFrame = [
  "..................OOOO......",
  ".................OPPPPO.....",
  "................OPPPPPPO....",
  "...............OSSPPPPPPO...",
  "...............OSSSPPPPPO...",
  "...............OSSSPPPEPO...",
  "...............OSSSPPPPWOO..",
  ".....OO.........OSPPWWWNNO..",
  "....OPPO........OPPPWWWWO...",
  "...OPPPO.OOOOOOOOAAAPPO.....",
  "...OPPOOOPPPPPPPPPAAAO......",
  "...OPPOOPPPPPPPPPPPPPPO.....",
  "....OOOPPPPPPPPPPPPPPPO.....",
  "......OPPPPPPPPPPPPPPPO.....",
  "......OPPPPPPPPPPPWWPPO.....",
  "......OPPPPPPPPPWWWWPO......",
  ".......OPPPPPPPWWWWPO.......",
  ".......OPPPOOOOPPWPO........",
  ".......OPPO....OPPO.........",
  ".......OPPO....OPPO.........",
  "......OWWWO...OWWWO.........",
  "......OOOOO...OOOOO.........",
];

function edit(frame: SpriteFrame, changes: readonly (readonly [number, number, string])[]): SpriteFrame {
  const rows = frame.map(row => [...row]);
  for (const [x, y, symbol] of changes) rows[y]![x] = symbol;
  return rows.map(row => row.join(''));
}

const blink = edit(idle, [[22, 5, 'P']]);
const lookUp = edit(idle, [[22, 5, 'P'], [22, 4, 'E'], [23, 7, 'W'], [24, 7, 'W'], [24, 6, 'N']]);
const walkOne = edit(idle, [[7, 19, '.'], [8, 19, '.'], [6, 20, '.'], [7, 20, '.'], [6, 21, '.'], [7, 21, '.'], [10, 20, 'W'], [11, 20, 'O'], [10, 21, 'O'], [11, 21, 'O']]);
const walkTwo = edit(idle, [[16, 19, '.'], [17, 19, '.'], [17, 20, '.'], [18, 20, '.'], [17, 21, '.'], [18, 21, '.'], [13, 20, 'O'], [14, 20, 'W'], [13, 21, 'O'], [14, 21, 'O']]);
export const sprites = { idle, blink, 'look-up': lookUp, 'walk-1': walkOne, 'walk-2': walkTwo };
