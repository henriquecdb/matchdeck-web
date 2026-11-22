import { games, units } from './catalog';
import { readSelection, searchUnits, type GameId } from './model';

const root = document.querySelector<HTMLElement>('#unit-guide')!;
const search = root.querySelector<HTMLInputElement>('#unit-search')!;
const category = root.querySelector<HTMLSelectElement>('#unit-category')!;
const race = root.querySelector<HTMLSelectElement>('#unit-race')!;
const tabs = [...root.querySelectorAll<HTMLButtonElement>('[data-unit-game]')];
const panels = [...root.querySelectorAll<HTMLElement>('[data-unit-panel]')];
const rows = [...root.querySelectorAll<HTMLElement>('[data-unit-row]')];
let state = readSelection(location.search, units);

function selectionUrl(game: GameId, id: string) {
  const url = new URL(location.href);
  url.search = '';
  url.searchParams.set('jogo', game);
  url.searchParams.set('unidade', id);
  if (game === 'sc2' && race.value !== 'all')
    url.searchParams.set('raca', race.value);
  url.hash = '';
  return url;
}

function render(historyMode: 'push' | 'replace' | 'none' = 'replace') {
  const results = searchUnits(units, state.game, search.value, category.value);
  if (results.length && !results.includes(state.unit)) state.unit = results[0];
  const selectedKey = results.length ? `${state.game}:${state.unit.id}` : null;
  const keys = new Set(results.map((unit) => `${unit.game}:${unit.id}`));
  for (const row of rows) {
    const key = row.dataset.unitRow!;
    row.hidden = !keys.has(key);
    row
      .querySelector('button')!
      .setAttribute('aria-pressed', String(key === selectedKey));
  }
  for (const panel of panels) {
    panel.hidden = panel.dataset.unitPanel !== selectedKey;
    if (panel.hidden) continue;
    let visible = 0;
    for (const counter of panel.querySelectorAll<HTMLElement>(
      '[data-counter-faction]',
    )) {
      counter.hidden =
        state.game === 'sc2' &&
        race.value !== 'all' &&
        counter.dataset.counterFaction !== race.value;
      if (!counter.hidden) visible++;
    }
    panel.querySelector<HTMLElement>('.unit-no-counter')!.hidden = visible > 0;
    panel.querySelector<HTMLAnchorElement>('.unit-permalink')!.href =
      selectionUrl(state.game, state.unit.id).href;
    for (const link of panel.querySelectorAll<HTMLAnchorElement>(
      '[data-unit-link]',
    )) {
      const targetId = new URL(link.href).searchParams.get('unidade')!;
      link.href = selectionUrl(state.game, targetId).href;
    }
  }
  for (const tab of tabs) {
    const active = tab.dataset.unitGame === state.game;
    tab.setAttribute('aria-selected', String(active));
    tab.tabIndex = active ? 0 : -1;
  }
  for (const source of root.querySelectorAll<HTMLElement>(
    '[data-unit-sources]',
  ))
    source.hidden = source.dataset.unitSources !== state.game;
  for (const option of category.options)
    option.hidden =
      option.value !== 'all' &&
      !units.some(
        (unit) => unit.game === state.game && unit.category === option.value,
      );
  root.querySelector<HTMLElement>('#unit-race-control')!.hidden =
    state.game !== 'sc2';
  root.querySelector<HTMLElement>('#unit-scope')!.textContent =
    games[state.game].scope;
  root.querySelector<HTMLElement>('#unit-count')!.textContent =
    `${results.length} ${results.length === 1 ? 'unidade' : 'unidades'}`;
  root.querySelector<HTMLElement>('#unit-empty')!.hidden = results.length > 0;
  root.querySelector<HTMLElement>('#unit-no-selection')!.hidden =
    results.length > 0;
  if (historyMode !== 'none' && selectedKey) {
    const url = selectionUrl(state.game, state.unit.id);
    if (url.href !== location.href) {
      if (historyMode === 'push') history.pushState(null, '', url);
      else history.replaceState(null, '', url);
    }
  }
}

function clearFilters() {
  search.value = '';
  category.value = 'all';
}
for (const tab of tabs) {
  tab.addEventListener('click', () => {
    state.game = tab.dataset.unitGame as GameId;
    state.unit = units.find((unit) => unit.game === state.game)!;
    clearFilters();
    render('push');
  });
  tab.addEventListener('keydown', (event) => {
    const index = tabs.indexOf(tab);
    const next =
      event.key === 'ArrowRight'
        ? (index + 1) % tabs.length
        : event.key === 'ArrowLeft'
          ? (index + tabs.length - 1) % tabs.length
          : event.key === 'Home'
            ? 0
            : event.key === 'End'
              ? tabs.length - 1
              : -1;
    if (next < 0) return;
    event.preventDefault();
    tabs[next].click();
    tabs[next].focus();
  });
}
root.addEventListener('click', (event) => {
  const target = event.target as Element;
  const button = target.closest<HTMLButtonElement>('[data-unit-select]');
  const anchor = target.closest<HTMLAnchorElement>('a[data-unit-link]');
  if (!button && !anchor) return;
  if (
    anchor &&
    (event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0)
  )
    return;
  const [game, id] = button
    ? button.dataset.unitSelect!.split(':')
    : [
        new URL(anchor!.href).searchParams.get('jogo'),
        new URL(anchor!.href).searchParams.get('unidade'),
      ];
  const unit = units.find((unit) => unit.game === game && unit.id === id);
  if (!unit) return;
  event.preventDefault();
  state.game = unit.game;
  state.unit = unit;
  if (anchor) clearFilters();
  render('push');
  // On small screens the selected unit is below the directory.
  const panel = root.querySelector<HTMLElement>(
    `#unit-${unit.game}-${unit.id}`,
  )!;
  panel.tabIndex = -1;
  panel.focus({ preventScroll: true });
  if (matchMedia('(max-width: 760px)').matches || anchor)
    panel.scrollIntoView({ block: 'start', behavior: 'instant' });
});
search.addEventListener('input', () => render());
category.addEventListener('change', () => render());
race.addEventListener('change', () => render());
root.querySelector('#unit-reset')!.addEventListener('click', () => {
  clearFilters();
  render();
  search.focus();
});
window.addEventListener('popstate', () => {
  state = readSelection(location.search, units);
  race.value = state.faction;
  clearFilters();
  render('none');
});
race.value = state.faction;
render('none');
root.querySelector<HTMLElement>('.unit-controls')!.hidden = false;
root.querySelector<HTMLElement>('.unit-directory')!.hidden = false;
root.classList.add('is-enhanced');
