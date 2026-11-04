export interface CivilizationStats {
  id: string;
  games: number;
  wins: number;
  losses: number;
  winRate: number;
  name?: string;
  icon?: string;
}
export interface StatsView {
  id: string;
  label: string;
  rows: CivilizationStats[];
}
export interface GameStats {
  sourceName: string;
  sourceUrl: string;
  endpoint: string;
  patch: string;
  fetchedAt: string;
  sourceUpdatedAt: string | null;
  periodStart: string | null;
  lastAttemptAt: string;
  fetchError: string | null;
  notes: string[];
  unmappedIds: number[];
  views: StatsView[];
}
export interface StatsSnapshot {
  schemaVersion: number;
  games: Record<'aoe2' | 'aoe4', GameStats>;
}
export function rankRows(
  rows: CivilizationStats[],
  search = '',
  minimum = 100,
  sort = 'winRate',
  ascending = false,
) {
  const needle = search
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .trim();
  return rows
    .filter(
      (row) =>
        row.games >= minimum &&
        (row.name || row.id)
          .normalize('NFD')
          .replace(/\p{Diacritic}/gu, '')
          .toLowerCase()
          .includes(needle),
    )
    .sort((a, b) => {
      const left =
        sort === 'name'
          ? a.name || a.id
          : a[sort as 'games' | 'wins' | 'losses' | 'winRate'];
      const right =
        sort === 'name'
          ? b.name || b.id
          : b[sort as 'games' | 'wins' | 'losses' | 'winRate'];
      const delta =
        typeof left === 'string' && typeof right === 'string'
          ? left.localeCompare(right, 'pt-BR')
          : Number(left) - Number(right);
      return (
        (ascending ? delta : -delta) ||
        b.games - a.games ||
        a.id.localeCompare(b.id)
      );
    });
}
export function freshness(data: GameStats, now = Date.now()) {
  if (
    data.sourceUpdatedAt &&
    now - Date.parse(data.sourceUpdatedAt) > 7 * 86400000
  )
    return `Dados históricos: agregado gerado pela fonte em ${new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date(data.sourceUpdatedAt))}. Não representa necessariamente o patch atual.`;
  if (now - Date.parse(data.fetchedAt) > 2 * 86400000)
    return 'A última consulta tem mais de 48 horas. Verifique a data antes de usar estes números.';
  return '';
}
