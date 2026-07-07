export type MotionEase = 'fn' | 'poetic';

export type MotionVars = {
  opacity?: number;
  x?: number | string;
  y?: number | string;
  scale?: number;
  rotate?: number;
};

export type MotionOpts = {
  duration?: number;
  ease?: MotionEase;
  delay?: number;
  stagger?: number;
};

type MotionTarget = string | Element | Element[] | NodeListOf<Element>;

let reduced = false;
let gsapInstance: Awaited<ReturnType<typeof loadGsapModule>> | null = null;
const reducedListeners = new Set<(value: boolean) => void>();

const EASE_FN = 'cubic-bezier(0.16, 1, 0.3, 1)';
const EASE_POETIC = 'cubic-bezier(0.65, 0, 0.15, 1)';
const REDUCED_MS = 300;

function syncReducedAttr(): void {
  document.documentElement.toggleAttribute('data-reduced-motion', reduced);
}

function resolveEase(ease: MotionEase = 'fn'): string {
  return ease === 'poetic' ? EASE_POETIC : EASE_FN;
}

function toElements(target: MotionTarget): HTMLElement[] {
  if (typeof target === 'string') {
    return Array.from(document.querySelectorAll<HTMLElement>(target));
  }
  if (target instanceof Element) {
    return [target as HTMLElement];
  }
  if (target instanceof NodeList || Array.isArray(target)) {
    return Array.from(target as Iterable<Element>).filter(
      (node): node is HTMLElement => node instanceof HTMLElement,
    );
  }
  return [];
}

async function loadGsapModule() {
  const module = await import('./gsap');
  return module.gsap;
}

async function loadGsap() {
  if (!gsapInstance) {
    gsapInstance = await loadGsapModule();
  }
  return gsapInstance;
}

function runReducedFade(
  elements: HTMLElement[],
  fromOpacity: number,
  toOpacity: number,
): Promise<void[]> {
  return Promise.all(
    elements.map((element) => {
      element.style.opacity = String(fromOpacity);
      const animation = element.animate(
        [{ opacity: fromOpacity }, { opacity: toOpacity }],
        { duration: REDUCED_MS, easing: 'linear', fill: 'forwards' },
      );
      return animation.finished.then(() => {
        element.style.opacity = String(toOpacity);
      });
    }),
  );
}

export function initMotion(): void {
  if (typeof window === 'undefined') return;

  const media = window.matchMedia('(prefers-reduced-motion: reduce)');
  reduced = media.matches;
  syncReducedAttr();

  media.addEventListener('change', (event) => {
    reduced = event.matches;
    syncReducedAttr();
    reducedListeners.forEach((listener) => listener(reduced));
  });
}

export function isReducedMotion(): boolean {
  return reduced;
}

export function onReducedMotionChange(listener: (value: boolean) => void): () => void {
  reducedListeners.add(listener);
  return () => reducedListeners.delete(listener);
}

export function set(target: MotionTarget, vars: MotionVars): void {
  const elements = toElements(target);
  elements.forEach((element) => {
    if (vars.opacity !== undefined) element.style.opacity = String(vars.opacity);
    if (vars.y !== undefined) {
      element.style.transform = `translateY(${typeof vars.y === 'number' ? `${vars.y}px` : vars.y})`;
    }
  });
}

export async function animate(
  target: MotionTarget,
  vars: MotionVars,
  opts: MotionOpts = {},
): Promise<void> {
  const elements = toElements(target);
  if (elements.length === 0) return;

  if (reduced) {
    const toOpacity = vars.opacity ?? 1;
    const fromOpacity = Number(getComputedStyle(elements[0]).opacity) || 1;
    await runReducedFade(elements, fromOpacity, toOpacity);
    return;
  }

  const gsap = await loadGsap();
  await gsap.to(target, {
    ...vars,
    duration: opts.duration ?? 0.45,
    ease: resolveEase(opts.ease),
    delay: opts.delay ?? 0,
    stagger: opts.stagger,
  });
}

export async function from(
  target: MotionTarget,
  vars: MotionVars,
  opts: MotionOpts = {},
): Promise<void> {
  const elements = toElements(target);
  if (elements.length === 0) return;

  const fromOpacity = vars.opacity ?? 0;

  elements.forEach((element) => {
    element.style.opacity = String(fromOpacity);
  });

  if (reduced) {
    await runReducedFade(elements, fromOpacity, 1);
    return;
  }

  const gsap = await loadGsap();
  await gsap.from(target, {
    ...vars,
    duration: opts.duration ?? 0.45,
    ease: resolveEase(opts.ease),
    delay: opts.delay ?? 0,
    stagger: opts.stagger,
    immediateRender: true,
  });
}
