import { readFile, writeFile, mkdir, copyFile } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const app = resolve(process.argv[2] || '..');
const destination = resolve(root, 'src/vendor/matchdeck');
const files = new Map();
async function copySource(path) {
  if (files.has(path)) return;
  const contents = Buffer.from(
    (await readFile(resolve(app, path), 'utf8')).replaceAll('\r\n', '\n'),
  );
  files.set(path, createHash('sha256').update(contents).digest('hex'));
  const target = resolve(destination, path);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, contents);
  if (!/\.tsx?$/.test(path)) return;
  for (const [, dependency] of contents
    .toString()
    .matchAll(/from\s+['"](\.[^'"]+)['"]/g)) {
    const candidate = relative(
      app,
      resolve(app, dirname(path), dependency),
    ).replaceAll('\\', '/');
    if (candidate.endsWith('.json')) await copySource(candidate);
    else {
      let found = false;
      for (const extension of ['.ts', '.tsx']) {
        try {
          await readFile(resolve(app, candidate + extension));
        } catch {
          continue;
        }
        await copySource(candidate + extension);
        found = true;
        break;
      }
      if (!found) throw new Error(`Dependency not found: ${candidate}`);
    }
  }
}
await copySource('src/features/overlay/MatchOverlay.tsx');
await copySource('src/styles.css');
await copySource('src/games/aoe2/demo.ts');
const catalog = JSON.parse(
  await readFile(resolve(app, 'src/games/aoe2/unit-catalog.json'), 'utf8'),
);
for (const civilization of ['franks', 'britons']) {
  for (const image of [
    catalog[civilization].image,
    catalog[civilization].emblem,
  ]) {
    const path = `public${image}`;
    await mkdir(dirname(resolve(root, path)), { recursive: true });
    await copyFile(resolve(app, path), resolve(root, path));
  }
}
await mkdir(resolve(root, 'public/units'), { recursive: true });
await copyFile(
  resolve(app, 'public/units/NOTICE.md'),
  resolve(root, 'public/units/NOTICE.md'),
);
await writeFile(
  resolve(destination, 'provenance.json'),
  JSON.stringify(
    {
      repository: 'https://github.com/henriquecdb/MatchDeck',
      commit: execFileSync('git', ['rev-parse', 'HEAD'], {
        cwd: app,
        encoding: 'utf8',
      }).trim(),
      files: Object.fromEntries(files),
    },
    null,
    2,
  ) + '\n',
);
console.log(`Synced ${files.size} original app files and demo artwork.`);
