import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { XMLParser, XMLValidator } from 'fast-xml-parser';
import profile from '../profile.config.ts';
import { characters } from '../characters/index.ts';
import { props } from '../props/index.ts';
import template from '../characters/_template/character.ts';
import alternate from '../examples/husky-cat-food/profile.config.ts';
import { defineProfile } from '../src/config.ts';
import { delay, fade, frameSwap, loop, motionPath, parallel, rotate, scale, sequence, translate } from '../src/animation.ts';
import { compileTimeline, animationDuration } from '../src/timeline.ts';
import { renderScene } from '../src/renderer.ts';
import { renderSprite, resolvePalette } from '../src/sprites.ts';
import { validateProfile, validateSprite, validateDefinition } from '../src/validation.ts';
import { generate } from '../src/generator.ts';
import type { ProfileConfig } from '../src/types.ts';

const registry = { characters, props };
function config(overrides: Partial<ProfileConfig>): ProfileConfig { return defineProfile({ ...profile, ...overrides }); }
function single(animation: ProfileConfig['characters'][number]['animation']): ProfileConfig {
  return config({ characters: [{ id: 'solo', preset: 'demo-dog', position: { x: 100, y: 244 }, ...(animation ? { animation } : {}) }], props: [] });
}

test('configuration validates and named animations resolve', () => {
  validateProfile(profile, registry);
  validateProfile(single('idle'), registry);
  assert.throws(() => validateProfile(single('missing'), registry), /unknown animation "missing"/);
  assert.throws(() => validateProfile(config({ scene: { duration: 0, loop: true } }), registry), /duration must be > 0/);
  assert.throws(() => validateProfile(config({ characters: [{ ...profile.characters[0], preset: 'my-dog' }] }), registry), /Unknown character "my-dog"/);
  assert.throws(() => validateProfile(config({ characters: [profile.characters[0], profile.characters[0]] }), registry), /duplicated/);
  assert.throws(() => validateProfile(config({ props: [{ ...profile.props[0], id: profile.characters[0].id }] }), registry), /duplicated/);
  assert.throws(() => validateProfile(single('toString'), registry), /unknown animation/);
});

test('invalid sprites, absent colors, dimensions, and unsafe colors fail early', () => {
  assert.throws(() => validateSprite(['XX', 'X'], { X: '#fff' }, 'walk-2'), /walk-2.*inconsistent row widths/);
  assert.throws(() => validateSprite(['XF'], { X: '#fff' }), /Palette key "F" is missing/);
  assert.throws(() => validateSprite(['X '], { X: '#fff' }), /dots for transparency/);
  assert.throws(() => validateDefinition({ ...template, dimensions: { width: 9, height: 8 } }), /inconsistent row widths/);
  assert.throws(() => validateProfile(config({ characters: [{ ...profile.characters[0], appearance: { primary: 'url(https://example.com)' } }] }), registry), /hex color/);
  assert.throws(() => validateProfile(config({ characters: [{ ...profile.characters[0], appearance: { horns: '#fff' } }] }), registry), /unknown appearance role/);
  assert.throws(() => validateProfile(config({ characters: [{ ...profile.characters[0], position: { x: NaN, y: 20 } }] }), registry), /finite x and y/);
});

test('palette customization is per actor and pixel runs are optimized', () => {
  const definition = characters['demo-dog']!;
  const palette = resolvePalette(definition, { ...profile.characters[0], appearance: { primary: '#123456' } });
  assert.equal(palette['P'], '#123456');
  assert.equal(definition.palette['P'], '#f4b76c');
  const svg = renderSprite(['XXX.X', '.....'], { X: '#123456' });
  assert.equal((svg.match(/<rect/g) ?? []).length, 2);
  assert.match(svg, /width="3"/);
  assert.match(svg, /fill="#123456"/);
});

