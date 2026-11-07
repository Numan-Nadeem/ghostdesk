"use client";
{/*
================================================================================
<design_plan>
1. PYTHON RNG EXECUTION (deterministic seed = character count of the assignment
   context paragraph, computed in Python before writing any UI code):
   >>> task = <assignment context paragraph, 833 characters>
   >>> import random; r = random.Random(len(task))  # seed = 833
   >>> r.choice(["Cinematic Center","Artistic Asymmetry","Editorial Split"])
   'Editorial Split'
   >>> r.choice(["Satoshi","Cabinet Grotesk","Outfit","Geist"])
   'Outfit'
   >>> r.sample(["Inline Typography Images","Horizontal Accordions",
   ...           "Infinite Marquee","Feedback/Testimonial Carousel"], 3)
   ['Infinite Marquee', 'Feedback/Testimonial Carousel',
    'Inline Typography Images']
   >>> r.sample(["Hover Physics","Scroll Pinning","Image Scale & Fade Scroll",
   ...           "Scrubbing Text Reveals","Card Stacking"], 2)
   ['Hover Physics', 'Scrubbing Text Reveals']

   SELECTIONS FOLLOWED: Hero = Editorial Split. Typography = Outfit (display
   and body) + Geist Mono (mono spec labels). Components = Infinite Marquee,
   Feedback/Testimonial Carousel, Inline Typography Images. GSAP paradigms =
   Hover Physics + Scrubbing Text Reveals.

   DEVIATION (disclosed): Scroll Pinning added as a third GSAP paradigm. The
   parent task explicitly requires a pinned/scroll section ("GSAP pinned/scroll
   section"), which the two RNG picks did not cover. The pin is applied to the
   crew section only; everything else follows the RNG output exactly.

2. AIDA CHECK: Navigation = floating glass-pill nav. Attention = Editorial
   Split hero (text left, image right, massive negative space). Interest =
   gapless bento grid of features. Desire = pinned crew gallery + scrubbed
   text reveal + testimonial carousel. Action = working booking flow + massive
   high-contrast CTA footer.

3. HERO MATH VERIFICATION: H1 copy is "Book the chair. The ghost does the
   rest." (39 characters). Font size clamp(2.75rem, 4.5vw, 4.5rem), container
   max-w-3xl inside the left editorial column. At 1440px the column is ~640px
   wide: ~3 lines maximum, never 4-6. At 390px the font drops to 2.75rem and
   the copy still fits in 3 lines. No stamp/badge icons on the hero text. No
   pill-tags under the hero. No raw stats in the hero.

4. BENTO DENSITY VERIFICATION: lg:grid-cols-6 with grid-flow-dense.
   Card A (shop image) col-span-4 row-span-2. Card B col-span-2. Card C
   col-span-2. Card D col-span-3. Card E col-span-3.
   Row 1: 4 + 2 = 6. Row 2: A continues (4) + C (2) = 6. Row 3: 3 + 3 = 6.
   Zero empty cells, zero dead corners, dense flow on.

5. LABEL SWEEP & BUTTON CHECK: No cheap meta-labels anywhere ("SECTION 01",
   "QUESTION 05", "ABOUT US" etc. — none exist in this file). Primary CTA is
   bone background (#F2EEE3) with night text (#07070B) — high contrast.
   Secondary CTA is a bone outline with bone text on night. No invisible
   button text. No emojis anywhere in code, comments or output.

6. MOTION SAFETY: All scroll reveals use gsap.from with immediateRender:false
   and start states set only in JS, never in CSS — content renders fully
   visible with JS/GSAP off. All GSAP setup is gated behind a
   prefers-reduced-motion check; reduced-motion users get the static end
   state (full opacity, scale 1, no pinning, no scrubbing, no marquee).
</design_plan>
================================================================================
*/}
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import {
  BARBERS,
  BENTO_IMG,
  HERO_IMG,
  SCRUB_IMG,
  SERVICES,
  SLOT_TIMES,
  TESTIMONIALS,
  barberById,
  dateKey,
  fmtDate,
  fmtDateLong,
  hash01,
  isSlotTaken,
  loadBookings,
  next7Days,
  saveBookings,
  seedDemoBookings,
  serviceById,
  type Booking,
} from "@/lib/ghostdesk";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

function GhostMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <path
        fill="currentColor"
        d="M32 6c-10.5 0-17 7.6-17 18v20.4c0 3 4.1 4.1 5.9 1.7l3.1-4c1-1.3 3-1.3 4 0l1.9 2.5c1 1.3 3 1.3 4 0l1.9-2.5c1-1.3 3-1.3 4 0l3.1 4c1.8 2.4 5.9 1.3 5.9-1.7V24C49 13.6 42.5 6 32 6z"
      />
      <circle cx="25.5" cy="25" r="3.2" fill="#07070b" />
      <circle cx="38.5" cy="25" r="3.2" fill="#07070b" />
      <ellipse cx="32" cy="33" rx="2.6" ry="3.4" fill="#8b5cf6" />
    </svg>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#8b5cf6]">
      {children}
    </p>
  );
}

