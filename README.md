# GhostDesk — Kiroween 2026, Costume Contest

Live demo: https://ghostdesk-nomii-dev-lsts-projects.vercel.app/
(also https://ghostdesk-eight.vercel.app/)

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static export → out/
```

## License

MIT — see [LICENSE](LICENSE).

## What it is
A working haunted booking app for barbershops/salons. Customers pick a
service, barber, date and time slot, enter name + phone, and get a booking
reference. Owners get a dashboard: today's bookings, revenue, no-shows, open
slots, cancel / mark no-show / restore. Booked slots rise like spirits,
empty slots glow, overdue bookings turn ghostly.

## Stack (actually used — this is the Devpost "Built with" list)
Next.js 15 (App Router, TypeScript, static export), React 19, Tailwind CSS v4,
GSAP 3 + @gsap/react (ScrollTrigger), Vercel. Fonts: Outfit + Geist Mono.
Persistence is browser localStorage only — there is NO backend and NO
PostgreSQL wired up; do not claim one on Devpost.

## Deploy
Vercel project `ghostdesk` (prj_SkIjlCGqznVjlUhxTsZL3facp5CQ), production
deployment dpl_2pALvVYrxxGGsdvZF52ZvEymS213 (READY). Deployed from source
files via the Vercel MCP (upload_file + create_deployment); Vercel runs
`npm install` + `next build`. SSO deployment protection was DISABLED via
update_project (ssoProtection: null) because the team default blocked the
public demo link with a Vercel login wall.

## Design (gpt-taste skill)
Seed 833 (char count of assignment context). RNG picks: Hero Editorial Split,
type Outfit, components Infinite Marquee + Testimonial Carousel + Inline
Typography Images, GSAP Hover Physics + Scrubbing Text Reveals. Deviation:
Scroll Pinning added (parent task explicitly required a pinned section).
See the <design_plan> comment at the top of src/app/page.tsx.

## QA (2026-11-07)
- Local prod build screenshotted at 1440 / 820 / 390 with scrolled viewports,
  all sections viewed: no horizontal overflow, H1 max 3 lines, buttons legible.
- End-to-end booking test passed (service -> barber -> slot -> form ->
  confirmation ref GHOST-xxxx -> dashboard row -> mark no-show), zero page errors.
- Fixes made from QA: overdue rows made readable (opacity-only pulse, no
  transform), scroll-margin added under the fixed nav, image containers given
  a background.
- Known limits: this VM's headless Chromium cannot reach any external site
  (egress proxy CONNECT fails for Chromium only; curl works), so picsum images
  show blank in local QA screenshots and the live page could only be verified
  via curl — every live asset (HTML, all JS chunks, CSS, fonts, favicon,
  apple-touch-icon) returns HTTP 200 on both aliases. Picsum images will load
  for real visitors.

## Picsum fix + gallery (2026-11-07 ~22:05 PKT)
- All 10 picsum photos downloaded with curl into `public/images/` and
  `src/lib/ghostdesk.ts` now references local `/images/*.jpg` — zero picsum
  references in the live HTML (verified: grep count 0, all 10 images HTTP 200).
- Images compressed (PIL, q60–72, max 800px) so each file stays under the
  Vercel MCP 128KB-per-argument upload cap.
- Redeployed as production deployment dpl_9p1xFVEamaXNWXX2F5bL1yAzHXid (READY),
  same aliases. Note: `upload_file`/`create_deployment` must be called WITHOUT
  teamId — with teamId the MCP returns 403 (no authorize_team_access tool
  exists to fix the scope).
- Devpost gallery: 5 screenshots, all exactly 1200x800 PNG, in `gallery/`
  (01-hero, 02-features, 03-crew, 04-booking, 05-dashboard) + zipped as
  `gallery/ghostdesk-gallery.zip` (2.7 MB). Captured with Playwright at a
  1200x800 viewport from the local prod build, scrolled viewports, each viewed
  by eye. Caveat: the "portrait" photos are random picsum images (foggy forest,
  cactus, CN Tower, forest path) in grayscale — moody and on-brand, but not
  actual barbershop photos.

## Portrait fix (2026-11-07 ~22:15 PKT)
- The 10 picsum photos were random (Silas = CN Tower, Morticia = cactus,
  Bram = forest path). All replaced with AI-generated on-topic imagery via
  the media pipeline (4 generation calls: 2x2 barber grid, testimonial row,
  shop interior, foggy street), cropped with PIL to the same filenames
  (barbers 3:4, hero 4:5 from the interior, shop/night wide). Old picsum
  files backed up in `.gen/old/`.
- New files are 12-53 KB each (under the 128 KB MCP cap). `next build`
  passes. QA re-verified at 1440/820/390 (scrolled viewports, no overflow,
  0 page errors, H1 2/1/3 lines, all images loaded). Gallery re-shot at
  1200x800 (04 retaken twice for framing; final shows the full time grid
  with 11:00 selected) and re-zipped (2.0 MB).
- Redeployed as production deployment dpl_5snrrA3vpBHe11uziztTmdHgFkg9.
  Live-verified: root HTTP 200, all 10 images HTTP 200, zero picsum refs in
  live HTML, live image SHA1s match the new local files exactly.