test('sequences, parallels, finite loops, and delays compile onto one deterministic clock', () => {
  const choreography = parallel([
    sequence([delay(2), translate([[0, 0], [20, 0]], 2), delay(2), translate([[20, 0], [0, 0]], 2)]),
    loop(frameSwap(['idle', 'blink', 'idle'], 2), 4),
  ]);
  assert.equal(animationDuration(choreography), 8);
  const tracks = compileTimeline(choreography, 10, 'idle');
  assert.deepEqual(tracks.find(track => track.channel === 'translate')?.keyTimes, [0, 0.2, 0.4, 0.6, 0.8, 1]);
  assert.deepEqual(tracks.find(track => track.channel === 'translate')?.values, [[0, 0], [0, 0], [20, 0], [20, 0], [0, 0], [0, 0]]);
  assert.equal(tracks.filter(track => track.channel === 'frame').length, 1);
  assert.equal(tracks.find(track => track.channel === 'frame')?.discrete, true);
});

test('ambiguous or invalid animation instructions produce useful errors', () => {
  assert.throws(() => validateProfile(single(parallel([rotate([0, 90], 2), rotate([0, 180], 2)])), registry), /Overlapping rotate/);
  assert.throws(() => validateProfile(single(sequence([rotate([0, 90], 2), delay(1), rotate([0, 180], 2)])), registry), /Discontinuous rotate/);
  assert.throws(() => validateProfile(single(translate([[0, 0], [1, 1]], 20)), registry), /exceeds scene duration/);
  assert.throws(() => validateProfile(single(frameSwap(['idle', 'absent'], 2)), registry), /Unknown sprite frame/);
  assert.throws(() => validateProfile(single(rotate([0, 20], 1, { keyTimes: [0, 0.5] })), registry), /keyTimes/);
  assert.throws(() => validateProfile(single(fade([0, 2], 2)), registry), /between 0 and 1/);
  assert.throws(() => validateProfile(single(loop(delay(1), 0)), registry), /Loop count/);
  assert.throws(() => validateProfile(single(motionPath('M 0 0 C 10 10', 2)), registry), /needs groups of 6/);
  assert.throws(() => validateProfile(single(motionPath('L 0 0', 2)), registry), /begin with M/);
  assert.throws(() => validateProfile(single(motionPath('M 0 0 A 1 1 0 2 0 4 4', 2)), registry), /flags/);
  assert.throws(() => validateProfile(single(motionPath('M 0 0 L Infinity 0', 2)), registry), /[Mm]otion path/);
});

test('SVG is valid XML, self-contained, deterministic, and contains independent actors and SMIL', () => {
  const svg = renderScene(profile, registry);
  assert.equal(XMLValidator.validate(svg), true);
  const document = new XMLParser({ ignoreAttributes: false }).parse(svg);
  assert.equal(document.svg['@_viewBox'], '0 0 900 320');
  for (const id of ['crumb', 'miso', 'airborne-pizza', 'escaped-maki']) assert.match(svg, new RegExp(`id="actor-${id}"`));
  for (const element of ['animateMotion', 'animateTransform', 'animate']) assert.match(svg, new RegExp(`<${element} `));
  assert.match(svg, /repeatCount="indefinite"/);
  assert.match(svg, /calcMode="discrete"/);
  assert.doesNotMatch(svg, /<script|<foreignObject|onload=|href="https?:/);
  const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  assert.equal(new Set(ids).size, ids.length);
  for (const match of svg.matchAll(/(?:href="#|url\(#)([\w-]+)/g)) assert.ok(ids.includes(match[1]));
  assert.ok(Buffer.byteLength(svg) < 500_000);
  assert.equal(renderScene(profile, registry), svg);
});

test('all SMIL tracks have valid keyTimes and frame visibility remains exclusive', () => {
  const svg = renderScene(profile, registry);
  for (const match of svg.matchAll(/<(?:animate|animateTransform|animateMotion) ([^>]+)\/>/g)) {
    const attributes = match[1]!;
    const times = /keyTimes="([^"]+)"/.exec(attributes)![1]!.split(';').map(Number);
    const values = /(?:values|keyPoints)="([^"]+)"/.exec(attributes)![1]!.split(';');
    assert.equal(times[0], 0); assert.equal(times.at(-1), 1);
    assert.equal(times.length, values.length);
    assert.ok(times.every((time, i) => i === 0 || time > times[i - 1]!));
  }
  const frames = compileTimeline(profile.characters[0].animation, 18, 'idle').find(track => track.channel === 'frame')!;
  assert.equal(frames.values[0], 'idle'); assert.equal(frames.values.at(-1), 'idle');
  const translation = compileTimeline(profile.characters[0].animation, 18, 'idle').find(track => track.channel === 'translate')!;
  assert.deepEqual(translation.values[0], translation.values.at(-1));
});

