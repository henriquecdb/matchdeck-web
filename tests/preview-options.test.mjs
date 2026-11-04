import test from 'node:test';
import assert from 'node:assert/strict';
import { selectPreview } from '../src/features/preview/preview-options.ts';

test('detailed preference falls back to stacked in teams, and remains detailed in duels', () => {
  assert.equal(selectPreview('aoe2-de', 'detailed', 1).id, 'aoe2-detailed-1');
  for (const size of [2, 3, 4])
    assert.equal(
      selectPreview('aoe2-de', 'detailed', size).id,
      `aoe2-stacked-${size}`,
    );
  assert.equal(selectPreview('aoe2-de', 'compact', 4).id, 'aoe2-compact-4');
});
test('Age IV always uses its dedicated 1v1 overlay regardless of the prior Age II selection', () => {
  const option = selectPreview('aoe4', 'stacked', 4);
  assert.equal(option.id, 'aoe4-1');
  assert.equal(option.teamSize, 1);
  assert.equal(option.width, 900);
});
