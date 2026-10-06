import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { watch } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const run = promisify(execFile);
const port = Number(process.env['PORT'] ?? 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535');
let version = 0;
let errorMessage = '';
let rebuilding = false;
let dirty = false;
let timer: NodeJS.Timeout | undefined;

async function rebuild(): Promise<void> {
  if (rebuilding) { dirty = true; return; }
  rebuilding = true;
  do {
    dirty = false;
    try {
      // A fresh process reloads config AND imported sprites; cache-busting only the config would miss asset edits.
      const result = await run(process.execPath, ['--import', 'tsx', resolve(root, 'scripts/generate.ts')], { cwd: root });
      errorMessage = ''; version++; console.log(result.stdout.trim());
    } catch (error) {
      errorMessage = (error as Error & { stderr?: string }).stderr?.trim() || (error as Error).message;
      console.error(errorMessage);
    }
  } while (dirty);
  rebuilding = false;
}

await rebuild();
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? '/', 'http://localhost').pathname;
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  if (pathname === '/status') {
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ version, error: errorMessage, rebuilding })); return;
  }
  const files: Record<string, readonly [string, string]> = {
    '/': ['preview/index.html', 'text/html; charset=utf-8'],
    '/dist/scene.svg': ['dist/scene.svg', 'image/svg+xml'],
    '/dist/scene-light.svg': ['dist/scene-light.svg', 'image/svg+xml'],
    '/dist/scene-still.svg': ['dist/scene-still.svg', 'image/svg+xml'],
    '/dist/scene-light-still.svg': ['dist/scene-light-still.svg', 'image/svg+xml'],
  };
  const file = files[pathname];
  if (!file) { response.writeHead(404); response.end('Not found'); return; }
  try { response.setHeader('Content-Type', file[1]); response.end(await readFile(resolve(root, file[0]))); }
  catch { response.writeHead(503); response.end('Scene unavailable. Fix the configuration error and save again.'); }
});

const watchers = ['profile.config.ts', 'characters', 'props', 'src'].map(path => watch(resolve(root, path), { recursive: path !== 'profile.config.ts' }, (_, filename) => {
  if (filename && !filename.endsWith('.ts')) return;
  clearTimeout(timer); timer = setTimeout(() => { void rebuild(); }, 180);
}));
server.on('error', error => { console.error(`Preview: ${error.message}`); watchers.forEach(watcher => watcher.close()); process.exitCode = 1; });
server.listen(port, '127.0.0.1', () => console.log(`\nPreview → http://127.0.0.1:${port}\nSave config or assets to regenerate. Ctrl+C to stop.`));
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.once(signal, () => {
  clearTimeout(timer); watchers.forEach(watcher => watcher.close()); server.close();
});
