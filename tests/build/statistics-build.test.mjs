import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
test('built statistics page includes consistent snapshots and valid artwork for both games', () => {
  const html = readFileSync(
    new URL('../../dist/estatisticas/index.html', import.meta.url),
    'utf8',
  );
  const json = html.match(
    /<script[^>]*id="statistics-data"[^>]*>([\s\S]*?)<\/script>/,
  )?.[1];
  assert.ok(json, 'Embedded snapshot is missing');
  assert.doesNotMatch(json, /<\/script/i);
  const snapshot = JSON.parse(json);
  assert.deepEqual(Object.keys(snapshot.games).sort(), ['aoe2', 'aoe4']);
  const original = JSON.parse(
    readFileSync(
      new URL('../../public/data/statistics.json', import.meta.url),
      'utf8',
    ),
  );
  assert.deepEqual(
    snapshot.games.aoe2.views.map((view) => view.label),
    original.games.aoe2.views.map((view) => view.label),
  );
  for (const data of Object.values(snapshot.games)) {
    assert.ok(Number.isFinite(Date.parse(data.fetchedAt)));
    for (const view of data.views)
      for (const row of view.rows) {
        assert.equal(row.wins + row.losses, row.games);
        assert.ok(
          Math.abs(
            row.winRate - (row.games ? (100 * row.wins) / row.games : 0),
          ) < 0.0001,
        );
        assert.equal(typeof row.name, 'string');
        if (row.icon) {
          const match = row.icon.match(/\/(civilizations|aoe4)\/(.*)$/);
          assert.ok(match);
          assert.ok(
            existsSync(
              new URL(`../../dist/${match[1]}/${match[2]}`, import.meta.url),
            ),
            row.icon,
          );
        }
      }
  }
  if (
    Date.now() - Date.parse(snapshot.games.aoe2.sourceUpdatedAt) >
    7 * 86400000
  )
    assert.match(html, /Dados históricos/);
});
