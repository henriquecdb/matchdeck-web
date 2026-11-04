import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAoe2, normalizeAoe4 } from '../scripts/lib/statistics.mjs';
import { rankRows, freshness } from '../src/features/statistics/model.ts';
test('Age IV uses player samples, never distinct-game counts or rounded percentages', () => {
  const raw = {
    leaderboard: 'rm_solo',
    patch: '123',
    data: [
      {
        civilization: 'english',
        games_count: 90,
        player_games_count: 100,
        win_count: 54,
        win_rate: 54,
      },
      {
        civilization: 'chinese',
        games_count: 50,
        player_games_count: 60,
        win_count: 30,
        win_rate: 50,
      },
    ],
  };
  const result = normalizeAoe4(raw).rows[0];
  assert.equal(result.games, 100);
  assert.equal(result.wins, 54);
  assert.equal(result.losses, 46);
  raw.data[0].win_rate = 60;
  assert.throws(() => normalizeAoe4(raw), /denominator/);
});
test('Age II chooses all-Elo aggregate without double counting its individual bands', () => {
  const raw = {
    meta: {
      generated: '2026-10-03T00:00:00Z',
      elo: [{ label: '<600' }],
      patchLabel: 'Test',
    },
    civ: {
      '1v1': {
        0: {
          '-1': { franks: [100, 55], britons: [100, 45] },
          0: { franks: [10, 6], britons: [10, 4] },
        },
      },
    },
  };
  const result = normalizeAoe2(raw);
  assert.equal(result.views[0].rows[0].games, 100);
  assert.equal(result.views[0].rows[0].losses, 45);
  raw.civ['1v1']['0']['-1'].franks = [100, 101];
  assert.throws(() => normalizeAoe2(raw), /exceed/);
});
test('ranking applies accent-insensitive search and sample threshold without mutating input', () => {
  const rows = [
    {
      id: 'a',
      name: 'Bretões',
      games: 1000,
      wins: 550,
      losses: 450,
      winRate: 55,
    },
    { id: 'b', name: 'Francos', games: 5, wins: 5, losses: 0, winRate: 100 },
  ];
  assert.equal(rankRows(rows, 'bretoes')[0].id, 'a');
  assert.equal(rankRows(rows, '', 100).length, 1);
  assert.equal(rankRows(rows, '', 0)[0].id, 'b');
  assert.equal(rows[0].id, 'a');
});
test('freshly downloading old source data never makes it current', () => {
  const now = Date.parse('2026-11-04T12:00:00Z');
  assert.match(
    freshness(
      {
        sourceUpdatedAt: '2026-10-03T00:00:00Z',
        fetchedAt: new Date(now).toISOString(),
      },
      now,
    ),
    /históricos/,
  );
});
