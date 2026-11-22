import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { units } from '../../src/features/units/catalog.ts';

test('guide ships every ficha and reachable counter link, including without JavaScript', () => {
  const html = readFileSync(
    new URL('../../dist/unidades/index.html', import.meta.url),
    'utf8',
  );
  for (const unit of units) {
    assert.ok(html.includes(`id="unit-${unit.game}-${unit.id}"`));
    assert.ok(
      html.includes(`?jogo=${unit.game}&#38;unidade=${unit.id}`) ||
        html.includes(`?jogo=${unit.game}&amp;unidade=${unit.id}`) ||
        html.includes(`?jogo=${unit.game}&unidade=${unit.id}`),
    );
  }
  assert.match(html, /<noscript>/);
  assert.doesNotMatch(html, /data-unit-panel="[^"]+" hidden/);
});
