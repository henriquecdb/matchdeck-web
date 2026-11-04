import aoe2Names from '../../vendor/matchdeck/src/games/aoe2/pt-BR.json';
import { civilizationArtwork } from '../../vendor/matchdeck/src/games/aoe4/catalog';
import { asset } from '../../config/site';
import type { StatsSnapshot } from './model';
export function enrichSnapshot(snapshot: StatsSnapshot): StatsSnapshot {
  const names: Record<string, { name: string }> = aoe2Names;
  return {
    ...snapshot,
    games: Object.fromEntries(
      Object.entries(snapshot.games).map(([game, data]) => [
        game,
        {
          ...data,
          views: data.views.map((view) => ({
            ...view,
            rows: view.rows.map((row) => ({
              ...row,
              name:
                game === 'aoe2'
                  ? names[row.id]?.name || row.id
                  : civilizationArtwork(
                      { civilizationId: row.id, civilization: row.id },
                      'pt-BR',
                    ).name,
              icon:
                game === 'aoe2'
                  ? names[row.id]
                    ? asset('civilizations/' + row.id + '.png')
                    : undefined
                  : asset(
                      civilizationArtwork(
                        { civilizationId: row.id, civilization: row.id },
                        'pt-BR',
                      ).emblem,
                    ),
            })),
          })),
        },
      ]),
    ) as StatsSnapshot['games'],
  };
}
