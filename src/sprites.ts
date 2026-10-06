import type { ActorInstance, CharacterDefinition, Palette, SpriteFrame } from './types.ts';
import { attrs } from './svg.ts';

export function resolvePalette(definition: CharacterDefinition, actor: ActorInstance): Palette {
  const palette: Record<string, string> = { ...definition.palette, ...actor.palette };
  for (const [role, color] of Object.entries(actor.appearance ?? {})) {
    const symbol = definition.appearance?.[role];
    if (!symbol) throw new Error(`Actor "${actor.id}": unknown appearance role "${role}"`);
    palette[symbol] = color;
  }
  return palette;
}

/** Horizontal runs replace individual pixels without changing the authored grid. */
export function renderSprite(sprite: SpriteFrame, palette: Palette): string {
  const rectangles: string[] = [];
  sprite.forEach((row, y) => {
    for (let x = 0; x < row.length;) {
      const symbol = row[x]!;
      let end = x + 1;
      while (row[end] === symbol) end++;
      if (symbol !== '.') {
        const color = palette[symbol];
        if (!color) throw new Error(`Palette key "${symbol}" is missing`);
        rectangles.push(`<rect ${attrs({ x, y, width: end - x, height: 1, fill: color })}/>`);
      }
      x = end;
    }
  });
  return rectangles.join('');
}
