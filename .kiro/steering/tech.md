# Tech — GhostDesk

- **Framework:** Next.js 15 (App Router, TypeScript, static export) + React 19.
- **Styling:** Tailwind CSS v4. Fonts: Outfit + Geist Mono.
- **Motion:** GSAP 3 + @gsap/react (ScrollTrigger). Hover physics, scrubbing
  text reveals, one pinned section. Scroll animations use
  `immediateRender: false` and set start states in JS only, never in CSS.
- **State:** React state + browser `localStorage` only. No backend, no
  database in v1. Do not claim PostgreSQL anywhere.
- **Hosting:** Vercel, static export (`next build` → `out/`).

## Commands

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export
```

## Conventions

- TypeScript strict; no `any` in new code.
- Images are local files under `public/images/` — no remote image URLs.
- Every page ships a favicon and an apple-touch-icon.