test('XML metacharacters in labels, names, and descriptions are escaped', () => {
  const svg = renderScene(config({ title: '<pizza & "cat">', description: "Miso's <plan> & Crumb", characters: [{ ...profile.characters[0], name: 'A < B & "C"' }] }), registry);
  assert.equal(XMLValidator.validate(svg), true);
  assert.match(svg, /&lt;pizza &amp; &quot;cat&quot;&gt;/);
  assert.match(svg, /Miso&apos;s &lt;plan&gt; &amp; Crumb/);
  assert.match(svg, /A &lt; B &amp; &quot;C&quot;/);
});

test('partial definitions and a newly registered template render without engine changes', () => {
  const custom = { ...template, animations: {}, sprites: { idle: template.sprites.idle } };
  const cfg = config({ characters: [{ id: 'tiny', preset: custom.id, position: { x: 200, y: 244 }, scale: 5 }], props: [] });
  const svg = renderScene(cfg, { ...registry, characters: { ...characters, [custom.id]: custom } });
  assert.equal(XMLValidator.validate(svg), true);
  assert.match(svg, /id="actor-tiny"/);
  assert.doesNotMatch(svg, /<animate/);
});

test('props support scale, opacity, frame switching, rotation, and curved paths together', () => {
  const cfg = config({ characters: [], props: [{ id: 'food', preset: 'sushi', position: { x: 100, y: 100 }, animation: parallel([
    scale([[1, 1], [2, 2], [1, 1]], 4), fade([1, 0, 1], 4), frameSwap(['maki', 'nigiri', 'maki'], 4), rotate([0, 360], 4), motionPath('M 0 0 Q 100 -50 200 0', 4),
  ]) }] });
  const svg = renderScene(cfg, registry);
  assert.equal(XMLValidator.validate(svg), true);
  assert.match(svg, /type="scale"/); assert.match(svg, /path="M 0 0 Q 100 -50 200 0"/);
  validateProfile(alternate, registry);
});

test('non-looping scenes play once and keep their final values', () => {
  const svg = renderScene(config({ scene: { duration: 18, loop: false } }), registry);
  assert.match(svg, /repeatCount="1" fill="freeze"/);
  assert.doesNotMatch(svg, /indefinite/);
});

test('generation writes valid dark, light, and motion-free variants and leaves output intact on invalid input', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'pizza-cat-'));
  try {
    const names = await generate(profile, registry, directory);
    assert.deepEqual(names, ['scene.svg', 'scene-light.svg', 'scene-still.svg', 'scene-light-still.svg']);
    const files = await Promise.all(names.map(name => readFile(join(directory, name), 'utf8')));
    files.forEach(svg => assert.equal(XMLValidator.validate(svg), true));
    assert.match(files[0]!, /#151823/); assert.match(files[1]!, /#fff9ed/);
    for (const still of files.slice(2)) assert.doesNotMatch(still, /<animate/);
    await assert.rejects(generate(config({ scene: { duration: -1, loop: true } }), registry, directory), /duration/);
    assert.equal(await readFile(join(directory, names[0]!), 'utf8'), files[0]);
  } finally { await rm(directory, { recursive: true, force: true }); }
});
