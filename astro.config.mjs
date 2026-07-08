// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Keystatic (F6) es una herramienta SOLO de edición local: se activa únicamente
// en `astro dev`. En `astro build` NO se carga, así producción sigue 100%
// estática (output: 'static'), sin adapter de servidor y sin peso extra en dist/.
const isDev = process.argv.includes('dev');

const integrations = [sitemap()];

if (isDev) {
  const [{ default: react }, { default: keystatic }] = await Promise.all([
    import('@astrojs/react'),
    import('@keystatic/astro'),
  ]);
  integrations.push(react(), keystatic());
}

// https://astro.build/config
export default defineConfig({
  output: 'static',
  site: 'https://enyarte.com',
  integrations,
});
