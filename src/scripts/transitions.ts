import { animate, isReducedMotion } from './motion';

const WORKS_GRID = /^(\/en\/works\/?|\/obras\/?)$/;
const WORKS_DETAIL = /^(\/en\/works\/[^/]+\/?|\/obras\/[^/]+\/?)$/;

function isWorksPair(fromPath: string, toPath: string): boolean {
  return (
    (WORKS_GRID.test(fromPath) && WORKS_DETAIL.test(toPath)) ||
    (WORKS_DETAIL.test(fromPath) && WORKS_GRID.test(toPath))
  );
}

function pageDuration(): number {
  return window.matchMedia('(min-width: 1024px)').matches ? 0.65 : 0.4;
}

function resetEmerger(line: HTMLElement): void {
  line.hidden = true;
  line.style.opacity = '';
  line.style.transform = '';
}

async function runEmerger(line: HTMLElement, viewTransition?: ViewTransition): Promise<void> {
  line.hidden = false;
  line.style.opacity = '1';
  line.style.transform = 'translateY(100vh)';

  await animate(line, { y: '0vh' }, { duration: pageDuration(), ease: 'poetic' });

  if (viewTransition) {
    viewTransition.finished.finally(() => resetEmerger(line));
  } else {
    resetEmerger(line);
  }
}

export function initTransitions(): void {
  document.addEventListener('astro:before-preparation', (event) => {
    if (isReducedMotion()) return;

    const navigation = event as CustomEvent & {
      from?: URL;
      to?: URL;
      viewTransition?: ViewTransition;
    };

    const fromPath = navigation.from?.pathname ?? '';
    const toPath = navigation.to?.pathname ?? '';
    if (!isWorksPair(fromPath, toPath)) return;

    const line = document.getElementById('emerger-line');
    if (!(line instanceof HTMLElement)) return;

    void runEmerger(line, navigation.viewTransition);
  });
}
