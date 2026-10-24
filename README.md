# Enyarte

An artist's catalogue and narrative experience for Enya Fontanills, a contemporary surrealist painter and installation artist. Built with Astro, TypeScript and GSAP.

## One collection, two ways to explore it

**Catalogue** uses a light canvas to put the work and enquiries first. **Narrative** follows the artist's journey in a deep-blue visual mode. Both share the same works and support Spanish and English.

The implementation keeps the interface in Astro and vanilla CSS/JavaScript. Keystatic is available for local editing during development; the production build stays static. Fonts are self-hosted, and motion is designed around reduced-motion preferences and mobile use.

## Explore locally

```sh
npm ci
npm run dev
```

## Build and check

```sh
npm run lint
npm run build
```

`npm run deploy` builds and publishes through Wrangler.

## Structure and decisions

- `src/` — pages, works, layouts, styles and interaction code.
- `public/` — artwork and static assets.
- `keystatic.config.ts` — local editorial model.
- [Product and design constraints](SPEC-enyarte.md).

Built by [Marcos Freixanet](https://github.com/Freixanet) · [Contact](mailto:mfreixanet@icloud.com).
