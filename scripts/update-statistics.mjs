import { readFile, writeFile, mkdir, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { normalizeAoe2, normalizeAoe4 } from './lib/statistics.mjs';
const target = new URL('../public/data/statistics.json', import.meta.url);
let snapshot;
try {
  snapshot = JSON.parse(await readFile(target, 'utf8'));
} catch {
  snapshot = { schemaVersion: 1, games: {} };
}
const now = new Date().toISOString();
async function fetchJson(url) {
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'MatchDeck/0.1 (+https://github.com/henriquecdb/matchdeck-web)',
      Accept: 'application/json',
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}
const sources = {
  aoe2: {
    sourceName: 'AOE2 Complete Guide',
    sourceUrl: 'https://aoe2-guide.vercel.app/data',
    endpoint: 'https://aoe2-guide.vercel.app/data/ranked_data.json',
  },
  aoe4: {
    sourceName: 'AoE4 World',
    sourceUrl: 'https://aoe4world.com/api/',
    endpoint: 'https://aoe4world.com/api/v0/stats/rm_solo/civilizations',
  },
};
let successes = 0;
for (const game of ['aoe2', 'aoe4']) {
  try {
    let data;
    if (game === 'aoe2')
      data = normalizeAoe2(await fetchJson(sources.aoe2.endpoint));
    else {
      const bands = [
        ['all', 'Todas as ligas'],
        ['bronze', 'Bronze'],
        ['silver', 'Prata'],
        ['gold', 'Ouro'],
        ['platinum', 'Platina'],
        ['diamond', 'Diamante'],
        ['conqueror', 'Conquistador'],
      ];
      const views = [];
      let patch;
      // Seven small aggregates once per refresh; no crawling of matches or profiles.
      for (const [id, label] of bands) {
        const normalized = normalizeAoe4(
          await fetchJson(
            sources.aoe4.endpoint + (id === 'all' ? '' : `?rank_level=${id}`),
          ),
        );
        if (patch && patch !== normalized.patch)
          throw new Error('Patch changed while fetching rank groups');
        patch = normalized.patch;
        views.push({ id, label, rows: normalized.rows });
      }
      data = {
        patch,
        sourceUpdatedAt: null,
        periodStart: null,
        unmappedIds: [],
        views,
        notes: [
          'Ranqueado solo 1v1 de PC. A API não informa a data exata de geração deste agregado.',
          'Partidas usa player_games_count: participações com a civilização, a mesma base das vitórias e do winrate da fonte.',
          'Espelhos seguem o agregado do provedor. Contagens por liga descrevem o recorte da API e não devem ser somadas para reconstruir o total.',
        ],
      };
    }
    snapshot.games[game] = {
      ...sources[game],
      ...data,
      fetchedAt: now,
      lastAttemptAt: now,
      fetchError: null,
    };
    successes++;
    console.log(`${game}: refreshed ${data.views.length} groups`);
  } catch (error) {
    if (!snapshot.games[game])
      throw new Error(`${game}: no valid fallback snapshot (${error.message})`);
    snapshot.games[game] = {
      ...snapshot.games[game],
      lastAttemptAt: now,
      fetchError:
        'Fonte indisponível na última consulta; exibindo a última cópia válida.',
    };
    console.warn(`${game}: preserved last good snapshot (${error.message})`);
  }
}
snapshot.lastAttemptAt = now;
await mkdir(new URL('../public/data/', import.meta.url), { recursive: true });
const temp = fileURLToPath(target) + '.tmp';
await writeFile(temp, JSON.stringify(snapshot, null, 2) + '\n');
await rename(temp, target);
if (!successes) process.exitCode = 1;
