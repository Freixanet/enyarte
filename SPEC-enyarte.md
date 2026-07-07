# SPEC — enyarte.com v1
## Documento de contexto de proyecto. Pégalo íntegro como contexto raíz del agente (Cursor rules / AGENTS.md / GEMINI.md). Toda instrucción aquí PREVALECE sobre el criterio del agente.

---

## 0. REGLAS PARA EL AGENTE (leer primero, obedecer siempre)

1. NO improvises decisiones de diseño, arquitectura, color, tipografía o motion. Todas están cerradas en este documento. Si algo no está especificado, PREGUNTA antes de implementar. No rellenes huecos con tu criterio.
2. NO añadas dependencias fuera de la lista del §2. Ni una. Si crees que falta una, propón y espera aprobación.
3. NO uses React, Vue, Svelte, Tailwind, ni ningún framework de UI. Este proyecto es Astro + CSS vanilla + JS vanilla + GSAP. Punto.
4. Trabaja SOLO en la fase que se te indique (§9). No adelantes trabajo de fases futuras. No refactorices código de fases ya aprobadas salvo instrucción explícita.
5. Cada fase termina con sus criterios de aceptación (§9) cumplidos y verificables. Si no puedes verificar uno, dilo; no lo marques como hecho.
6. PROHIBIDO: distorsionar, filtrar, recolorear o animar los píxeles de las imágenes de obras (ver §6.3). PROHIBIDO scroll-jacking en móvil. PROHIBIDO preloader. PROHIBIDO localStorage/sessionStorage para estado crítico.
7. Todo texto visible al usuario sale de los ficheros de contenido i18n (§5.3), nunca hardcodeado en componentes.
8. Código sin comentarios salvo lógica no obvia. Sin placeholders tipo TODO. Si no puedes completar algo, dilo en el mensaje, no en el código.
9. Antes de escribir código en cada fase: lista los ficheros que vas a crear/modificar y espera OK si la lista supera 6 ficheros.
10. Si un test o build falla, arregla la causa raíz. Prohibido silenciar errores, borrar tests o envolver en try/catch vacío.

---

## 1. PROYECTO

Web de la artista Enya Fontanills (pintora surrealista contemporánea e instalacionista). Objetivos por orden: (1) vender obra original (rango 500–3.000€, precio visible), (2) captar encargos privados (secundario), (3) visibilidad ante galerías/prensa, (4) nivel de craft Awwwards SOTD sin robar protagonismo a la obra.

Concepto: "El agua que separa y une". Dos modos visuales: **Catálogo** (fondo hueso, comercial, default) y **Narrativa** (fondo azul profundo, travesía migratoria Cuba→Miami→San Francisco→Roma→España, toggle opcional). La transición entre modos es la metáfora "emerger".

Bilingüe ES/EN. Tráfico mayoritario: móvil desde Instagram. Mercado: eje Miami–España.

---

## 2. STACK (cerrado)

- **Astro 5.x** (SSG estricto, `output: 'static'`). Sin SSR, sin adapters de servidor.
- **GSAP 3.13+** (core + ScrollTrigger + Flip). Registrar plugins una sola vez en un módulo `src/scripts/gsap.ts`.
- **Lenis 1.x** — SOLO desktop (ver §7). 
- **Keystatic** (modo local, colección markdown) para gestión de obras — se integra en Fase 6, no antes.
- **@fontsource-variable/fraunces** y **@fontsource-variable/inter** (self-hosted, nunca Google Fonts CDN).
- **sharp** vía `astro:assets` para pipeline de imágenes (incluido en Astro).
- TypeScript estricto (`"strict": true`).
- Deploy: **Cloudflare Pages** (build command `npm run build`, output `dist/`).
- Nada más. Ni three.js, ni lodash, ni librerías de cursor/preloader/smooth-scroll adicionales, ni CSS frameworks, ni analytics de terceros con cookies (más adelante: Cloudflare Web Analytics, script único, sin cookies).

## 2.1 Estructura de repo (crear exactamente así en Fase 0)

