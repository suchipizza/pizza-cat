import type { ActorInstance, Animation, CharacterDefinition, ProfileConfig, Registry, SpriteFrame } from './types.ts';
import { animationDuration, compileTimeline } from './timeline.ts';
import { resolvePalette } from './sprites.ts';

function assert(condition: unknown, message: string): asserts condition { if (!condition) throw new Error(message); }
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const positive = (value: unknown): value is number => finite(value) && value > 0;
const colorPattern = /^#(?:[\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i;
function color(value: unknown, label: string): void { assert(typeof value === 'string' && colorPattern.test(value), `${label} must be a hex color (#fff or #ffffff)`); }
function text(value: unknown, label: string): void {
  assert(typeof value === 'string' && value.length > 0 && !/[\x00-\x08\x0b\x0c\x0e-\x1f\ufffe\uffff]/u.test(value), `${label} must be nonempty XML-safe text`);
}

export function validateSprite(sprite: SpriteFrame, palette: Readonly<Record<string, string>>, label = 'sprite', width?: number, height?: number): void {
  assert(Array.isArray(sprite) && sprite.length > 0, `Sprite "${label}" must have rows`);
  const rowWidth = width ?? sprite[0]?.length;
  assert(positive(rowWidth), `Sprite "${label}" must have nonempty rows`);
  assert(height === undefined || sprite.length === height, `Sprite "${label}" height must match its dimensions`);
  for (const row of sprite) {
    assert(typeof row === 'string' && row.length === rowWidth, `Sprite "${label}" has inconsistent row widths`);
    assert(/^[\x21-\x7e]+$/.test(row), `Sprite "${label}" must use single ASCII symbols; use dots for transparency`);
    for (const symbol of row) if (symbol !== '.') assert(Object.hasOwn(palette, symbol), `Sprite "${label}": Palette key "${symbol}" is missing`);
  }
}

function validatePath(path: string): void {
  const matches = [...path.matchAll(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g)];
  assert(matches.length > 0 && path.replace(/[a-zA-Z]|[-+]?(?:\d*\.\d+|\d+\.?\d*)(?:[eE][-+]?\d+)?/g, '').replace(/[\s,]/g, '') === '', 'Motion path contains invalid SVG path syntax');
  const tokens = matches.map(match => match[0]);
  assert(tokens[0]?.toUpperCase() === 'M', 'Motion path must begin with M (move-to)');
  const arity: Record<string, number> = { M: 2, L: 2, H: 1, V: 1, C: 6, S: 4, Q: 4, T: 2, A: 7, Z: 0 };
  let index = 0;
  while (index < tokens.length) {
    const command = tokens[index++]!.toUpperCase();
    const count = arity[command];
    assert(count !== undefined, `Unsupported motion path command "${command}"`);
    const coordinates: number[] = [];
    while (index < tokens.length && !/^[a-zA-Z]$/.test(tokens[index]!)) coordinates.push(Number(tokens[index++]!));
    assert(coordinates.every(Number.isFinite), 'Motion path coordinates must be finite');
    assert(count === 0 ? coordinates.length === 0 : coordinates.length > 0 && coordinates.length % count === 0, `Motion path command ${command} needs groups of ${count} coordinates`);
    if (command === 'A') for (let i = 0; i < coordinates.length; i += 7) assert(coordinates[i]! >= 0 && coordinates[i + 1]! >= 0 && [0, 1].includes(coordinates[i + 3]!) && [0, 1].includes(coordinates[i + 4]!), 'Motion path arc radii must be nonnegative and flags must be 0 or 1');
  }
}

