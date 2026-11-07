# Structure — GhostDesk

```
ghostdesk/
├── .kiro/
│   ├── specs/ghostdesk/      # spec: requirements.md, design.md, tasks.md
│   └── steering/             # product.md, tech.md, structure.md
├── src/
│   ├── app/                  # layout.tsx, page.tsx, globals.css
│   └── lib/ghostdesk.ts      # services, barbers, diary, booking helpers
├── public/
│   ├── images/               # real photos (barbers, shop, street)
│   ├── favicon.svg
│   └── apple-touch-icon.png
├── gallery/                  # Devpost screenshots (1200x800 PNG)
├── README.md
└── LICENSE                   # MIT
```

- `src/app/page.tsx` holds the whole single-page app: hero, services, crew,
  testimonials, booking flow, owner desk, footer.
- `src/lib/ghostdesk.ts` holds the data (services, barbers, seeded diary)
  and the booking logic. No other file owns domain data.
- Specs are the source of truth for behaviour; if code and spec disagree,
  the spec wins and the code is fixed.