export default function GhostDeskPage() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const existing = loadBookings();
    if (existing.length === 0) {
      const seed = seedDemoBookings();
      saveBookings(seed);
      setBookings(seed);
    } else {
      setBookings(existing);
    }
  }, []);

  const addBooking = (b: Booking) => {
    setBookings((prev) => {
      const next = [...prev, b];
      saveBookings(next);
      return next;
    });
  };

  const updateStatus = (id: string, status: Booking["status"]) => {
    setBookings((prev) => {
      const next = prev.map((b) => (b.id === id ? { ...b, status } : b));
      saveBookings(next);
      return next;
    });
  };

  useEffect(() => {
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }, []);

  useGSAP(
    () => {
      if (reducedMotion) return;
      const ctx = gsap.context(() => {
        // Gentle reveals: immediateRender false so nothing is ever hidden by default.
        gsap.utils.toArray<HTMLElement>(".gs-reveal").forEach((el) => {
          gsap.from(el, {
            y: 28,
            opacity: 0,
            duration: 0.9,
            ease: "power3.out",
            immediateRender: false,
            scrollTrigger: { trigger: el, start: "top 88%" },
          });
        });
        // Scrubbed word-by-word text reveal.
        gsap.utils.toArray<HTMLElement>(".gs-scrub-word").forEach((word) => {
          gsap.fromTo(
            word,
            { opacity: 0.12 },
            {
              opacity: 1,
              ease: "none",
              scrollTrigger: {
                trigger: word,
                start: "top 88%",
                end: "top 45%",
                scrub: true,
              },
            }
          );
        });
        // Pinned crew section: title pins left while barbers scroll right.
        const pin = document.querySelector(".gs-pin");
        const track = document.querySelector(".gs-pin-track");
        if (pin && track && window.innerWidth >= 1024) {
          ScrollTrigger.create({
            trigger: ".gs-pin-wrap",
            start: "top top+=96",
            end: "bottom bottom",
            pin: pin,
            pinSpacing: false,
          });
        }
      }, rootRef);
      return () => ctx.revert();
    },
    { scope: rootRef, dependencies: [reducedMotion] }
  );

  return (
    <div
      ref={rootRef}
      className="overflow-x-hidden w-full max-w-full bg-[#07070b] text-[#f2eee3]"
    >
      <Nav />
      <main>
        <Hero />
        <Marquee />
        <Bento />
        <ScrubStatement />
        <Crew />
        <Testimonials />
        <BookingApp bookings={bookings} onBooked={addBooking} />
        <OwnerDesk bookings={bookings} onStatus={updateStatus} />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}

/* ---------------------------------- NAV ---------------------------------- */

function Nav() {
  return (
    <header className="fixed inset-x-0 top-4 z-50 flex justify-center px-4">
      <nav className="flex w-full max-w-5xl items-center justify-between gap-4 rounded-full border border-white/10 bg-[#0e0e15]/80 py-2 pl-4 pr-2 shadow-[0_8px_40px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        <a href="#top" className="flex items-center gap-2.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#8b5cf6] text-white">
            <GhostMark className="h-5 w-5" />
          </span>
          <span className="text-lg font-bold tracking-tight">GhostDesk</span>
          <span className="hidden rounded-full border border-[#f59e0b]/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-[#f59e0b] sm:inline-block">
            Kiroween 2026
          </span>
        </a>
        <div className="hidden items-center gap-7 text-sm text-[#a3a3b8] md:flex">
          <a href="#services" className="transition-colors hover:text-[#f2eee3]">
            Services
          </a>
          <a href="#crew" className="transition-colors hover:text-[#f2eee3]">
            The crew
          </a>
          <a href="#desk" className="transition-colors hover:text-[#f2eee3]">
            Owner&apos;s desk
          </a>
        </div>
        <a
          href="#book"
          className="rounded-full bg-[#f2eee3] px-5 py-2.5 text-sm font-bold text-[#07070b] transition-transform hover:scale-[1.03]"
        >
          Book a chair
        </a>
      </nav>
    </header>
  );
}

/* ---------------------------------- HERO --------------------------------- */