function validateAnimation(animation: Animation, frames: Readonly<Record<string, SpriteFrame>>, depth = 0): void {
  assert(animation && typeof animation === 'object', 'Animation must be a primitive, sequence, or parallel group');
  assert(depth < 30, 'Animation nesting is too deep');
  switch (animation.kind) {
    case 'delay': assert(finite(animation.duration) && animation.duration >= 0, 'Delay must be >= 0'); break;
    case 'loop':
      assert(Number.isInteger(animation.count) && animation.count > 0 && animation.count <= 1000, 'Loop count must be an integer from 1 to 1000');
      validateAnimation(animation.animation, frames, depth + 1); break;
    case 'sequence': case 'parallel':
      assert(Array.isArray(animation.children) && animation.children.length <= 1000, 'Animation group must be an array of at most 1000 children');
      animation.children.forEach(child => validateAnimation(child, frames, depth + 1)); break;
    case 'tween': {
      assert(positive(animation.duration), 'Tween duration must be > 0');
      assert(Array.isArray(animation.values) && animation.values.length >= 2, 'Tween needs at least two values');
      assert(['translate', 'rotate', 'scale', 'opacity', 'frame', 'motion'].includes(animation.channel), `Unknown animation channel "${animation.channel}"`);
      assert(animation.discrete === undefined || typeof animation.discrete === 'boolean', 'Discrete timing must be a boolean');
      if (animation.keyTimes) {
        const times = animation.keyTimes;
        assert(times.length === animation.values.length && times[0] === 0 && times.at(-1) === 1 && times.every((time, i) => finite(time) && time >= 0 && time <= 1 && (i === 0 || time > times[i - 1]!)), 'keyTimes must match values and strictly increase from 0 to 1');
      }
      for (const value of animation.values) {
        if (animation.channel === 'frame') assert(typeof value === 'string' && Object.hasOwn(frames, value), `Unknown sprite frame "${String(value)}"`);
        else if (animation.channel === 'translate' || animation.channel === 'scale') assert(Array.isArray(value) && value.length === 2 && value.every(finite), `${animation.channel} values must be [x, y] pairs`);
        else {
          assert(finite(value), `${animation.channel} values must be finite numbers`);
          if (animation.channel === 'opacity' || animation.channel === 'motion') assert(value >= 0 && value <= 1, `${animation.channel} values must be between 0 and 1`);
        }
      }
      if (animation.channel === 'frame') assert(animation.discrete === true, 'Frame switching must use discrete timing');
      if (animation.channel === 'motion') { assert(typeof animation.path === 'string', 'Motion animation needs a path'); validatePath(animation.path); }
      break;
    }
    default: throw new Error('Unknown animation primitive');
  }
}

function leafCount(animation: Animation): number {
  if (animation.kind === 'loop') return leafCount(animation.animation) * animation.count;
  if (animation.kind === 'sequence' || animation.kind === 'parallel') return animation.children.reduce((sum, child) => sum + leafCount(child), 0);
  return 1;
}

export function validateDefinition(definition: CharacterDefinition): void {
  text(definition.id, 'Definition ID'); text(definition.name, 'Definition name');
  assert(definition.dimensions && Number.isInteger(definition.dimensions.width) && positive(definition.dimensions.width) && definition.dimensions.width <= 128 && Number.isInteger(definition.dimensions.height) && positive(definition.dimensions.height) && definition.dimensions.height <= 128, `Definition "${definition.id}" dimensions must be integers from 1 to 128`);
  assert(definition.palette && typeof definition.palette === 'object', `Definition "${definition.id}" needs a palette`);
  for (const [symbol, value] of Object.entries(definition.palette)) { assert(/^[\x21-\x7e]$/.test(symbol) && symbol !== '.', 'Palette keys must be one ASCII symbol other than dot'); color(value, `Palette key "${symbol}"`); }
  for (const [role, symbol] of Object.entries(definition.appearance ?? {})) assert(Object.hasOwn(definition.palette, symbol), `Appearance role "${role}" references missing palette key "${symbol}"`);
  assert(definition.sprites && typeof definition.sprites === 'object', `Definition "${definition.id}" needs sprites`);
  assert(Object.hasOwn(definition.sprites, definition.defaultFrame), `Definition "${definition.id}" default frame is missing`);
  for (const [name, sprite] of Object.entries(definition.sprites)) validateSprite(sprite, definition.palette, name, definition.dimensions.width, definition.dimensions.height);
  for (const animation of Object.values(definition.animations)) { validateAnimation(animation, definition.sprites); assert(leafCount(animation) <= 10000, 'Animation expands to too many clips'); }
}

