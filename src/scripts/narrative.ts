import { isReducedMotion, onReducedMotionChange } from './motion';

const SERIES_ORDER = ['cuba', 'miami', 'sf', 'roma', 'espana', 'none'] as const;

type LenisModule = typeof import('./lenis');

let lenisModule: LenisModule | null = null;
let desktopFine: MediaQueryList | null = null;
let active = false;

let root: HTMLElement | null = null;
let toggle: HTMLButtonElement | null = null;
let grid: HTMLElement | null = null;
let travesia: HTMLElement | null = null;
let filters: HTMLElement | null = null;
let empty: HTMLElement | null = null;
let labels: Record<string, string> = {};
let originalOrder: HTMLElement[] = [];

function canUseLenis(): boolean {
  return !!desktopFine && desktopFine.matches && !isReducedMotion();
}

async function startLenisIfEligible(): Promise<void> {
  if (!active || !canUseLenis()) return;
  if (!lenisModule) lenisModule = await import('./lenis');
  lenisModule.startLenis();
}

function stopLenis(): void {
  lenisModule?.stopLenis();
}

function buildGroups(): void {
  if (!grid || !travesia) return;
  travesia.textContent = '';

  for (const series of SERIES_ORDER) {
    const cards = originalOrder.filter((card) => card.dataset.series === series);
    if (cards.length === 0) continue;

    const section = document.createElement('section');
    section.className = 'travesia__group';

    const heading = document.createElement('h2');
    heading.className = 'travesia__title';
    heading.textContent = labels[series] ?? series;
    section.appendChild(heading);

    const list = document.createElement('ul');
    list.className = 'travesia__grid';
    for (const card of cards) {
      card.hidden = false;
      list.appendChild(card);
    }
    section.appendChild(list);
    travesia.appendChild(section);
  }
}

function restoreGrid(): void {
  if (!grid) return;
  for (const card of originalOrder) {
    card.hidden = false;
    grid.appendChild(card);
  }
  if (travesia) travesia.textContent = '';
}

function setActive(next: boolean, updateUrl = true): void {
  if (next === active) return;
  active = next;

  if (active) {
    buildGroups();
    if (grid) grid.hidden = true;
    if (travesia) travesia.hidden = false;
    if (filters) filters.hidden = true;
    if (empty) empty.hidden = true;
    document.documentElement.setAttribute('data-narrative', '');
    void startLenisIfEligible();
  } else {
    stopLenis();
    restoreGrid();
    if (travesia) travesia.hidden = true;
    if (grid) grid.hidden = false;
    if (filters) filters.hidden = false;
    document.documentElement.removeAttribute('data-narrative');
  }

  if (toggle) {
    toggle.setAttribute('aria-pressed', String(active));
    toggle.textContent = active ? labels.toCatalog : labels.toNarrative;
  }

  if (updateUrl) {
    const url = new URL(window.location.href);
    if (active) url.searchParams.set('view', 'narrative');
    else url.searchParams.delete('view');
    window.history.replaceState(null, '', url.pathname + url.search);
  }
}

function teardown(): void {
  stopLenis();
  document.documentElement.removeAttribute('data-narrative');
  active = false;
  root = toggle = grid = travesia = filters = empty = null;
  originalOrder = [];
}

function init(): void {
  root = document.querySelector<HTMLElement>('[data-works]');
  if (!root) return;

  toggle = root.querySelector<HTMLButtonElement>('[data-narrative-toggle]');
  grid = root.querySelector<HTMLElement>('[data-grid]');
  travesia = root.querySelector<HTMLElement>('[data-travesia]');
  filters = root.querySelector<HTMLElement>('.filters');
  empty = root.querySelector<HTMLElement>('[data-filter-empty]');
  if (!toggle || !grid || !travesia) return;

  try {
    labels = JSON.parse(toggle.dataset.labels ?? '{}');
  } catch {
    labels = {};
  }

  originalOrder = Array.from(grid.querySelectorAll<HTMLElement>('[data-work]'));
  active = false;

  toggle.hidden = false;
  toggle.setAttribute('aria-pressed', 'false');
  toggle.textContent = labels.toNarrative;
  toggle.addEventListener('click', () => setActive(!active));

  const params = new URLSearchParams(window.location.search);
  if (params.get('view') === 'narrative') {
    setActive(true, false);
  }
}

export function initNarrative(): void {
  if (typeof window === 'undefined') return;

  desktopFine = window.matchMedia('(pointer: fine) and (min-width: 1024px)');
  desktopFine.addEventListener('change', () => {
    if (!active) return;
    if (canUseLenis()) void startLenisIfEligible();
    else stopLenis();
  });
  onReducedMotionChange(() => {
    if (!active) return;
    if (canUseLenis()) void startLenisIfEligible();
    else stopLenis();
  });

  document.addEventListener('astro:page-load', init);
  document.addEventListener('astro:before-swap', teardown);
  init();
}
