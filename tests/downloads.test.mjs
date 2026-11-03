import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

test('download points at stable official release page, never a pinned installer', () => {
  const config = readFileSync(
    new URL('../src/config/site.ts', import.meta.url),
    'utf8',
  );
  assert.match(
    config,
    /releases: 'https:\/\/github.com\/henriquecdb\/MatchDeck\/releases\/latest'/,
  );
  const section = readFileSync(
    new URL('../src/features/downloads/DownloadSection.astro', import.meta.url),
    'utf8',
  );
  assert.match(section, /href=\{site.releases\}/);
  assert.doesNotMatch(section, /\.exe|0\.4\.1/);
});