export function resolveAnimation(actor: ActorInstance, definition: CharacterDefinition): Animation | undefined {
  if (typeof actor.animation !== 'string') return actor.animation;
  const animation = Object.hasOwn(definition.animations, actor.animation) ? definition.animations[actor.animation] : undefined;
  assert(animation, `Actor "${actor.id}": unknown animation "${actor.animation}"`);
  return animation;
}

export function validateProfile(config: ProfileConfig, registry: Registry): void {
  assert(config && typeof config === 'object', 'Profile config must be an object');
  assert(config.canvas && Number.isInteger(config.canvas.width) && positive(config.canvas.width) && config.canvas.width <= 4096 && Number.isInteger(config.canvas.height) && positive(config.canvas.height) && config.canvas.height <= 4096, 'Canvas dimensions must be integers from 1 to 4096');
  assert(finite(config.canvas.groundY) && config.canvas.groundY >= 0 && config.canvas.groundY <= config.canvas.height, 'Canvas groundY must be inside the canvas');
  assert(config.scene && positive(config.scene.duration), 'Scene duration must be > 0');
  assert(typeof config.scene.loop === 'boolean', 'Scene loop must be true or false');
  text(config.title, 'Scene title'); text(config.description, 'Scene description');
  if (config.scene.label !== undefined) text(config.scene.label, 'Scene label');
  if (config.scene.eyebrow !== undefined) text(config.scene.eyebrow, 'Scene eyebrow');
  assert(config.scene.showTiming === undefined || typeof config.scene.showTiming === 'boolean', 'Scene showTiming must be true or false');
  for (const mode of ['dark', 'light'] as const) {
    assert(config.theme?.[mode], `Theme "${mode}" is missing`);
    for (const key of ['background', 'foreground', 'muted', 'ground', 'accent', 'panel'] as const) color(config.theme[mode][key], `${mode}.${key}`);
  }
  assert(Array.isArray(config.characters) && Array.isArray(config.props), 'Characters and props must be arrays');
  assert(config.characters.length + config.props.length <= 100, 'Scene supports at most 100 actors');
  const ids = new Set<string>();
  for (const [actors, definitions, kind] of [[config.characters, registry.characters, 'character'], [config.props, registry.props, 'prop']] as const) {
    for (const actor of actors) {
      assert(/^[a-zA-Z][a-zA-Z0-9_-]*$/.test(actor.id), `Actor ID "${actor.id}" must start with a letter and use letters, digits, hyphens, or underscores`);
      assert(!ids.has(actor.id), `Character/prop ID "${actor.id}" is duplicated`); ids.add(actor.id);
      const definition = Object.hasOwn(definitions, actor.preset) ? definitions[actor.preset] : undefined;
      assert(definition, `Unknown ${kind} "${actor.preset}"`);
      validateDefinition(definition);
      assert(actor.position && finite(actor.position.x) && finite(actor.position.y), `Actor "${actor.id}" position must contain finite x and y`);
      assert(actor.scale === undefined || positive(actor.scale), `Actor "${actor.id}" scale must be > 0`);
      if (actor.name !== undefined) text(actor.name, 'Actor name');
      for (const [symbol, value] of Object.entries(actor.palette ?? {})) { assert(Object.hasOwn(definition.palette, symbol), `Actor "${actor.id}": unknown palette key "${symbol}"`); color(value, `Palette key "${symbol}"`); }
      const palette = resolvePalette(definition, actor);
      for (const [symbol, value] of Object.entries(palette)) color(value, `Actor "${actor.id}" palette key "${symbol}"`);
      const defaultFrame = actor.frame ?? definition.defaultFrame;
      assert(Object.hasOwn(definition.sprites, defaultFrame), `Actor "${actor.id}": unknown frame "${defaultFrame}"`);
      const animation = resolveAnimation(actor, definition);
      if (animation) {
        validateAnimation(animation, definition.sprites);
        assert(leafCount(animation) <= 10000, 'Animation expands to too many clips');
        assert(Number.isFinite(animationDuration(animation)), 'Animation duration must be finite');
        try { compileTimeline(animation, config.scene.duration, defaultFrame); }
        catch (error) { throw new Error(`Actor "${actor.id}": ${(error as Error).message}`); }
      }
    }
  }
}
