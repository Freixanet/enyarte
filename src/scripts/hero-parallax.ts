import { isReducedMotion, onReducedMotionChange } from './motion';

const MAX_PX = 6;

let raf = 0;
let target: HTMLElement | null = null;
let mql: MediaQueryList | null = null;

function render(): void {
  raf = 0;
  if (!target) return;
  const rect = target.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  const centerOffset = rect.top + rect.height / 2 - vh / 2;
  const progress = Math.max(-1, Math.min(1, centerOffset / vh));
  const y = (-progress * MAX_PX).toFixed(2);
  target.style.transform = `translate3d(0, ${y}px, 0)`;
}

function onScroll(): void {
  if (raf) return;
  raf = requestAnimationFrame(render);
}

function enable(): void {
  if (target) return;
  const el = document.querySelector<HTMLElement>('[data-hero-parallax]');
  if (!el) return;
  target = el;
  window.addEventListener('scroll', onScroll, { passive: true });
  render();
}

function disable(): void {
  if (raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  window.removeEventListener('scroll', onScroll);
  if (target) {
    target.style.transform = '';
    target = null;
  }
}

function evaluate(): void {
  if (mql?.matches && !isReducedMotion()) {
    enable();
  } else {
    disable();
  }
}

export function initHeroParallax(): void {
  if (typeof window === 'undefined') return;

  mql = window.matchMedia('(pointer: fine) and (min-width: 1024px)');
  mql.addEventListener('change', evaluate);
  onReducedMotionChange(evaluate);

  const setup = (): void => {
    disable();
    evaluate();
  };

  document.addEventListener('astro:page-load', setup);
  document.addEventListener('astro:before-swap', disable);
  setup();
}
