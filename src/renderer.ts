import type { ActorInstance, CharacterDefinition, ProfileConfig, Registry, Track, Value } from './types.ts';
import { attrs, escapeXml, number } from './svg.ts';
import { renderSprite, resolvePalette } from './sprites.ts';
import { compileTimeline } from './timeline.ts';
import { resolveAnimation, validateProfile } from './validation.ts';
import { renderScenery } from './scene.ts';

export interface RenderOptions { readonly mode?: 'dark' | 'light'; readonly animated?: boolean }
const stringify = (value: Value): string => Array.isArray(value) ? value.map(number).join(' ') : typeof value === 'number' ? number(value) : String(value);

function renderTrack(track: Track, config: ProfileConfig): string {
  const common = { dur: `${number(config.scene.duration)}s`, begin: '0s', repeatCount: config.scene.loop ? 'indefinite' : '1', fill: 'freeze', calcMode: track.discrete ? 'discrete' : 'linear', keyTimes: track.keyTimes.map(number).join(';') };
  if (track.channel === 'motion') return `<animateMotion ${attrs({ ...common, path: track.path!, keyPoints: track.values.map(stringify).join(';'), rotate: '0' })}/>`;
  const values = track.values.map(stringify).join(';');
  if (track.channel === 'opacity') return `<animate ${attrs({ ...common, attributeName: 'opacity', values })}/>`;
  return `<animateTransform ${attrs({ ...common, attributeName: 'transform', type: track.channel, values })}/>`;
}

function renderActor(actor: ActorInstance, definition: CharacterDefinition, config: ProfileConfig, animated: boolean, index: number): { defs: string; body: string } {
  const palette = resolvePalette(definition, actor);
  const defaultFrame = actor.frame ?? definition.defaultFrame;
  const animation = animated ? resolveAnimation(actor, definition) : undefined;
  const tracks = animation ? compileTimeline(animation, config.scene.duration, defaultFrame) : [];
  const frameTrack = tracks.find(track => track.channel === 'frame');
  const needed = new Set(frameTrack ? frameTrack.values as readonly string[] : [defaultFrame]);
  const frames = [...needed];
  const definitions = frames.map((frame, i) => `<g id="sprite-${index}-${i}">${renderSprite(definition.sprites[frame]!, palette)}</g>`).join('');
  const frameMarkup = frames.map((frame, i) => {
    const visible = (frameTrack?.values[0] ?? defaultFrame) === frame;
    // SVG2 href plus xlink:href works in image-mode SVG and older renderers.
    return `<use ${attrs({ href: `#sprite-${index}-${i}`, 'xlink:href': `#sprite-${index}-${i}`, opacity: visible ? 1 : 0 })}>${frameTrack ? renderTrack({ ...frameTrack, channel: 'opacity', values: frameTrack.values.map(value => value === frame ? 1 : 0) }, config) : ''}</use>`;
  }).join('');
  // Independent nested transforms avoid SMIL replacement/additive ordering surprises.
  // Rotation/scale operate around the actor's bottom-center anchor, so feet stay planted.
  // Animation distances are canvas pixels, independent of authored sprite magnification.
  // Put position-changing tracks outside the static sprite scale.
  const localTracks = tracks.filter(track => ['scale', 'rotate', 'opacity'].includes(track.channel));
  let body = `<g transform="translate(${-definition.dimensions.width / 2} ${-definition.dimensions.height})" shape-rendering="crispEdges">${frameMarkup}</g>`;
  body = `<g transform="scale(${number(actor.scale ?? 1)})">${body}</g>`;
  for (const track of localTracks) body = `<g>${renderTrack(track, config)}${body}</g>`;
  for (const channel of ['motion', 'translate'] as const) {
    const track = tracks.find(candidate => candidate.channel === channel);
    if (track) body = `<g>${renderTrack(track, config)}${body}</g>`;
  }
  return { defs: definitions, body: `<g ${attrs({ id: `actor-${actor.id}`, transform: `translate(${number(actor.position.x)} ${number(actor.position.y)})` })}><title>${escapeXml(actor.name ?? definition.name)}</title>${body}</g>` };
}

export function renderScene(config: ProfileConfig, registry: Registry, options: RenderOptions = {}): string {
  validateProfile(config, registry);
  const mode = options.mode ?? 'dark';
  const actors = [
    ...config.characters.map(actor => ({ actor, definition: registry.characters[actor.preset]! })),
    ...config.props.map(actor => ({ actor, definition: registry.props[actor.preset]! })),
  ].map(({ actor, definition }, index) => renderActor(actor, definition, config, options.animated !== false, index));
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" ${attrs({ viewBox: `0 0 ${config.canvas.width} ${config.canvas.height}`, width: config.canvas.width, height: config.canvas.height, role: 'img', 'aria-labelledby': 'scene-title scene-desc', 'data-duration': number(config.scene.duration), 'data-loop': String(config.scene.loop) })}>
<title id="scene-title">${escapeXml(config.title)}</title>
<desc id="scene-desc">${escapeXml(config.description)}</desc>
<defs><clipPath id="canvas-clip"><rect width="${config.canvas.width}" height="${config.canvas.height}" rx="16"/></clipPath>${actors.map(actor => actor.defs).join('')}</defs>
<g clip-path="url(#canvas-clip)">${renderScenery(config, config.theme[mode])}${actors.map(actor => actor.body).join('')}</g>
</svg>\n`;
  if (Buffer.byteLength(svg) > 1_000_000) throw new Error('Generated SVG exceeds 1 MB; reduce actors, frames, or sprite dimensions');
  return svg;
}