```
/
├── astro.config.mjs
├── tsconfig.json
├── package.json
├── public/
│   ├── fonts/            (solo si fontsource no cubre; por defecto vacío)
│   └── favicon.svg
├── src/
│   ├── styles/
│   │   ├── tokens.css        (§4 — design tokens, único lugar con valores crudos)
│   │   ├── reset.css
│   │   ├── global.css
│   │   └── motion.css        (clases de transición + reduced-motion)
│   ├── content/
│   │   ├── config.ts         (schema zod de colecciones, §5)
│   │   └── works/            (1 fichero .md por obra)
│   ├── i18n/
│   │   ├── es.json
│   │   └── en.json
│   ├── layouts/
│   │   └── Base.astro        (head, SEO, og, schema.org, nav, footer)
│   ├── components/
│   │   ├── Nav.astro
│   │   ├── Footer.astro
│   │   ├── WorkCard.astro
│   │   ├── WorkFilters.astro
│   │   ├── TrustBlock.astro
│   │   ├── CtaButton.astro
│   │   ├── ScaleVisualizer.astro
│   │   ├── LangSwitch.astro
│   │   └── GlassFracture.astro   (interacción firma, Fase 5)
│   ├── scripts/
│   │   ├── gsap.ts
│   │   ├── lenis.ts          (init condicionado a desktop)
│   │   └── motion.ts         (helpers: respeta reduced-motion SIEMPRE)
│   └── pages/
│       ├── index.astro                  → también /en/
│       ├── obras/index.astro            → /en/works/
│       ├── obras/[slug].astro           → /en/works/[slug]
│       ├── encargos.astro               → /en/commissions
│       ├── about.astro                  → /en/about
│       ├── exposiciones.astro           → /en/exhibitions
│       ├── prensa.astro                 → /en/press
│       ├── contacto.astro               → /en/contact
│       ├── faq-compra.astro             → /en/purchase-faq
│       ├── privacidad.astro             → /en/privacy
│       └── 404.astro
```

i18n: rutas ES en raíz, EN bajo `/en/`. Usa `getStaticPaths` con ambos locales; los strings de UI salen de `src/i18n/*.json` mediante un helper `t(key, locale)`. hreflang recíproco en `<head>`.

---

## 3. SITEMAP Y PROPÓSITO POR PÁGINA

| Ruta | Propósito | CTA primario |
|---|---|---|
| `/` | Impacto + entrada a catálogo. Hero: 1 obra grande, nombre en Fraunces, una frase de statement. SIN preloader, SIN WebGL en v1 | "Ver obras disponibles" |
| `/obras` | Grid filtrable (default). Filtros: disponibilidad, técnica (pintura/instalación), rango precio, tamaño. Toggle "Ver como travesía" (modo narrativo, Fase 5) | clic en obra |
| `/obras/[slug]` | Ficha comercial. Fondo hueso SIEMPRE. Imagen grande + zoom, metadatos, precio, TrustBlock, CTA condicional (§5.2), ScaleVisualizer | Inquiry/Adquirir |
| `/encargos` | Landing de comisión privada: proceso visión→boceto→obra en 3 pasos, 2-3 casos con fotos, "desde X€ según formato", plazo típico, formulario | Formulario encargo |
| `/about` | Bio narrativa + mapa migratorio (aquí vive la capa poética), retrato, statement completo, CV | — |
| `/exposiciones` | Lista cronológica expos + próximas. Señal de actividad | — |
| `/prensa` | Press kit: bio 3 tamaños ES/EN, CV PDF, statement PDF, imágenes hi-res con créditos, contacto profesional | Descargas |
| `/contacto` | Prensa/galerías/general. Email directo + formulario corto | — |
| `/faq-compra` | Envío internacional, certificado, devolución 14 días, pagos, framing, aduanas Miami↔España | — |
| `/privacidad` | RGPD (formularios + newsletter + analytics) | — |
| `/404` | Temática: vaso roto que se llena (CSS/SVG animado, no WebGL) | Link a /obras |

