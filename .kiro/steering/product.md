# Product — GhostDesk

GhostDesk is a booking and client-management app for barbershops and salons.

- **Customers** book a chair in 4 steps: service → barber → day/hour →
  name + phone. They get a GHOST-#### reference to show at the door.
- **Owners** run the day from one desk: today's bookings, expected revenue,
  no-show count, open slots, and one-tap no-show / cancel / restore.
- **Feel:** a haunting, polished midnight UI. Deep blacks, fog, candle-glow
  violet. Booked slots rise like spirits, free slots glow, overdue bookings
  turn ghostly.

## Rules

- Booking must complete in under a minute, with no account and no payment.
- Every confirmed booking shows a unique GHOST-#### reference.
- Marking a no-show updates the row AND the stats together, immediately.
- No horizontal overflow at any width; content is never hidden when
  animations are off.
- Demo data lives in the browser. No backend is required for v1.
