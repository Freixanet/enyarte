import { from, isReducedMotion } from './motion';

const STATIC_WORK_SELECTORS =
  '.work__media, .work__back, .work__title, .work__meta, .work__commerce, .trust-block';

function isExcluded(element: Element): boolean {
  return element.closest(STATIC_WORK_SELECTORS) !== null;
}

function getEnterElements(): HTMLElement[] {
  const candidates = document.querySelectorAll<HTMLElement>(
    '[data-enter], .page__heading, .page__intro, .work-card__caption',
  );

  return Array.from(candidates).filter((element) => !isExcluded(element));
}

async function runPageEnter(): Promise<void> {
  const elements = getEnterElements();
  if (elements.length === 0) return;

  if (isReducedMotion()) {
    await from(elements, { opacity: 0 }, { duration: 0.3, ease: 'fn' });
    return;
  }

  await from(elements, { opacity: 0, y: 16 }, { duration: 0.45, ease: 'fn', stagger: 0.06 });
}

export function initPageEnter(): void {
  document.addEventListener('astro:page-load', () => {
    void runPageEnter();
  });
}
