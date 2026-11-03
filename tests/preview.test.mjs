import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
test('app rendering sources remain identical to the synced revision', () => {
  const base = new URL('../src/vendor/matchdeck/', import.meta.url);
  const provenance = JSON.parse(readFileSync(new URL('provenance.json', base)));
  for (const [path, hash] of Object.entries(provenance.files)) {
    assert.equal(
      createHash('sha256')
        .update(readFileSync(new URL(path, base)))
        .digest('hex'),
      hash,
      path,
    );
  }
});
