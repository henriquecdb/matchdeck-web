import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { units } from '../src/features/units/catalog.ts';

const sources = {
  aoe2: {
    repo: 'denniske/aoe2companion',
    revision: '797538c97f3cd957bf700b23b90cdaf808e4fa80',
    directory: 'assets/units',
  },
  aoe4: {
    repo: 'aoe4world/data',
    revision: 'e89f01e598998bf76bdddfbf2afce1659fee00cf',
    directory: 'images/units',
  },
  sc2: {
    repo: 'BurnySc2/sc2-planner',
    revision: '96fb45afef85c558b84cd1753dac5f2ece57dc0a',
    directory: 'src/icons/png',
  },
};
const aoe2 = {
  archer: 'Archer',
  skirmisher: 'Skirmisher',
  spear: 'Spearman',
  militia: 'Militia',
  scout: 'ScoutCavalry',
  knight: 'Knight',
  camel: 'CamelRider',
  'cav-archer': 'CavalryArcher',
  eagle: 'EagleWarrior',
  mangonel: 'Mangonel',
  scorpion: 'Scorpion',
  ram: 'BatteringRam',
  trebuchet: 'Trebuchet',
  bombard: 'BombardCannon',
  'hand-cannon': 'HandCannoneer',
  monk: 'Monk',
  huskarl: 'Huskarl',
  mangudai: 'Mangudai',
  elephant: 'BattleElephant',
};
const aoe4 = {
  spear: 'spearman-1',
  archer: 'archer-2',
  horseman: 'horseman-2',
  maa: 'man-at-arms-3',
  crossbow: 'crossbowman-3',
  knight: 'knight-3',
  'hand-cannon': 'handcannoneer-4',
  mangonel: 'mangonel-3',
  ram: 'battering-ram-2',
  trebuchet: 'counterweight-trebuchet-3',
  bombard: 'bombard-4',
  monk: 'monk-3',
  longbow: 'longbowman-2',
  camel: 'camel-rider-3',
};
const sc2 = {
  tank: 'siegetank',
  mine: 'widowmine',
  viking: 'vikingfighter',
  prism: 'warpprism',
  'void-ray': 'warpray',
  hydra: 'hydralisk',
  ultra: 'ultralisk',
};
const target = new URL('../public/unit-guide/', import.meta.url);
const pending = [...units];
const files = [];
async function worker() {
  while (pending.length) {
    const unit = pending.shift();
    const source = sources[unit.game];
    const stem =
      unit.game === 'aoe2'
        ? aoe2[unit.id]
        : unit.game === 'aoe4'
          ? aoe4[unit.id]
          : `btn-unit-${unit.faction.toLowerCase()}-${sc2[unit.id] ?? unit.id.replaceAll('-', '')}`;
    if (!stem)
      throw new Error(`Missing artwork mapping: ${unit.game}:${unit.id}`);
    const sourcePath = `${source.directory}/${stem}.png`;
    const response = await fetch(
      `https://raw.githubusercontent.com/${source.repo}/${source.revision}/${sourcePath}`,
      { signal: AbortSignal.timeout(30000) },
    );
    if (!response.ok) throw new Error(`${response.status}: ${sourcePath}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a')
      throw new Error(`Not a PNG: ${sourcePath}`);
    await mkdir(new URL(`${unit.game}/`, target), { recursive: true });
    const path = `${unit.game}/${unit.id}.png`;
    await writeFile(new URL(path, target), bytes);
    files.push({
      game: unit.game,
      id: unit.id,
      path,
      sourcePath,
      sha256: createHash('sha256').update(bytes).digest('hex'),
    });
  }
}
await Promise.all(Array.from({ length: 4 }, worker));
files.sort((a, b) => a.path.localeCompare(b.path));
await writeFile(
  new URL('provenance.json', target),
  JSON.stringify({ sources, files }, null, 2) + '\n',
);
console.log(`Synced ${files.length} original unit portraits.`);
