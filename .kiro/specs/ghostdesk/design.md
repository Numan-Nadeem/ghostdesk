# GhostDesk — Design

## Architecture

- **Framework:** Next.js 15 (App Router, TypeScript, static export) + React 19.
- **Styling:** Tailwind CSS v4. Fonts: Outfit (display/body) + Geist Mono (refs/specs).
- **Motion:** GSAP 3 + @gsap/react (ScrollTrigger). Hover physics, scrubbing
  text reveals, one pinned section. Scroll animations never hide content by
  default (`immediateRender: false`; start states set in JS only).
- **State & persistence:** React state + browser `localStorage` only. Seeded
  demo diary (5 bookings) plus any booking the visitor makes. No backend, no
  database in v1.
- **Hosting:** Vercel, static export (`next build` → `out/`).

## Data model

```ts
Service { id, name, price, minutes, tag }
Barber  { id, name, role, photo, services }
Booking { ref, name, phone, serviceId, barberId, day, time, status }
// status: 'confirmed' | 'no-show' | 'cancelled'
```

- Slots: each barber has a diary of days × hours; a slot is free (glowing)
  or taken (risen like a spirit, faded).
- Booking reference: `GHOST-` + 4 digits, unique per booking.

## Pages / sections (single page)

1. Nav (fixed pill) — Services, The crew, Owner's desk, "Book a chair".
2. Hero (Editorial Split) — "Book the chair. The ghost does the rest."
   + live demo link + marquee.
3. Services bento — 5 services with price/duration.
4. The crew — 4 barbers with photos and roles.
5. Testimonials — carousel.
6. Booking — 4-step flow (service → barber → time → details) → confirmation
   with GHOST-#### reference.
7. Owner's desk — stats (bookings today, expected revenue, no-shows, open
   slots) + diary rows with Mark no-show / Cancel / Restore.
8. Footer — live demo link, built-with stack.

## Visual system

- Near-black background, white text, violet/indigo glow accents.
- Real photography (barber portraits, shop interior, foggy street) — no
  stock stand-ins.
- Favicon + apple-touch-icon on every deploy.

## How Kiro was used (spec-driven)

The build followed Kiro's spec-driven workflow: requirements first (this
spec), then design, then tasks, then implementation against the task list.
Each feature was built to an acceptance criterion in `requirements.md` and
checked off in `tasks.md` before the next one started.
