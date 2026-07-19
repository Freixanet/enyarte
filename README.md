# Enyarte

Artist site for **Enya Fontanills** — contemporary surrealist painter and installation artist.

Goals: sell original work, capture private commissions, and present gallery-grade craft without stealing focus from the art.

---

## Concept

**"Water that separates and joins."** Two visual modes:

- **Catalog** — bone background, commercial default
- **Narrative** — deep blue, migration journey Cuba → Miami → San Francisco → Rome → Spain

Bilingual ES/EN. Primary traffic: mobile from Instagram. Market axis: Miami–Spain.

---

## Stack (locked)

- **Astro 5** (static SSG)
- **GSAP** (+ ScrollTrigger, Flip)
- **Lenis** (desktop only)
- **Keystatic** (local markdown collections for works)
- Self-hosted Fraunces + Inter variable fonts
- TypeScript strict
- Deploy: Cloudflare Pages

No React/Vue/Svelte/Tailwind UI layer — Astro + vanilla CSS/JS + GSAP.

---

## Local development

```bash
npm install
npm run dev
```

See `SPEC-enyarte.md` for full product/design constraints.

---

## Author

**Marcos Freixanet** · [github.com/Freixanet](https://github.com/Freixanet) · mfreixanet@icloud.com
