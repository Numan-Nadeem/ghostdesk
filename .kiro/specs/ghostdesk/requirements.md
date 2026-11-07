# GhostDesk — Requirements

Kiroween 2026, Costume Contest. Spec-driven build with Kiro.
Live demo: https://ghostdesk-nomii-dev-lsts-projects.vercel.app/

## Overview

GhostDesk is a booking and client-management app for barbershops and salons.
Customers book a chair online; owners manage the day's diary from one desk.
The whole experience is a haunting, polished midnight UI: deep blacks, fog,
candle-glow violet, booked slots that rise like spirits, free slots that glow.

## User stories

### Customer booking
- As a customer, I can pick a service (name, price, duration) so I know what
  I'm booking and what it costs.
- As a customer, I can pick a barber (name, role, photo) so I choose who cuts
  my hair.
- As a customer, I can pick a day and an hour from the barber's diary, seeing
  only the slots that still glow (free ones), so I never pick a taken slot.
- As a customer, I can enter my name and phone and confirm, so the shop can
  reach me.
- As a customer, I get a booking reference (GHOST-####) on confirmation, so I
  can show it at the door.

### Owner desk
- As an owner, I see today's bookings, expected revenue, no-show count and
  open slots left, so I know how the day stands at a glance.
- As an owner, I can mark any booking a no-show in one tap, so the chair is
  free again and the stats update.
- As an owner, I can cancel a booking or restore a no-show, so mistakes are
  reversible.
- As an owner, bookings a customer makes appear on my desk instantly, so the
  diary is always current.

## Acceptance criteria
- Booking flow is 4 steps (service → barber → time → details) and completes
  in under a minute.
- Every confirmed booking shows a unique GHOST-#### reference.
- Marking a no-show updates the row AND the stats (bookings, revenue,
  no-shows, open slots) together.
- No horizontal overflow at 390 / 820 / 1440 widths; content never hidden
  when scroll animations are off.
- Demo data persists in the browser (localStorage); no backend is required.

## Non-goals
- No payments, no accounts, no SMS/email reminders.
- No backend or database in v1 (PostgreSQL is a later step, not wired up).
