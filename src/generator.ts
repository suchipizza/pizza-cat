import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { ProfileConfig, Registry } from './types.ts';
import { renderScene } from './renderer.ts';

/** Validate/render all variants before writing, so an invalid config cannot partially update output. */
export async function generate(config: ProfileConfig, registry: Registry, directory: string): Promise<readonly string[]> {
  const outputs = [
    ['scene.svg', renderScene(config, registry, { mode: 'dark' })],
    ['scene-light.svg', renderScene(config, registry, { mode: 'light' })],
    ['scene-still.svg', renderScene(config, registry, { mode: 'dark', animated: false })],
    ['scene-light-still.svg', renderScene(config, registry, { mode: 'light', animated: false })],
  ] as const;
  await mkdir(directory, { recursive: true });
  await Promise.all(outputs.map(([name, svg]) => writeFile(resolve(directory, name), svg, 'utf8')));
  return outputs.map(([name]) => name);
}
