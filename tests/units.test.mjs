import test from 'node:test';
import assert from 'node:assert/strict';
import { units, games } from '../src/features/units/catalog.ts';
import {
  searchUnits,
  counterOptions,
  readSelection,
} from '../src/features/units/model.ts';

test('unit answers resolve within their game and never recommend the target itself', () => {
  const keys = units.map((unit) => `${unit.game}:${unit.id}`);
  assert.equal(new Set(keys).size, units.length);
  for (const unit of units) {
    assert.ok(unit.counters.length > 0, unit.id);
    assert.equal(
      counterOptions(unit, units).length,
      unit.counters.length,
      `${unit.game}:${unit.id}`,
    );
    assert.equal(
      new Set(unit.counters.map((counter) => counter.id)).size,
      unit.counters.length,
    );
    for (const counter of unit.counters) {
      assert.notEqual(counter.id, unit.id);
      assert.ok(counter.reason.trim());
    }
    for (const field of [
      'name',
      'role',
      'strong',
      'caution',
      'targets',
      'tip',
      'stage',
    ])
      assert.ok(unit[field].trim(), `${unit.id}:${field}`);
  }
});

test('search handles Portuguese accents, English aliases and multiple terms without crossing games', () => {
  assert.equal(searchUnits(units, 'sc2', '  HIDRALISCA ')[0].id, 'hydra');
  assert.equal(searchUnits(units, 'sc2', 'NAVE MAE')[0].id, 'mothership');
  assert.equal(searchUnits(units, 'aoe2', 'crossbowman')[0].id, 'archer');
  assert.equal(searchUnits(units, 'aoe4', 'crossbowman')[0].id, 'crossbow');
  assert.equal(searchUnits(units, 'sc2', 'terran marine')[0].id, 'marine');
  assert.equal(searchUnits(units, 'sc2', 'marine', 'Aérea').length, 0);
  assert.equal(searchUnits(units, 'aoe2', 'nada-disponivel').length, 0);
});

test('own-race filter limits responses without filtering the enemy unit catalogue', () => {
  const marine = units.find(
    (unit) => unit.game === 'sc2' && unit.id === 'marine',
  );
  for (const race of ['Terran', 'Protoss', 'Zerg']) {
    const answers = counterOptions(marine, units, race);
    assert.ok(answers.length);
    assert.ok(answers.every((answer) => answer.unit.faction === race));
  }
  const banshee = units.find(
    (unit) => unit.game === 'sc2' && unit.id === 'banshee',
  );
  assert.equal(counterOptions(banshee, units, 'Protoss')[0].unit.id, 'phoenix');
});

test('deep links reject unknown games, cross-game units and invalid races', () => {
  const linked = readSelection('?jogo=sc2&unidade=lurker&raca=Terran', units);
  assert.equal(linked.unit.id, 'lurker');
  assert.equal(linked.faction, 'Terran');
  const invalid = readSelection(
    '?jogo=unknown&unidade=lurker&raca=unknown',
    units,
  );
  assert.equal(invalid.game, 'aoe2');
  assert.equal(invalid.unit.game, 'aoe2');
  assert.equal(invalid.faction, 'all');
  for (const game of Object.keys(games))
    assert.ok(units.some((unit) => unit.game === game));
});