Formularios: en v1, `<form>` HTML nativo hacia **Formspree o Web3Forms** (decidir en Fase 4; sin backend propio). Honeypot antispam. Estado de confirmación: "Respondo en menos de 48h".

---

## 4. DESIGN TOKENS (copiar literal a `tokens.css`; único origen de verdad)

```css
:root {
  /* Color */
  --c-bone: #f4f1ea;          /* fondo global default */
  --c-paper: #ebe5da;         /* superficies secundarias sobre hueso */
  --c-deep: #0d2b45;          /* azul profundo: SOLO hero y modo narrativo */
  --c-deep-soft: #182f43;     /* superficies oscuras secundarias */
  --c-ink: #10222f;           /* texto principal sobre hueso (azul casi negro) */
  --c-ink-2: #5e625f;         /* texto secundario sobre hueso */
  --c-line: #c9c1b6;          /* bordes, separadores */
  --c-cta: #c2593a;           /* terracota: ÚNICO color de acción sobre hueso */
  --c-cta-hover: #a8461f;
  --c-earth: #8a5d3b;         /* acento tierra, solo filetes/detalles */
  --c-wine: #6b2737;          /* decorativo sobre hueso; PROHIBIDO sobre --c-deep */
  --c-on-deep: #f4f1ea;       /* texto sobre azul */
  /* Sobre fondo oscuro, el CTA es botón sólido --c-bone con texto --c-deep. Nunca vino ni terracota sobre azul. */

  /* Tipografía */
  --f-display: 'Fraunces Variable', serif;   /* títulos, nombres de obra (usar italic en títulos de obra) */
  --f-ui: 'Inter Variable', system-ui, sans-serif;
  --fs-hero: clamp(2.8rem, 8vw, 7rem);
  --fs-h1: clamp(2rem, 5vw, 3.5rem);
  --fs-h2: clamp(1.4rem, 3vw, 2rem);
  --fs-body: 1rem;            /* 16px mínimo SIEMPRE en móvil */
  --fs-meta: 0.875rem;
  --lh-tight: 1.1;
  --lh-body: 1.6;

  /* Espaciado (escala única, prohibido usar valores fuera de esta) */
  --sp-1: 0.25rem; --sp-2: 0.5rem; --sp-3: 1rem; --sp-4: 1.5rem;
  --sp-5: 2.5rem; --sp-6: 4rem; --sp-7: 6rem; --sp-8: 9rem;

  /* Motion (§6) */
  --ease-fn: cubic-bezier(0.16, 1, 0.3, 1);      /* funcional: UI, filtros, compra */
  --ease-poetic: cubic-bezier(0.65, 0, 0.15, 1); /* narrativa, emerger */
  --dur-micro: 250ms;
  --dur-el: 450ms;
  --dur-page-mobile: 400ms;
  --dur-page-desktop: 650ms;

  --radius: 2px;              /* casi cuadrado; estética galería, no app */
  --maxw: 1440px;
}
```

Reglas duras de color:
- Imagen de obra SIEMPRE sobre `--c-bone` o `--c-paper`. Nunca sobre `--c-deep`.
- Texto funcional cumple WCAG AA (4.5:1). `--c-earth` solo en filetes/decoración, nunca texto pequeño.
- Prohibidos `#000` y `#fff` puros en cualquier parte.

---

## 5. MODELO DE DATOS

### 5.1 Colección `works` (schema zod en `src/content/config.ts`)

```ts
import { defineCollection, z } from 'astro:content';

const works = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    year: z.number(),
    technique_es: z.string(),
    technique_en: z.string(),
    width_cm: z.number().nullable(),
    height_cm: z.number().nullable(),
    depth_cm: z.number().nullable().optional(),
    kind: z.enum(['painting', 'installation', 'object']),
    series: z.enum(['cuba', 'miami', 'sf', 'roma', 'espana', 'none']).default('none'),
    status: z.enum(['available', 'reserved', 'sold']),
    price_eur: z.number().nullable(),      // null => "Consultar" (solo permitido si kind !== 'painting')
    featured: z.boolean().default(false),
    cover: image(),
    gallery: z.array(image()).default([]),
    story_es: z.string(),                   // texto narrativo de la obra
    story_en: z.string(),
    order: z.number().default(0),
  }),
});
export const collections = { works };
```

