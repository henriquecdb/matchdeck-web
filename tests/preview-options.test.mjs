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
test('Age IV preserves vertical layout while normalizing team size', () => {
  const option = selectPreview('aoe4', 'stacked', 4);
  assert.equal(option.id, 'aoe4-stacked-1');
  assert.equal(option.teamSize, 1);
  assert.equal(option.width, 360);
});

test('SC2 uses its dedicated two-player overlay regardless of the Age II team format', () => {
  const option = selectPreview('sc2', 'detailed', 4);
  assert.equal(option.id, 'sc2-1');
  assert.equal(option.teamSize, 1);
  assert.equal(option.width, 400);
});

test('post-game previews preserve results and normalize unsupported teams', () => {
  for (const game of ['aoe2-de', 'aoe4', 'sc2']) {
    for (const result of ['win', 'loss', 'draw']) {
      const option = selectPreview(game, 'detailed', 4, 'post-game', result);
      assert.equal(option.stage, 'post-game');
      assert.equal(option.result, result);
      assert.equal(option.teamSize, game === 'aoe2-de' ? 4 : 1);
      assert.equal(option.width, 400);
    }
  }
});
