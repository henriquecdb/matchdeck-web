import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { units } from '../src/features/units/catalog.ts';
const root = new URL('../public/unit-guide/', import.meta.url);
const manifest = JSON.parse(
  readFileSync(new URL('provenance.json', root), 'utf8'),
);

test('every guide unit has its own valid, unmodified local PNG portrait', () => {
  assert.equal(manifest.files.length, units.length);
  for (const unit of units) {
    const path = `${unit.game}/${unit.id}.png`;
    const file = manifest.files.find((file) => file.path === path);
    assert.ok(file, path);
    const bytes = readFileSync(new URL(path, root));
    assert.equal(
      bytes.subarray(0, 8).toString('hex'),
      '89504e470d0a1a0a',
      path,
    );
    assert.equal(
      createHash('sha256').update(bytes).digest('hex'),
      file.sha256,
      path,
    );
    assert.ok(manifest.sources[unit.game].revision);
  }
});