### 5.2 Lógica de CTA condicional (implementar exactamente así)

- `status === 'available'` → CTA único primario: "Adquirir — {precio}€" (o "Consultar disponibilidad" si `price_eur === null`). NINGÚN CTA de encargo visible.
- `status === 'reserved'` → badge "Reservada" + CTA secundario "Avisarme si se libera" (mailto o formulario).
- `status === 'sold'` → badge "Colección privada" (punto rojo estilo galería) + CTA "Encargo privado inspirado en esta obra" → `/encargos?ref={slug}`.
- Obras vendidas se muestran en el grid con badge, nunca ocultas (prueba social).

### 5.3 TrustBlock (componente fijo en toda ficha, texto desde i18n)

Cuatro líneas con icono mínimo: Certificado de autenticidad firmado · Envío internacional asegurado (España/EU/USA) · Devolución 14 días · Pago seguro (transferencia / tarjeta vía enlace Stripe). Link a `/faq-compra`.

---

## 6. SISTEMA DE MOTION

### 6.1 Reglas globales
- Solo se anima `transform` y `opacity`. Prohibido animar width/height/top/left/margin/filter en elementos grandes.
- Dual easing: interacciones de compra/UI usan `--ease-fn` + `--dur-micro/--dur-el`; transiciones narrativas y "emerger" usan `--ease-poetic`.
- `prefers-reduced-motion: reduce` → TODA animación se sustituye por crossfade de opacidad 300ms lineal. No se elimina contenido ni funcionalidad. Implementar en `motion.ts` como guard central: ninguna animación se instancia sin pasar por ese helper.
- View Transitions API de Astro (`<ClientRouter />`) solo entre `/obras` y `/obras/[slug]`: la imagen de la obra usa `view-transition-name` dinámico por slug para expandirse de card a ficha. Resto de navegación: fade simple.
- Transición "emerger": al abrir ficha desde el grid, una línea horizontal de 1px (`--c-earth` al 30%) cruza el viewport de abajo arriba sincronizada con la expansión de la imagen. Duración `--dur-page-*`, easing poético. Es el único ornamento de la transición.

### 6.2 Interacción firma "fractura de vidrio" (Fase 5, solo desktop + pointer fine)
En hover sobre WorkCard: líneas de fractura SVG (2-3 paths, stroke 1px `--c-line`) se dibujan desde una esquina del MARCO (stroke-dashoffset animado, 450ms ease-fn) y revelan un caption flotante con título/año/estado. La imagen no se toca. En táctil: caption siempre visible bajo la imagen.

### 6.3 PROHIBICIONES ABSOLUTAS
- Ningún filtro, shader, distorsión, overlay de color, blur o ripple sobre `<img>`/`<canvas>` de obras.
- Sin preloader. Sin splash. Sin scroll-jacking (scroll nativo en móvil siempre).
- Sin cursor custom en v1 (evaluar en v1.1 solo desktop).
- Sin animación en scroll dentro de la ficha de obra por encima del TrustBlock: la zona comercial es estática.

---

## 7. PRESUPUESTO DE PERFORMANCE (gate de cada fase; si falla, la fase no se cierra)

- LCP < 2.0s móvil 4G (Lighthouse mobile, throttling por defecto). CLS < 0.05. INP < 200ms.
- JS total enviado al cliente < 120KB gzip (GSAP core+ScrollTrigger ≈ 70KB: no queda margen para caprichos).
- Lenis: importado dinámicamente SOLO si `window.matchMedia('(pointer:fine) and (min-width:1024px)')` y no reduced-motion. En móvil, scroll 100% nativo.
- Imágenes: `astro:assets` con `format={['avif','webp']}`, `widths=[400,800,1200,1600]`, `loading="lazy"` (salvo hero: `loading="eager"` + `fetchpriority="high"`). Cover del grid ≤ 120KB objetivo.
- Fuentes: 2 variable fonts self-hosted, `font-display: swap`, preload del display.
- Cero third-party scripts en v1 (analytics se añade en Fase 7 con Cloudflare Web Analytics, sin cookies).
- Probar SIEMPRE en Safari iOS real o simulador antes de cerrar fase con motion.

