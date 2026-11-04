import {
  freshness,
  rankRows,
  type StatsSnapshot,
  type CivilizationStats,
} from './model';
const snapshot: StatsSnapshot = JSON.parse(
  document.querySelector('#statistics-data')!.textContent!,
);
const params = new URLSearchParams(location.search);
let game: 'aoe2' | 'aoe4' = params.get('jogo') === 'aoe4' ? 'aoe4' : 'aoe2';
const band = document.querySelector<HTMLSelectElement>('#stats-band')!;
const search = document.querySelector<HTMLInputElement>('#stats-search')!;
const minimum = document.querySelector<HTMLSelectElement>('#stats-minimum')!;
const tbody = document.querySelector<HTMLTableSectionElement>('#ranking-body')!;
const selectors = [0, 1].map((i) =>
  document.querySelector<HTMLSelectElement>(`#compare-${i}`)!,
);
const tabs = [...document.querySelectorAll<HTMLButtonElement>('[data-game]')];
const number = new Intl.NumberFormat('pt-BR');
const percent = (value: number) =>
  value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + '%';
const date = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(value));
let sort = 'winRate';
let ascending = false;
function text(id: string, value: string) {
  document.getElementById(id)!.textContent = value;
}
function element(tag: string, value?: string, className?: string) {
  const el = document.createElement(tag);
  if (value !== undefined) el.textContent = value;
  if (className) el.className = className;
  return el;
}
function currentView() {
  return (
    snapshot.games[game].views.find((view) => view.id === band.value) ||
    snapshot.games[game].views[0]
  );
}
function populateBands(selected = 'all') {
  band.replaceChildren(
    ...snapshot.games[game].views.map(
      (view) => new Option(view.label, view.id),
    ),
  );
  band.value = snapshot.games[game].views.some((view) => view.id === selected)
    ? selected
    : 'all';
}
function renderCompare() {
  const view = currentView();
  selectors.forEach((select, index) => {
    const row = view.rows.find((item) => item.id === select.value);
    const target = document.getElementById(`compare-values-${index}`)!;
    if (!row) {
      target.textContent = 'Sem dados neste recorte.';
      return;
    }
    target.replaceChildren(
      element('strong', percent(row.winRate)),
      element('p', `${number.format(row.games)} participações`),
      element(
        'span',
        `${number.format(row.wins)} V · ${number.format(row.losses)} D`,
      ),
    );
  });
}
function populateCompare() {
  const ordered = rankRows(currentView().rows, '', 0);
  selectors.forEach((select, index) => {
    const previous = select.value;
    select.replaceChildren(
      ...ordered.map((row) => new Option(row.name || row.id, row.id)),
    );
    select.value = ordered.some((row) => row.id === previous)
      ? previous
      : ordered[Math.min(index, ordered.length - 1)].id;
  });
  renderCompare();
}
function renderRow(row: CivilizationStats, index: number, total: number) {
  const tr = document.createElement('tr');
  tr.append(element('td', String(index + 1), 'rank-number'));
  const heading = document.createElement('th');
  heading.scope = 'row';
  const name = element('span', undefined, 'civ-name');
  if (row.icon) {
    const img = document.createElement('img');
    img.src = row.icon;
    img.alt = '';
    img.width = 28;
    img.height = 28;
    img.loading = 'lazy';
    name.append(img);
  }
  name.append(document.createTextNode(row.name || row.id));
  heading.append(name);
  if (row.games < 100)
    heading.append(element('small', 'Amostra pequena', 'small-sample'));
  tr.append(heading);
  const rate = document.createElement('td');
  rate.append(
    element(
      'span',
      percent(row.winRate),
      `rate-value ${row.winRate >= 50 ? 'positive' : 'negative'}`,
    ),
  );
  const track = element('span', undefined, 'rate-track');
  const fill = element('span');
  fill.style.width = `${row.winRate}%`;
  track.append(fill);
  rate.append(track);
  tr.append(rate);
  tr.append(
    element('td', number.format(row.games)),
    element('td', number.format(row.wins), 'positive'),
    element('td', number.format(row.losses), 'negative'),
    element('td', percent(total ? (100 * row.games) / total : 0)),
  );
  return tr;
}
function render() {
  const data = snapshot.games[game];
  const view = currentView();
  const filtered = rankRows(
    view.rows,
    search.value,
    Number(minimum.value),
    sort,
    ascending,
  );
  const total = view.rows.reduce((sum, row) => sum + row.games, 0);
  tbody.replaceChildren(
    ...filtered.map((row, index) => renderRow(row, index, total)),
  );
  document.getElementById('empty-ranking')!.hidden = filtered.length > 0;
  const best = rankRows(view.rows, '', Number(minimum.value))[0];
  const popular = [...view.rows].sort((a, b) => b.games - a.games)[0];
  text('kpi-best', best?.name || 'Sem amostra suficiente');
  text(
    'kpi-best-value',
    best
      ? `${percent(best.winRate)} · ${number.format(best.games)} participações`
      : 'Reduza a amostra mínima',
  );
  text('kpi-popular', popular.name || popular.id);
  text(
    'kpi-popular-value',
    `${percent(total ? (100 * popular.games) / total : 0)} das participações`,
  );
  text('kpi-sample', number.format(total));
  text('kpi-civs', `participações · ${view.rows.length} civilizações`);
  const labels: Record<string, string> = {
    winRate: 'winrate',
    games: 'partidas',
    wins: 'vitórias',
    losses: 'derrotas',
    name: 'civilização',
  };
  text(
    'ranking-status',
    `${filtered.length} de ${view.rows.length} civilizações · ${labels[sort]} ${ascending ? 'crescente' : 'decrescente'}`,
  );
  document.querySelectorAll<HTMLElement>('th[data-sort]').forEach((th) => {
    const active = th.dataset.sort === sort;
    if (active)
      th.setAttribute('aria-sort', ascending ? 'ascending' : 'descending');
    else th.removeAttribute('aria-sort');
    const button = th.querySelector('button')!;
    const titles: Record<string, string> = {
      winRate: 'Winrate',
      games: 'Partidas',
      wins: 'Vitórias',
      losses: 'Derrotas',
      name: 'Civilização',
    };
    button.textContent =
      titles[th.dataset.sort!] + (active ? (ascending ? ' ↑' : ' ↓') : '');
  });
  tabs.forEach((tab) => {
    const selected = tab.dataset.game === game;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  document
    .getElementById('ranking-panel')!
    .setAttribute('aria-labelledby', `tab-${game}`);
  text('band-label', game === 'aoe2' ? 'Faixa de Elo' : 'Liga da fonte');
  const warning = [freshness(data), data.fetchError || '']
    .filter(Boolean)
    .join(' ');
  text('data-warning', warning);
  document.getElementById('data-warning')!.hidden = !warning;
  const source = document.getElementById('stats-source') as HTMLAnchorElement;
  source.href = data.sourceUrl;
  source.textContent = data.sourceName + ' ↗';
  text('stats-patch', data.patch);
  text('stats-period', data.periodStart || 'Não informado');
  text(
    'stats-generated',
    data.sourceUpdatedAt
      ? date(data.sourceUpdatedAt) + ' · Brasília'
      : 'Data não informada pela API',
  );
  text('stats-fetched', date(data.fetchedAt) + ' · Brasília');
  const notes = [...data.notes];
  if (data.unmappedIds.length)
    notes.push(
      `IDs sem civilização mapeada na fonte: ${data.unmappedIds.join(', ')}.`,
    );
  document
    .getElementById('stats-notes')!
    .replaceChildren(...notes.map((note) => element('li', note)));
  (document.getElementById('stats-endpoint') as HTMLAnchorElement).href =
    data.endpoint;
  const url = new URL(location.href);
  url.searchParams.set('jogo', game);
  url.searchParams.set('faixa', view.id);
  if (search.value) url.searchParams.set('busca', search.value);
  else url.searchParams.delete('busca');
  url.searchParams.set('min', minimum.value);
  history.replaceState(null, '', url);
}
tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => {
    game = tab.dataset.game as typeof game;
    populateBands();
    search.value = '';
    populateCompare();
    render();
  });
  tab.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) %
            tabs.length;
    tabs[next].click();
    tabs[next].focus();
  });
});
document.querySelectorAll<HTMLElement>('th[data-sort]').forEach((th) =>
  th.querySelector('button')!.addEventListener('click', () => {
    const next = th.dataset.sort!;
    ascending = next === sort ? !ascending : next === 'name';
    sort = next;
    render();
  }),
);
band.addEventListener('change', () => {
  populateCompare();
  render();
});
search.addEventListener('input', render);
minimum.addEventListener('change', render);
selectors.forEach((select) => select.addEventListener('change', renderCompare));
populateBands(params.get('faixa') || 'all');
search.value = params.get('busca') || '';
minimum.value = ['0', '100', '1000', '10000'].includes(params.get('min') || '')
  ? params.get('min')!
  : '100';
populateCompare();
render();
