import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { stat } from 'node:fs/promises';
import { generate } from '../src/generator.ts';
import { characters } from '../characters/index.ts';
import { props } from '../props/index.ts';
import type { ProfileConfig } from '../src/types.ts';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
try {
  const args = process.argv.slice(2);
  const options: Record<string, string> = {};
  for (let i = 0; i < args.length; i += 2) {
    const key = args[i]; const value = args[i + 1];
    if (!key || !['--config', '--out'].includes(key) || !value || value.startsWith('--')) throw new Error('Usage: npm run generate -- [--config path/to/config.ts] [--out output/directory]');
    options[key] = value;
  }
  const configPath = resolve(root, options['--config'] ?? 'profile.config.ts');
  const config = (await import(pathToFileURL(configPath).href)).default as ProfileConfig;
  const output = resolve(root, options['--out'] ?? 'dist');
  const names = await generate(config, { characters, props }, output);
  for (const name of names) {
    const size = (await stat(resolve(output, name))).size;
    console.log(`Generated ${name} (${(size / 1024).toFixed(1)} KB)`);
  }
} catch (error) {
  console.error(`pizza-cat: ${(error as Error).message}`);
  process.exitCode = 1;
}
