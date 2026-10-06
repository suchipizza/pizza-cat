import type { SpriteFrame } from '../../src/types.ts';

// Original husky: pointed ears, charcoal crown, white mask, blue eyes, curled tail.
const idle: SpriteFrame = [
  "..................O..............O..",
  ".................OSO............OOO.",
  ".................OSSO..........OSSO.",
  ".................OSSSO........OSFSO.",
  ".................OSFSSO......OOSFSO.",
  ".................OSFFPSSSSSSSSSFFSO.",
  ".................OSPSSSSSPPSSSSPFSO.",
  "...OOOOOO........OPSSSSSPPPSSSSSPSO.",
  "..OOSSSSPO.......OPSSSSSPPPPSSSSPSO.",
  "..OPPSSSSPO.....OPPPENEPPPPPSENEPPO.",
  "..OPP...SPPO...OOPPPEEEPPPPPPEEEPPO.",
  "..OPP....PPO...OOOPPPPPPPPPPPPPPPO..",
  "..OPP....PPO....OOPPPPPPPNNNPPPPOO..",
  "..OPP...PPOOOOOOPOPPPPPPPPNPPPPPO...",
  "..OOPP.PPOPSSSSSSOOPPPPPPPPPPPPPO...",
  "...OPPPPOPSSSSSSSSOOPPPFFFFFFPPO....",
  "...OPPPPOPSSSSSSSSSOOOPPPPPPPPO.....",
  "....OPPOPSSSSSSSSSSSSAAAAAAAAO......",
  ".....OOOPSSSSSSSSSSSSSSSAAAPOO......",
  ".......OPSSSSSSSSSSSSSSSSSPPOO......",
  ".......OPPSSSSSSSSSSSSSSSPPPOO......",
  "........OPFFPPPPSSSSSOPPOFFPO.......",
  "........OOPPOFFFFPPPPOPPOFPPO.......",
  ".........OPPOFFOFFFFFOPPOFFOO.......",
  ".........OPPOFFOPPFFFOPPOFFO........",
  ".........OPPOFFOOOOOOOPPOFFO........",
  ".........OPPOFFO...OOOPPOFFO........",
  ".........OPPOFFO.....OPPOFFO........",
  "........OPPPOPPO....OPPPOPPO........",
  "........OOOOOOOO....OOOOOOOO........",
];

function edit(frame: SpriteFrame, changes: readonly (readonly [number, number, string])[]): SpriteFrame {
  const rows = frame.map(row => [...row]);
  for (const [x, y, symbol] of changes) rows[y]![x] = symbol;
  return rows.map(row => row.join(''));
}

const blink = edit(idle, [[20, 9, 'P'], [21, 9, 'P'], [22, 9, 'P'], [29, 9, 'P'], [30, 9, 'P'], [31, 9, 'P'], [20, 10, 'S'], [21, 10, 'S'], [22, 10, 'S'], [29, 10, 'S'], [30, 10, 'S'], [31, 10, 'S']]);
const lookUp = edit(idle, [[21, 9, 'E'], [30, 9, 'E'], [21, 8, 'N'], [30, 8, 'N'], [25, 12, 'P'], [26, 12, 'P'], [27, 12, 'P'], [25, 11, 'N'], [26, 11, 'N'], [27, 11, 'N']]);
const walkOne = edit(idle, [[8, 26, "."], [9, 26, "."], [10, 26, "."], [11, 26, "."], [12, 26, "."], [13, 26, "."], [14, 26, "."], [15, 26, "."], [8, 27, "."], [9, 27, "."], [10, 27, "."], [11, 27, "."], [12, 27, "."], [13, 27, "."], [14, 27, "."], [15, 27, "."], [8, 28, "."], [9, 28, "."], [10, 28, "."], [11, 28, "."], [12, 28, "."], [13, 28, "."], [14, 28, "."], [15, 28, "."], [8, 29, "."], [9, 29, "."], [10, 29, "."], [11, 29, "."], [12, 29, "."], [13, 29, "."], [14, 29, "."], [15, 29, "."], [12, 26, "O"], [13, 26, "P"], [14, 26, "P"], [15, 26, "O"], [12, 27, "O"], [13, 27, "P"], [14, 27, "P"], [15, 27, "O"], [12, 28, "O"], [12, 29, "O"], [13, 28, "P"], [13, 29, "O"], [14, 28, "P"], [14, 29, "O"], [15, 28, "P"], [15, 29, "O"], [16, 28, "P"], [16, 29, "O"], [17, 28, "O"], [17, 29, "O"]]);
const walkTwo = edit(idle, [[20, 26, "."], [21, 26, "."], [22, 26, "."], [23, 26, "."], [24, 26, "."], [25, 26, "."], [26, 26, "."], [27, 26, "."], [20, 27, "."], [21, 27, "."], [22, 27, "."], [23, 27, "."], [24, 27, "."], [25, 27, "."], [26, 27, "."], [27, 27, "."], [20, 28, "."], [21, 28, "."], [22, 28, "."], [23, 28, "."], [24, 28, "."], [25, 28, "."], [26, 28, "."], [27, 28, "."], [20, 29, "."], [21, 29, "."], [22, 29, "."], [23, 29, "."], [24, 29, "."], [25, 29, "."], [26, 29, "."], [27, 29, "."], [18, 26, "O"], [19, 26, "P"], [20, 26, "P"], [21, 26, "O"], [18, 27, "O"], [19, 27, "P"], [20, 27, "P"], [21, 27, "O"], [17, 28, "O"], [17, 29, "O"], [18, 28, "P"], [18, 29, "O"], [19, 28, "P"], [19, 29, "O"], [20, 28, "P"], [20, 29, "O"], [21, 28, "P"], [21, 29, "O"], [22, 28, "O"], [22, 29, "O"]]);
export const sprites = { idle, blink, 'look-up': lookUp, 'walk-1': walkOne, 'walk-2': walkTwo };
