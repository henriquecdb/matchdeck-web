export type GameId = 'aoe2' | 'aoe4' | 'sc2';
export type Faction = 'Terran' | 'Protoss' | 'Zerg';
export interface Counter {
  id: string;
  reason: string;
}
export interface Unit {
  id: string;
  game: GameId;
  name: string;
  aliases: string;
  faction: string;
  category: string;
  targets: string;
  stage: string;
  role: string;
  strong: string;
  caution: string;
  tip: string;
  counters: Counter[];
}
export function normalize(value: string) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}
export function searchUnits(
  units: Unit[],
  game: GameId,
  query = '',
  category = 'all',
) {
  const terms = normalize(query).split(/\s+/).filter(Boolean);
  return units.filter(
    (unit) =>
      unit.game === game &&
      (category === 'all' || unit.category === category) &&
      terms.every((term) =>
        normalize(
          `${unit.name} ${unit.aliases} ${unit.faction} ${unit.category}`,
        ).includes(term),
      ),
  );
}
export function counterOptions(unit: Unit, units: Unit[], faction = 'all') {
  return unit.counters.flatMap((counter) => {
    const target = units.find(
      (item) => item.game === unit.game && item.id === counter.id,
    );
    return target && (faction === 'all' || target.faction === faction)
      ? [{ unit: target, reason: counter.reason }]
      : [];
  });
}
export function readSelection(search: string, units: Unit[]) {
  const params = new URLSearchParams(search);
  const game: GameId = ['aoe2', 'aoe4', 'sc2'].includes(
    params.get('jogo') ?? '',
  )
    ? (params.get('jogo') as GameId)
    : 'aoe2';
  const unit =
    units.find(
      (item) => item.game === game && item.id === params.get('unidade'),
    ) ?? units.find((item) => item.game === game)!;
  const faction = ['Terran', 'Protoss', 'Zerg'].includes(
    params.get('raca') ?? '',
  )
    ? params.get('raca')!
    : 'all';
  return { game, unit, faction };
}