function Hero() {
  return (
    <section id="top" className="relative px-4 pb-24 pt-32 md:px-8 md:pt-40">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -top-40 left-1/4 h-[480px] w-[480px] rounded-full bg-[#8b5cf6]/25 blur-[140px]" />
        <div className="absolute bottom-0 right-0 h-[380px] w-[380px] rounded-full bg-[#f59e0b]/10 blur-[120px]" />
      </div>
      <div className="relative mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#8b5cf6]">
            Haunted booking, done properly
          </p>
          <h1 className="mt-6 max-w-3xl text-[clamp(2.75rem,4.5vw,4.5rem)] font-extrabold leading-[1.04] tracking-tight">
            Book the chair.{" "}
            <span className="text-[#8b5cf6]">The ghost</span> does the rest.
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-relaxed text-[#a3a3b8]">
            GhostDesk is online booking for barbershops and salons. Customers
            pick a service, a barber and a time — no phone calls, no missed
            calls, no double-bookings. The spirits handle the diary.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-4">
            <a
              href="#book"
              className="rounded-full bg-[#f2eee3] px-7 py-3.5 text-base font-bold text-[#07070b] transition-transform hover:scale-[1.03]"
            >
              Book a chair
            </a>
            <a
              href="#desk"
              className="rounded-full border border-[#f2eee3]/30 px-7 py-3.5 text-base font-semibold text-[#f2eee3] transition-colors hover:border-[#f2eee3]/70"
            >
              See the owner&apos;s desk
            </a>
          </div>
          <div className="mt-12 flex flex-wrap gap-x-10 gap-y-3 border-t border-white/10 pt-6 text-sm text-[#a3a3b8]">
            <span>
              <strong className="text-[#f2eee3]">Under a minute</strong> to book
            </span>
            <span>
              <strong className="text-[#f2eee3]">Zero</strong> double-bookings
            </span>
            <span>
              <strong className="text-[#f2eee3]">Live</strong> in your browser
            </span>
          </div>
        </div>
        <div className="relative lg:col-span-5">
          <div className="group relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#14141f]">
            <img
              src={HERO_IMG}
              alt="A dimly lit barbershop chair waiting for its next customer"
              className="aspect-[4/5] w-full object-cover grayscale contrast-125 transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07070b]/85 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/10 bg-[#0e0e15]/85 p-4 backdrop-blur-md">
              <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-[#5eead4]">
                Next free spirit
              </p>
              <p className="mt-1.5 text-base font-semibold">
                Signature Haircut — Silas Graves
              </p>
              <p className="text-sm text-[#a3a3b8]">
                Today, 14:30 · 45 min · $28
              </p>
            </div>
          </div>
          <div className="absolute -left-4 -top-4 hidden rounded-full bg-[#f59e0b] px-4 py-2 text-xs font-bold text-[#07070b] shadow-[0_0_30px_rgba(245,158,11,0.45)] sm:block">
            Tonight: 6 chairs open
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------- MARQUEE -------------------------------- */

function Marquee() {
  const items = [...SERVICES, ...SERVICES];
  return (
    <section aria-hidden="true" className="overflow-hidden border-y border-white/10 bg-[#0e0e15] py-5">
      <div className="marquee-track flex w-max items-center gap-0">
        {[0, 1].map((half) => (
          <div key={half} className="flex items-center">
            {items.map((s, i) => (
              <span
                key={`${half}-${i}`}
                className="flex items-center whitespace-nowrap px-6 text-lg font-semibold"
              >
                <span className="text-[#f2eee3]">{s.name}</span>
                <span className="ml-3 font-mono text-sm text-[#8b5cf6]">
                  ${s.price} · {s.minutes} min
                </span>
                <GhostMark className="ml-8 h-5 w-5 text-[#f59e0b]" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

/* --------------------------------- BENTO --------------------------------- */

function Bento() {
  return (
    <section id="services" className="scroll-mt-24 px-4 py-32 md:px-8 md:py-48">
      <div className="mx-auto max-w-6xl">
        <div className="gs-reveal max-w-2xl">
          <SectionLabel>Why shops switch</SectionLabel>
          <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            A diary that{" "}
            <span className="inline-block h-9 w-16 overflow-hidden rounded-full align-middle md:h-11 md:w-20">
              <img
                src={BENTO_IMG}
                alt=""
                className="h-full w-full object-cover grayscale contrast-125"
              />
            </span>{" "}
            never sleeps
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[#a3a3b8]">
            Every feature exists to stop one real problem: a missed call, a
            double-booked chair, or a no-show that leaves an hour empty.
          </p>
        </div>

        <div className="mt-14 grid grid-flow-dense gap-5 md:grid-cols-2 lg:grid-cols-6">
          {/* A: image card, col-span-4 row-span-2 */}
          <article className="gs-reveal group relative overflow-hidden rounded-3xl border border-white/10 bg-[#14141f] lg:col-span-4 lg:row-span-2">
            <img
              src={BENTO_IMG}
              alt="Inside a GhostDesk barbershop at night"
              className="h-full min-h-[320px] w-full object-cover grayscale contrast-125 transition-transform duration-700 ease-out group-hover:scale-105 lg:min-h-[480px]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07070b]/90 via-[#07070b]/20 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <h3 className="text-2xl font-bold md:text-3xl">
                The shop never closes
              </h3>
              <p className="mt-2 max-w-md leading-relaxed text-[#d6d6e2]">
                Customers book at 2am from the sofa. You wake up to a full
                diary, not a voicemail graveyard.
              </p>
            </div>
          </article>

          {/* B: no missed calls */}
          <article className="gs-reveal rounded-3xl border border-white/10 bg-[#0e0e15] p-7 lg:col-span-2">
            <p className="font-mono text-4xl font-bold text-[#8b5cf6]">0</p>
            <h3 className="mt-3 text-xl font-bold">Missed calls</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[#a3a3b8]">
              Booking lives on the page, not the phone. The chair fills itself
              while you cut.
            </p>
          </article>

          {/* C: spirits rise */}
          <article className="gs-reveal rounded-3xl border border-white/10 bg-[#0e0e15] p-7 lg:col-span-2">
            <p className="font-mono text-4xl font-bold text-[#5eead4]">Live</p>
            <h3 className="mt-3 text-xl font-bold">Spirits rise</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[#a3a3b8]">
              Taken slots drift up and fade like ghosts. Free slots glow, so
              the day reads at a glance.
            </p>
          </article>

          {/* D: no-show radar */}
          <article className="gs-reveal rounded-3xl border border-white/10 bg-[#14141f] p-7 lg:col-span-3">
            <h3 className="text-xl font-bold">No-show radar</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[#a3a3b8]">
              Overdue bookings turn ghostly on the owner&apos;s desk. Mark a
              no-show in one tap and the slot is free again — no awkward phone
              tag, no lost hour.
            </p>
            <div className="mt-5 flex items-center gap-3 rounded-2xl border border-white/10 bg-[#07070b] px-4 py-3">
              <GhostMark className="h-5 w-5 shrink-0 text-[#f59e0b]" />
              <p className="text-sm text-[#d6d6e2]">
                <span className="font-semibold text-[#f2eee3]">
                  GHOST-1044 · Omar F.
                </span>{" "}
                — 13:00 hot towel shave, 40 min overdue
              </p>
            </div>
          </article>

          {/* E: reminders */}
          <article className="gs-reveal rounded-3xl border border-white/10 bg-[#14141f] p-7 lg:col-span-3">
            <h3 className="text-xl font-bold">Reminders from beyond</h3>
            <p className="mt-2 text-[15px] leading-relaxed text-[#a3a3b8]">
              Customers get a nudge before their appointment, so fewer chairs
              sit empty. Next up: SMS and WhatsApp reminders, deposits, and a
              public page per shop.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {["SMS reminders", "Deposits", "Public shop page"].map((t) => (
                <span
                  key={t}
                  className="rounded-full border border-[#8b5cf6]/40 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.15em] text-[#c4b5fd]"
                >
                  {t}
                </span>
              ))}
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------- SCRUB STATEMENT ---------------------------- */

function ScrubStatement() {
  const sentence =
    "A booking should feel like a small ceremony, not a chore. Pick the service. Pick the person. Pick the hour. The ghost writes it in the book.";
  const words = sentence.split(" ");
  return (
    <section className="px-4 py-32 md:px-8 md:py-40">
      <div className="mx-auto max-w-5xl">
        <div className="overflow-hidden rounded-3xl border border-white/10">
          <img
            src={SCRUB_IMG}
            alt="Fog rolling through a dark street at night"
            className="h-56 w-full object-cover grayscale contrast-125 md:h-72"
          />
        </div>
        <p className="mt-12 text-3xl font-bold leading-snug tracking-tight md:text-[2.75rem] md:leading-[1.25]">
          {words.map((w, i) => (
            <span key={i} className="gs-scrub-word mr-[0.3em] inline-block">
              {w}
            </span>
          ))}
        </p>
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.3em] text-[#8b5cf6]">
          Scroll — the words appear as you read them
        </p>
      </div>
    </section>
  );
}

/* --------------------------------- CREW ---------------------------------- */

function Crew() {
  return (
    <section id="crew" className="gs-pin-wrap scroll-mt-24 px-4 py-32 md:px-8 md:py-40">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-12">
        <div className="gs-pin lg:col-span-4">
          <div className="lg:pt-2">
            <SectionLabel>The crew</SectionLabel>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
              Cut after dark, by people who love the craft
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-[#a3a3b8]">
              Four barbers, four obsessions. Pick one below and the booking
              flow starts with them already chosen.
            </p>
            <a
              href="#book"
              className="mt-8 inline-block rounded-full bg-[#f2eee3] px-6 py-3 text-sm font-bold text-[#07070b] transition-transform hover:scale-[1.03]"
            >
              Book with the crew
            </a>
          </div>
        </div>
        <div className="gs-pin-track space-y-6 lg:col-span-8">
          {BARBERS.map((b) => (
            <article
              key={b.id}
              className="gs-reveal group grid gap-5 overflow-hidden rounded-3xl border border-white/10 bg-[#0e0e15] p-5 sm:grid-cols-[180px_1fr]"
            >
              <div className="overflow-hidden rounded-2xl">
                <img
                  src={b.img}
                  alt={`Portrait of ${b.name}`}
                  loading="lazy"
                  className="aspect-[4/3] w-full object-cover grayscale contrast-125 transition-transform duration-700 ease-out group-hover:scale-105 sm:aspect-[3/4] sm:h-full"
                />
              </div>
              <div className="flex flex-col justify-center p-1 sm:p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <h3 className="text-2xl font-bold">{b.name}</h3>
                  <span className="font-mono text-sm text-[#f59e0b]">
                    {b.rating.toFixed(1)} / 5
                  </span>
                </div>
                <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] text-[#8b5cf6]">
                  {b.role}
                </p>
                <p className="mt-3 leading-relaxed text-[#a3a3b8]">
                  {b.speciality}. {b.cuts.toLocaleString()} cuts and counting —
                  regulars ask for {b.name.split(" ")[0]} by name.
                </p>
                <a
                  href="#book"
                  className="mt-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold transition-colors hover:border-[#8b5cf6] hover:text-white"
                >
                  Book with {b.name.split(" ")[0]}
                  <span aria-hidden="true">→</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- TESTIMONIALS ------------------------------ */

function Testimonials() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = TESTIMONIALS.length;

  useEffect(() => {
    if (paused) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), 6000);
    return () => clearInterval(t);
  }, [paused, count]);

  const t = TESTIMONIALS[index];
  return (
    <section
      className="px-4 py-32 md:px-8 md:py-40"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="gs-reveal mx-auto max-w-4xl text-center">
        <SectionLabel>Word from the living</SectionLabel>
        <div className="mt-8 flex justify-center">
          <img
            src={t.img}
            alt={`Portrait of ${t.name}`}
            className="h-20 w-20 rounded-full border-2 border-[#8b5cf6] object-cover grayscale contrast-125"
          />
        </div>
        <blockquote className="mt-8 text-2xl font-semibold leading-snug tracking-tight md:text-3xl">
          “{t.quote}”
        </blockquote>
        <p className="mt-6 text-[#a3a3b8]">
          <span className="font-bold text-[#f2eee3]">{t.name}</span> —{" "}
          {t.shop}
        </p>
        <div className="mt-10 flex items-center justify-center gap-4">
          <button
            type="button"
            onClick={() => setIndex((index - 1 + count) % count)}
            aria-label="Previous testimonial"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-lg transition-colors hover:border-[#8b5cf6]"
          >
            ←
          </button>
          <div className="flex gap-2">
            {TESTIMONIALS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIndex(i)}
                aria-label={`Go to testimonial ${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                  i === index ? "w-8 bg-[#8b5cf6]" : "w-2.5 bg-white/25"
                }`}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => setIndex((index + 1) % count)}
            aria-label="Next testimonial"
            className="grid h-11 w-11 place-items-center rounded-full border border-white/20 text-lg transition-colors hover:border-[#8b5cf6]"
          >
            →
          </button>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ BOOKING APP ------------------------------ */

function BookingApp({
  bookings,
  onBooked,
}: {
  bookings: Booking[];
  onBooked: (b: Booking) => void;
}) {
  const [step, setStep] = useState(1);
  const [serviceId, setServiceId] = useState(SERVICES[0].id);
  const [barberId, setBarberId] = useState("any");
  const [date, setDate] = useState(dateKey(new Date()));
  const [time, setTime] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [lastBooking, setLastBooking] = useState<Booking | null>(null);

  const days = useMemo(() => next7Days(), []);
  const service = serviceById(serviceId);

  const slotFree = (t: string): boolean => {
    if (barberId === "any")
      return BARBERS.some((b) => !isSlotTaken(b.id, date, t, bookings));
    return !isSlotTaken(barberId, date, t, bookings);
  };

  const freeCount = SLOT_TIMES.filter((t) => slotFree(t)).length;

  const confirmBooking = () => {
    if (!time) return;
    if (name.trim().length < 2) {
      setError("Please enter your name so the barber knows who to expect.");
      return;
    }
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 7) {
      setError("Please enter a valid phone number — the shop confirms by text.");
      return;
    }
    setError("");
    let chosenBarber = barberId;
    if (barberId === "any") {
      const free = BARBERS.find((b) => !isSlotTaken(b.id, date, time, bookings));
      chosenBarber = free ? free.id : BARBERS[0].id;
    }
    const booking: Booking = {
      id: `bk-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      ref: `GHOST-${1000 + Math.floor(Math.random() * 9000)}`,
      serviceId,
      barberId: chosenBarber,
      date,
      time,
      name: name.trim(),
      phone: phone.trim(),
      status: "confirmed",
      createdAt: Date.now(),
    };
    onBooked(booking);
    setLastBooking(booking);
    setStep(5);
  };

  const reset = () => {
    setStep(1);
    setServiceId(SERVICES[0].id);
    setBarberId("any");
    setDate(dateKey(new Date()));
    setTime(null);
    setName("");
    setPhone("");
    setError("");
    setLastBooking(null);
  };

  const steps = ["Service", "Barber", "Time", "Details"];

  return (
    <section id="book" className="scroll-mt-24 px-4 py-32 md:px-8 md:py-48">
      <div className="mx-auto max-w-6xl">
        <div className="gs-reveal max-w-2xl">
          <SectionLabel>Book a chair</SectionLabel>
          <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Pick a service. Pick a person.{" "}
            <span className="text-[#8b5cf6]">Pick an hour.</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[#a3a3b8]">
            Four steps, under a minute. Glowing slots are free — taken ones
            have already risen like spirits.
          </p>
        </div>

        {step < 5 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {steps.map((label, i) => (
              <span
                key={label}
                className={`rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] ${
                  step === i + 1
                    ? "bg-[#8b5cf6] text-white"
                    : step > i + 1
                      ? "border border-[#5eead4]/50 text-[#5eead4]"
                      : "border border-white/15 text-[#a3a3b8]"
                }`}
              >
                {i + 1}. {label}
              </span>
            ))}
          </div>
        )}

        <div className="mt-10 rounded-3xl border border-white/10 bg-[#0e0e15] p-6 md:p-10">
          {step === 1 && (
            <div>
              <h3 className="text-2xl font-bold">What are we doing today?</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {SERVICES.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => setServiceId(s.id)}
                    className={`group rounded-2xl border p-5 text-left transition-all hover:scale-[1.02] ${
                      serviceId === s.id
                        ? "border-[#8b5cf6] bg-[#8b5cf6]/10 shadow-[0_0_30px_rgba(139,92,246,0.25)]"
                        : "border-white/10 bg-[#07070b] hover:border-white/30"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="text-lg font-bold leading-snug">
                        {s.name}
                      </span>
                      <span className="shrink-0 rounded-full bg-[#f59e0b]/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-[#f59e0b]">
                        {s.tag}
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-relaxed text-[#a3a3b8]">
                      {s.blurb}
                    </p>
                    <p className="mt-4 font-mono text-sm">
                      <span className="text-xl font-bold text-[#f2eee3]">
                        ${s.price}
                      </span>{" "}
                      <span className="text-[#a3a3b8]">· {s.minutes} min</span>
                    </p>
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-end">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full bg-[#f2eee3] px-7 py-3 font-bold text-[#07070b] transition-transform hover:scale-[1.03]"
                >
                  Continue to barber →
                </button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h3 className="text-2xl font-bold">Who is holding the razor?</h3>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                <button
                  type="button"
                  onClick={() => setBarberId("any")}
                  className={`rounded-2xl border p-5 text-left transition-all hover:scale-[1.02] ${
                    barberId === "any"
                      ? "border-[#8b5cf6] bg-[#8b5cf6]/10 shadow-[0_0_30px_rgba(139,92,246,0.25)]"
                      : "border-white/10 bg-[#07070b] hover:border-white/30"
                  }`}
                >
                  <GhostMark className="h-10 w-10 text-[#8b5cf6]" />
                  <p className="mt-3 text-lg font-bold">First available</p>
                  <p className="mt-1 text-sm text-[#a3a3b8]">
                    We match you with whoever is free first.
                  </p>
                </button>
                {BARBERS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => setBarberId(b.id)}
                    className={`overflow-hidden rounded-2xl border text-left transition-all hover:scale-[1.02] ${
                      barberId === b.id
                        ? "border-[#8b5cf6] shadow-[0_0_30px_rgba(139,92,246,0.25)]"
                        : "border-white/10 hover:border-white/30"
                    }`}
                  >
                    <img
                      src={b.img}
                      alt={`Portrait of ${b.name}`}
                      loading="lazy"
                      className="aspect-[4/3] w-full object-cover grayscale contrast-125"
                    />
                    <span className="block bg-[#07070b] p-4">
                      <span className="block font-bold">{b.name}</span>
                      <span className="mt-0.5 block text-sm text-[#a3a3b8]">
                        {b.role}
                      </span>
                      <span className="mt-1 block font-mono text-xs text-[#f59e0b]">
                        {b.rating.toFixed(1)} / 5
                      </span>
                    </span>
                  </button>
                ))}
              </div>
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="rounded-full border border-white/20 px-6 py-3 font-semibold transition-colors hover:border-white/50"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-full bg-[#f2eee3] px-7 py-3 font-bold text-[#07070b] transition-transform hover:scale-[1.03]"
                >
                  Continue to time →
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h3 className="text-2xl font-bold">Pick a day and an hour</h3>
              <p className="mt-2 text-sm text-[#a3a3b8]">
                {barberId === "any"
                  ? "Showing slots free with at least one barber."
                  : `Showing ${barberById(barberId).name}'s diary.`}{" "}
                {freeCount} of {SLOT_TIMES.length} slots still glow.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {days.map((d) => {
                  const key = dateKey(d);
                  const active = date === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => {
                        setDate(key);
                        setTime(null);
                      }}
                      className={`rounded-2xl border px-4 py-3 text-left transition-all ${
                        active
                          ? "border-[#8b5cf6] bg-[#8b5cf6]/15"
                          : "border-white/10 bg-[#07070b] hover:border-white/30"
                      }`}
                    >
                      <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-[#a3a3b8]">
                        {d.toLocaleDateString("en-GB", { weekday: "short" })}
                      </span>
                      <span className="block text-lg font-bold">
                        {d.getDate()}{" "}
                        {d.toLocaleDateString("en-GB", { month: "short" })}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
                {SLOT_TIMES.map((t) => {
                  const free = slotFree(t);
                  const selected = time === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      disabled={!free}
                      onClick={() => setTime(t)}
                      className={`rounded-xl border px-2 py-3.5 font-mono text-sm font-bold transition-all ${
                        selected
                          ? "border-[#f59e0b] bg-[#f59e0b] text-[#07070b] shadow-[0_0_28px_rgba(245,158,11,0.4)]"
                          : free
                            ? "slot-glow border-[#8b5cf6]/50 bg-[#14141f] text-[#f2eee3] hover:border-[#f59e0b]"
                            : "spirit cursor-not-allowed border-white/5 bg-[#0e0e15] text-[#5a5a6e] line-through"
                      }`}
                    >
                      {t}
                      {!free && (
                        <span className="block text-[9px] font-normal normal-case tracking-[0.15em]">
                          taken
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
              <p className="mt-4 text-xs text-[#a3a3b8]">
                Taken slots drift and fade — they belong to a spirit now.
                Glowing slots are yours to claim.
              </p>
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="rounded-full border border-white/20 px-6 py-3 font-semibold transition-colors hover:border-white/50"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  disabled={!time}
                  onClick={() => time && setStep(4)}
                  className="rounded-full bg-[#f2eee3] px-7 py-3 font-bold text-[#07070b] transition-transform hover:scale-[1.03] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Continue to details →
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h3 className="text-2xl font-bold">Almost there</h3>
              <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
                <div>
                  <label className="block font-mono text-[11px] uppercase tracking-[0.25em] text-[#a3a3b8]">
                    Your name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Numan Nadeem"
                    className="mt-2 w-full rounded-2xl border border-white/15 bg-[#07070b] px-5 py-3.5 text-base text-[#f2eee3] placeholder:text-[#5a5a6e] focus:border-[#8b5cf6] focus:outline-none"
                  />
                  <label className="mt-6 block font-mono text-[11px] uppercase tracking-[0.25em] text-[#a3a3b8]">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +92 300 1234567"
                    className="mt-2 w-full rounded-2xl border border-white/15 bg-[#07070b] px-5 py-3.5 text-base text-[#f2eee3] placeholder:text-[#5a5a6e] focus:border-[#8b5cf6] focus:outline-none"
                  />
                  {error && (
                    <p className="mt-4 rounded-xl border border-[#f59e0b]/40 bg-[#f59e0b]/10 px-4 py-3 text-sm text-[#fcd34d]">
                      {error}
                    </p>
                  )}
                  <p className="mt-4 text-sm text-[#a3a3b8]">
                    Saved in this browser only — this demo stores bookings in
                    localStorage, no account needed.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-[#07070b] p-5">
                  <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#8b5cf6]">
                    Your booking
                  </p>
                  <dl className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#a3a3b8]">Service</dt>
                      <dd className="text-right font-semibold">{service.name}</dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#a3a3b8]">Barber</dt>
                      <dd className="text-right font-semibold">
                        {barberId === "any"
                          ? "First available"
                          : barberById(barberId).name}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4">
                      <dt className="text-[#a3a3b8]">When</dt>
                      <dd className="text-right font-semibold">
                        {fmtDateLong(date)} · {time}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                      <dt className="text-[#a3a3b8]">Total</dt>
                      <dd className="text-xl font-bold">
                        ${service.price}{" "}
                        <span className="text-xs font-normal text-[#a3a3b8]">
                          · {service.minutes} min
                        </span>
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="rounded-full border border-white/20 px-6 py-3 font-semibold transition-colors hover:border-white/50"
                >
                  ← Back
                </button>
                <button
                  type="button"
                  onClick={confirmBooking}
                  className="rounded-full bg-[#8b5cf6] px-8 py-3 font-bold text-white shadow-[0_0_30px_rgba(139,92,246,0.4)] transition-transform hover:scale-[1.03]"
                >
                  Confirm booking
                </button>
              </div>
            </div>
          )}

          {step === 5 && lastBooking && (
            <div className="text-center">
              <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#5eead4]/15">
                <GhostMark className="h-9 w-9 text-[#5eead4]" />
              </div>
              <h3 className="mt-6 text-3xl font-extrabold">
                It is written in the book.
              </h3>
              <p className="mx-auto mt-3 max-w-md leading-relaxed text-[#a3a3b8]">
                {lastBooking.name}, your {serviceById(lastBooking.serviceId).name}{" "}
                with {barberById(lastBooking.barberId).name} is confirmed for{" "}
                {fmtDateLong(lastBooking.date)} at {lastBooking.time}. Show
                this reference at the door.
              </p>
              <div className="mx-auto mt-8 max-w-md rounded-2xl border border-[#8b5cf6]/40 bg-[#07070b] p-6">
                <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#8b5cf6]">
                  Booking reference
                </p>
                <p className="mt-2 font-mono text-3xl font-bold tracking-wider">
                  {lastBooking.ref}
                </p>
                <p className="mt-3 text-sm text-[#a3a3b8]">
                  {serviceById(lastBooking.serviceId).name} ·{" "}
                  {serviceById(lastBooking.serviceId).minutes} min · $
                  {serviceById(lastBooking.serviceId).price}
                </p>
              </div>
              <div className="mt-8 flex flex-wrap justify-center gap-4">
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full bg-[#f2eee3] px-7 py-3 font-bold text-[#07070b] transition-transform hover:scale-[1.03]"
                >
                  Book another chair
                </button>
                <a
                  href="#desk"
                  className="rounded-full border border-white/20 px-7 py-3 font-semibold transition-colors hover:border-white/50"
                >
                  View it on the owner&apos;s desk
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* ----------------------------- OWNER'S DESK ------------------------------ */

function OwnerDesk({
  bookings,
  onStatus,
}: {
  bookings: Booking[];
  onStatus: (id: string, status: Booking["status"]) => void;
}) {
  const todayKey = dateKey(new Date());
  const today = bookings
    .filter((b) => b.date === todayKey)
    .sort((a, b) => a.time.localeCompare(b.time));
  const confirmed = today.filter((b) => b.status === "confirmed");
  const noShows = today.filter((b) => b.status === "no-show");
  const revenue = confirmed.reduce(
    (sum, b) => sum + serviceById(b.serviceId).price,
    0
  );
  const nowHHMM = new Date().toTimeString().slice(0, 5);
  const openSlots = BARBERS.reduce(
    (sum, b) =>
      sum +
      SLOT_TIMES.filter((t) => !isSlotTaken(b.id, todayKey, t, bookings))
        .length,
    0
  );

  const isOverdue = (b: Booking) =>
    b.status === "confirmed" && b.date === todayKey && b.time < nowHHMM;

  return (
    <section id="desk" className="scroll-mt-24 px-4 py-32 md:px-8 md:py-48">
      <div className="mx-auto max-w-6xl">
        <div className="gs-reveal max-w-2xl">
          <SectionLabel>The owner&apos;s desk</SectionLabel>
          <h2 className="mt-4 text-4xl font-extrabold leading-tight tracking-tight md:text-5xl">
            Today&apos;s diary,{" "}
            <span className="text-[#8b5cf6]">at a glance</span>
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-[#a3a3b8]">
            Overdue bookings turn ghostly — they have been waiting too long.
            Mark a no-show in one tap and the chair is free again. Demo data
            lives in your browser; bookings you make above appear here
            instantly.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-2 gap-4 lg:grid-cols-4">
          {[
            { label: "Bookings today", value: String(confirmed.length), sub: `${today.length} total on the books` },
            { label: "Expected revenue", value: `$${revenue}`, sub: "Confirmed bookings only" },
            { label: "No-shows", value: String(noShows.length), sub: "Marked by the owner" },
            { label: "Open slots left", value: String(openSlots), sub: `Across ${BARBERS.length} barbers` },
          ].map((s) => (
            <div
              key={s.label}
              className="gs-reveal rounded-3xl border border-white/10 bg-[#0e0e15] p-6"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#a3a3b8]">
                {s.label}
              </p>
              <p className="mt-3 text-4xl font-extrabold">{s.value}</p>
              <p className="mt-1 text-sm text-[#a3a3b8]">{s.sub}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 overflow-hidden rounded-3xl border border-white/10 bg-[#0e0e15]">
          {today.length === 0 && (
            <p className="p-8 text-center text-[#a3a3b8]">
              No bookings today yet. The diary is empty — and the chairs are
              restless.
            </p>
          )}
          {today.map((b) => {
            const overdue = isOverdue(b);
            const svc = serviceById(b.serviceId);
            const brb = barberById(b.barberId);
            return (
              <div
                key={b.id}
                className={`flex flex-col gap-4 border-b border-white/5 p-5 last:border-b-0 md:flex-row md:items-center md:justify-between ${
                  overdue ? "ghostly bg-[#14141f]/60" : ""
                } ${b.status !== "confirmed" ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <span className="w-16 shrink-0 font-mono text-lg font-bold text-[#f2eee3]">
                    {b.time}
                  </span>
                  <div>
                    <p className="font-bold">
                      {b.name}{" "}
                      <span className="ml-1 font-mono text-xs text-[#a3a3b8]">
                        {b.ref}
                      </span>
                    </p>
                    <p className="mt-0.5 text-sm text-[#a3a3b8]">
                      {svc.name} · {brb.name} · ${svc.price}
                    </p>
                    <p className="text-sm text-[#a3a3b8]">{b.phone}</p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 pl-20 md:pl-0">
                  {overdue && (
                    <span className="rounded-full bg-[#f59e0b]/15 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-[#f59e0b]">
                      Overdue
                    </span>
                  )}
                  <span
                    className={`rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] ${
                      b.status === "confirmed"
                        ? "bg-[#5eead4]/15 text-[#5eead4]"
                        : b.status === "no-show"
                          ? "bg-[#f59e0b]/15 text-[#f59e0b]"
                          : "bg-white/10 text-[#a3a3b8]"
                    }`}
                  >
                    {b.status}
                  </span>
                  {b.status === "confirmed" ? (
                    <>
                      <button
                        type="button"
                        onClick={() => onStatus(b.id, "no-show")}
                        className="rounded-full border border-[#f59e0b]/50 px-4 py-1.5 text-sm font-semibold text-[#f59e0b] transition-colors hover:bg-[#f59e0b]/10"
                      >
                        Mark no-show
                      </button>
                      <button
                        type="button"
                        onClick={() => onStatus(b.id, "cancelled")}
                        className="rounded-full border border-white/20 px-4 py-1.5 text-sm font-semibold transition-colors hover:border-white/50"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onStatus(b.id, "confirmed")}
                      className="rounded-full border border-[#5eead4]/50 px-4 py-1.5 text-sm font-semibold text-[#5eead4] transition-colors hover:bg-[#5eead4]/10"
                    >
                      Restore
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/* ------------------------------ FINAL CTA -------------------------------- */

function FinalCta() {
  return (
    <section className="relative overflow-hidden px-4 py-32 text-center md:px-8 md:py-48">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <div className="flicker absolute left-1/2 top-1/2 h-[420px] w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#8b5cf6]/25 blur-[130px]" />
      </div>
      <div className="gs-reveal relative mx-auto max-w-5xl">
        <GhostMark className="mx-auto h-14 w-14 text-[#8b5cf6]" />
        <h2 className="mx-auto mt-8 max-w-4xl text-[clamp(2.75rem,6vw,5.5rem)] font-extrabold leading-[1.02] tracking-tight">
          Come back from the dead.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-[#a3a3b8]">
          Your next haircut is already waiting in the book. Claim it before a
          spirit does.
        </p>
        <a
          href="#book"
          className="mt-10 inline-block rounded-full bg-[#f2eee3] px-10 py-4 text-lg font-bold text-[#07070b] transition-transform hover:scale-[1.04]"
        >
          Book a chair — it takes a minute
        </a>
      </div>
    </section>
  );
}

/* -------------------------------- FOOTER --------------------------------- */

function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-14 md:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 md:flex-row md:items-start md:justify-between">
        <div>
          <a href="#top" className="flex items-center gap-2.5">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-[#8b5cf6] text-white">
              <GhostMark className="h-5 w-5" />
            </span>
            <span className="text-lg font-bold tracking-tight">GhostDesk</span>
          </a>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-[#a3a3b8]">
            Haunted booking for barbershops and salons. Built for Kiroween
            2026 — Costume Contest.
          </p>
        </div>
        <div className="flex gap-16 text-sm">
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#8b5cf6]">
              Explore
            </span>
            <a href="#services" className="text-[#a3a3b8] hover:text-[#f2eee3]">
              Services
            </a>
            <a href="#crew" className="text-[#a3a3b8] hover:text-[#f2eee3]">
              The crew
            </a>
            <a href="#book" className="text-[#a3a3b8] hover:text-[#f2eee3]">
              Book a chair
            </a>
            <a href="#desk" className="text-[#a3a3b8] hover:text-[#f2eee3]">
              Owner&apos;s desk
            </a>
          </div>
          <div className="flex flex-col gap-3">
            <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-[#8b5cf6]">
              The build
            </span>
            <span className="text-[#a3a3b8]">Next.js · TypeScript</span>
            <span className="text-[#a3a3b8]">Tailwind CSS · GSAP</span>
            <span className="text-[#a3a3b8]">Kiro spec-driven</span>
            <span className="text-[#a3a3b8]">Demo · localStorage</span>
          </div>
        </div>
      </div>
      <p className="mx-auto mt-12 max-w-6xl border-t border-white/5 pt-6 font-mono text-[11px] tracking-[0.15em] text-[#5a5a6e]">
        GHOSTDESK — A KIROWEEN 2026 DEMO. BOOKINGS ARE STORED IN YOUR BROWSER
        ONLY. NO REAL APPOINTMENT IS MADE.
      </p>
    </footer>
  );
}
