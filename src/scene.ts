import type { ProfileConfig, SceneTheme } from './types.ts';
import { attrs, escapeXml } from './svg.ts';

/** Static scenery. All colors come from the theme, all dimensions from the config. */
export function renderScenery(config: ProfileConfig, theme: SceneTheme): string {
  const { width, height, groundY } = config.canvas;
  const inset = Math.min(32, width * 0.04);
  const tile = Math.max(16, width / 24);
  const stars = [[0.53, 0.28], [0.64, 0.17], [0.77, 0.36], [0.88, 0.19], [0.4, 0.45]];
  return `<rect ${attrs({ width, height, rx: 16, fill: theme.background })}/>
<rect ${attrs({ x: 1, y: 1, width: width - 2, height: height - 2, rx: 15, fill: 'none', stroke: theme.ground })}/>
<g font-family="ui-monospace, SFMono-Regular, Consolas, monospace">
<text ${attrs({ x: inset, y: 40, fill: theme.accent, 'font-size': 10, 'letter-spacing': 2 })}>A SMALL SCENE. A WHOLE PERSONALITY.</text>
<text ${attrs({ x: inset, y: 77, fill: theme.foreground, 'font-size': 30, 'font-weight': 700, 'letter-spacing': -1 })}>${escapeXml(config.title)}</text>
<text ${attrs({ x: inset, y: height - 20, fill: theme.muted, 'font-size': 10, 'letter-spacing': 1 })}>${escapeXml(config.scene.label ?? 'FORK IT. MAKE IT YOURS.')}</text>
<text ${attrs({ x: width - inset, y: height - 20, 'text-anchor': 'end', fill: theme.accent, 'font-size': 10 })}>${config.scene.duration}s / ${config.scene.loop ? 'LOOP' : 'ONCE'}</text>
</g>
<g ${attrs({ fill: theme.ground })}>${stars.map(([x, y]) => `<path d="M${width * x!} ${groundY * y!}h4v-4h4v4h4v4h-4v4h-4v-4h-4z"/>`).join('')}</g>
<path ${attrs({ d: `M${inset} ${groundY + 3}H${width - inset}`, stroke: theme.ground, 'stroke-width': 2 })}/>
<g ${attrs({ fill: theme.panel })}>${Array.from({ length: 22 }, (_, i) => `<rect ${attrs({ x: inset + i * tile, y: groundY + 12, width: tile - 5, height: 5, rx: 1 })}/>`).join('')}</g>`;
}
