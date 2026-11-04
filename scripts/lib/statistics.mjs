export function count(value, label) {
  if (!Number.isSafeInteger(value) || value < 0)
    throw new Error(`Invalid count: ${label}`);
  return value;
}
function row(id, games, wins) {
  if (!/^[a-z][a-z0-9_]*$/.test(id)) throw new Error('Invalid civilization ID');
  count(games, 'games');
  count(wins, 'wins');
  if (wins > games) throw new Error('Wins exceed sample size');
  return {
    id,
    games,
    wins,
    losses: games - wins,
    winRate: games ? (100 * wins) / games : 0,
  };
}
function tupleRows(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input))
    throw new Error('Missing civilization aggregate');
  const rows = Object.entries(input).map(([id, tuple]) => {
    if (!Array.isArray(tuple) || tuple.length !== 2)
      throw new Error('Expected [games, wins]');
    return row(id, tuple[0], tuple[1]);
  });
  if (rows.length < 2)
    throw new Error('Empty or incomplete civilization aggregate');
  return rows;
}
export function normalizeAoe2(raw) {
  if (
    !raw.meta ||
    !Number.isFinite(Date.parse(raw.meta.generated)) ||
    !Array.isArray(raw.meta.elo)
  )
    throw new Error('Missing Age II metadata');
  const patches = Object.keys(raw.civ?.['1v1'] ?? {});
  if (patches.length !== 1)
    throw new Error('Expected a single source patch aggregate');
  const groups = raw.civ['1v1'][patches[0]];
  return {
    sourceUpdatedAt: new Date(raw.meta.generated).toISOString(),
    periodStart: raw.meta.patchStart ?? null,
    patch: raw.meta.patchLabel || `Patch ${patches[0]}`,
    notes: [
      'Ranqueado 1v1 · Random Map. Amostra publicada por um agregador comunitário; não representa todas as partidas do jogo.',
      'Partidas significa participações de jogadores com a civilização. Não somar as linhas como partidas únicas.',
      'Civilizações não mapeadas pelo provedor ficam fora do ranking. Não aplicamos exclusão adicional de espelhos.',
    ],
    unmappedIds: raw.meta.unmappedCivIds ?? [],
    views: [
      { id: 'all', label: 'Todos os Elos', rows: tupleRows(groups['-1']) },
      ...raw.meta.elo.map((band, index) => ({
        id: String(index),
        label: band.label,
        rows: tupleRows(groups[String(index)]),
      })),
    ],
  };
}
export function normalizeAoe4(raw) {
  if (
    raw.leaderboard !== 'rm_solo' ||
    !Array.isArray(raw.data) ||
    raw.data.length < 2 ||
    !raw.patch
  )
    throw new Error('Unexpected Age IV dataset');
  const seen = new Set();
  return {
    patch: String(raw.patch),
    rows: raw.data.map((item) => {
      if (seen.has(item.civilization))
        throw new Error('Duplicate civilization');
      seen.add(item.civilization);
      // The source win rate uses player_games_count, not games_count (distinct games).
      const result = row(
        item.civilization,
        item.player_games_count,
        item.win_count,
      );
      if (
        typeof item.win_rate !== 'number' ||
        Math.abs(result.winRate - item.win_rate) > 0.0001
      )
        throw new Error('Inconsistent Age IV denominator');
      return result;
    }),
  };
}
