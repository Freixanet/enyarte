import Lenis from 'lenis';

let instance: Lenis | null = null;
let raf = 0;

export function startLenis(): void {
  if (instance) return;

  instance = new Lenis({
    duration: 1.1,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  const loop = (time: number): void => {
    instance?.raf(time);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  document.documentElement.classList.add('lenis');
}

export function stopLenis(): void {
  if (raf) {
    cancelAnimationFrame(raf);
    raf = 0;
  }
  instance?.destroy();
  instance = null;
  document.documentElement.classList.remove('lenis', 'lenis-smooth');
}