---

## 8. SEO / HEAD (en `Base.astro`, Fase 1)

- Title pattern: `{página} — Enya Fontanills` ; ficha: `{título obra} ({año}) — Enya Fontanills`.
- Meta description única por página desde i18n/frontmatter.
- `og:image` por obra = cover 1200×630 generada con `astro:assets`.
- JSON-LD: `Person` (artista) en todas; `VisualArtwork` en fichas con `offers` si `available` (price, priceCurrency EUR, availability).
- `hreflang` es/en recíproco + `x-default` → ES. Sitemap con `@astrojs/sitemap`. `robots.txt`.

---

## 9. FASES DE BUILD (ejecutar en orden; una fase por sesión de agente)

**F0 — Scaffold (30min):** repo con estructura §2.1, Astro instalado, tokens.css, reset, fuentes fontsource, deploy pipeline a Cloudflare Pages funcionando con página en blanco. ✓ Acepta: `npm run build` limpio + deploy visible.

**F1 — Base + contenido (sesión):** Base.astro completo (SEO §8, Nav, Footer, LangSwitch), schema works, 6-8 obras reales cargadas desde el PDF del portfolio como datos provisionales (fotos placeholder de baja calidad marcadas `provisional: true` en frontmatter si hace falta un flag), helper i18n con es.json/en.json. ✓ Acepta: todas las rutas del §3 existen y renderizan (aunque vacías), build limpio, hreflang correcto.

**F2 — Catálogo comercial (sesión profunda):** `/obras` grid + WorkFilters (filtros por query-param, sin librerías, JS vanilla progresivo: sin JS el grid muestra todo), WorkCard, ficha `/obras/[slug]` completa: imagen+zoom (CSS `object-fit` + lightbox simple propio), metadatos, precio, TrustBlock, CTA condicional §5.2, ScaleVisualizer (silueta humana 170cm junto a la obra a escala, SVG puro). ✓ Acepta: flujo IG deep-link → ficha carga <2s móvil, filtros funcionan sin JS roto, CTA condicional correcto en los 3 estados.

**F3 — Páginas de negocio (sesión):** /encargos, /faq-compra, /prensa, /exposiciones, /about, /contacto, /privacidad, 404 animado CSS. Formularios con proveedor elegido + honeypot + página de confirmación. ✓ Acepta: formularios entregan email real, textos ES/EN completos.

**F4 — Motion capa 1 (sesión):** View Transitions grid↔ficha con `view-transition-name`, línea "emerger", entradas de página (fade/rise 450ms), guard reduced-motion central. ✓ Acepta: 60fps en Safari iOS (grabación), reduced-motion = crossfades, CLS < 0.05 se mantiene.

**F5 — Capa firma (sesión profunda):** GlassFracture en WorkCard (desktop), hero home definitivo (obra grande + Fraunces italic + micro-parallax ≤ 6px solo desktop), modo narrativo "travesía" como vista alternativa de /obras (fondo `--c-deep`, agrupación por series, scroll con Lenis desktop). ✓ Acepta: presupuesto JS no superado, toggle catálogo↔narrativa con transición emerger, móvil no carga Lenis.

**F6 — Keystatic (30min-2h):** Keystatic local sobre la colección works para que Enya publique sin tocar código. ✓ Acepta: crear/editar obra desde UI y build correcto.

**F7 — QA + lanzamiento (sesión):** Lighthouse ≥95 perf móvil en home/grid/ficha, axe sin errores críticos, test manual iPhone real + Android, analytics Cloudflare, submit Awwwards/CSSDA. 

---

## 10. CONTENIDO PENDIENTE DEL CLIENTE (bloqueantes externos, no del agente)

Fotos profesionales de obra (las del portfolio PDF NO valen para producción), retrato, CV completo, lista definitiva de obras con precios y estados, casos de encargo (si existen), textos legales revisados.
