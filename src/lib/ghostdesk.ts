export type Service = {
  id: string;
  name: string;
  blurb: string;
  price: number;
  minutes: number;
  tag: string;
};

export const SERVICES: Service[] = [
  {
    id: "signature-cut",
    name: "Signature Haircut",
    blurb: "Consult, cut, hot-lather neckline and style. The house classic.",
    price: 28,
    minutes: 45,
    tag: "Most booked",
  },
  {
    id: "beard-sculpt",
    name: "Beard Sculpt",
    blurb: "Shape, razor line-up and beard oil finish. Sharp enough to haunt.",
    price: 18,
    minutes: 30,
    tag: "Quick",
  },
  {
    id: "hot-towel-shave",
    name: "Hot Towel Shave",
    blurb: "Steam towels, straight razor, cold-towel close. Old-school ritual.",
    price: 24,
    minutes: 30,
    tag: "Ritual",
  },
  {
    id: "colour-style",
    name: "Colour & Style",
    blurb: "Full colour, gloss and a restyle with your colourist. 90 minutes of calm.",
    price: 55,
    minutes: 90,
    tag: "Premium",
  },
  {
    id: "kids-cut",
    name: "Kids Cut",
    blurb: "Patient, gentle cut for under-12s. Capes, comics and zero tears.",
    price: 20,
    minutes: 30,
    tag: "Family",
  },
];

export type Barber = {
  id: string;
  name: string;
  role: string;
  speciality: string;
  rating: number;
  cuts: number;
  img: string;
};

export const BARBERS: Barber[] = [
  {
    id: "silas",
    name: "Silas Graves",
    role: "Master Barber",
    speciality: "Fades & classic cuts",
    rating: 4.9,
    cuts: 2841,
    img: "/images/ghostdesk-silas.jpg",
  },
  {
    id: "morticia",
    name: "Morticia Vane",
    role: "Colourist",
    speciality: "Colour & restyles",
    rating: 5.0,
    cuts: 1974,
    img: "/images/ghostdesk-morticia.jpg",
  },
  {
    id: "bram",
    name: "Bram Hollow",
    role: "Senior Barber",
    speciality: "Beards & hot towel shaves",
    rating: 4.8,
    cuts: 2310,
    img: "/images/ghostdesk-bram.jpg",
  },
  {
    id: "luna",
    name: "Luna Nightshade",
    role: "Stylist",
    speciality: "Kids cuts & modern styles",
    rating: 4.9,
    cuts: 1652,
    img: "/images/ghostdesk-luna.jpg",
  },
];

export type BookingStatus = "confirmed" | "no-show" | "cancelled";

export type Booking = {
  id: string;
  ref: string;
  serviceId: string;
  barberId: string;
  date: string; // YYYY-MM-DD
  time: string; // "10:30"
  name: string;
  phone: string;
  status: BookingStatus;
  createdAt: number;
};

export const STORAGE_KEY = "ghostdesk-bookings-v1";

export const SLOT_TIMES = [
  "10:00",
  "10:30",
  "11:00",
  "11:30",
  "12:00",
  "12:30",
  "13:00",
  "14:00",
  "14:30",
  "15:00",
  "15:30",
  "16:00",
  "16:30",
  "17:00",
  "17:30",
  "18:00",
  "18:30",
  "19:00",
];

export function next7Days(): Date[] {
  const days: Date[] = [];
  const now = new Date();
  for (let i = 0; i < 7; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    days.push(d);
  }
  return days;
}

export function dateKey(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function fmtDate(d: Date): string {
  return d.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function fmtDateLong(iso: string): string {
  const [y, m, day] = iso.split("-").map(Number);
  return new Date(y, m - 1, day).toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Deterministic hash 0..1 so the same barber+date+slot is always taken or free. */
export function hash01(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/** A slot is taken if a confirmed booking exists, or the house spirits already claimed it. */
export function isSlotTaken(
  barberId: string,
  date: string,
  time: string,
  bookings: Booking[]
): boolean {
  if (
    bookings.some(
      (b) =>
        b.barberId === barberId &&
        b.date === date &&
        b.time === time &&
        b.status === "confirmed"
    )
  )
    return true;
  return hash01(`${barberId}|${date}|${time}`) < 0.34;
}

export function serviceById(id: string): Service {
  return SERVICES.find((s) => s.id === id) ?? SERVICES[0];
}

export function barberById(id: string): Barber {
  return BARBERS.find((b) => b.id === id) ?? BARBERS[0];
}

export function loadBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Booking[];
  } catch {
    return [];
  }
}

export function saveBookings(bookings: Booking[]) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings));
}

/** Demo bookings for today so the Owner's Desk is alive on first visit. */
export function seedDemoBookings(): Booking[] {
  const today = dateKey(new Date());
  const now = Date.now();
  const mk = (
    id: string,
    ref: string,
    serviceId: string,
    barberId: string,
    time: string,
    name: string,
    phone: string,
    createdAt: number
  ): Booking => ({
    id,
    ref,
    serviceId,
    barberId,
    date: today,
    time,
    name,
    phone,
    status: "confirmed",
    createdAt,
  });
  return [
    mk("demo-1", "GHOST-1042", "signature-cut", "silas", "10:00", "Aarav Mehta", "+92 300 1112233", now - 7200_000),
    mk("demo-2", "GHOST-1043", "beard-sculpt", "bram", "11:30", "Danish Ali", "+92 333 4455667", now - 6600_000),
    mk("demo-3", "GHOST-1044", "hot-towel-shave", "bram", "13:00", "Omar Farooq", "+92 321 7788990", now - 5400_000),
    mk("demo-4", "GHOST-1045", "colour-style", "morticia", "15:00", "Sara Khan", "+92 345 1234567", now - 3600_000),
    mk("demo-5", "GHOST-1046", "kids-cut", "luna", "16:30", "Bilal Ahmed", "+92 302 9876543", now - 1800_000),
  ];
}

export const TESTIMONIALS = [
  {
    quote:
      "We used to lose three or four bookings a week to missed calls. GhostDesk took the phone out of the equation — customers book, we cut.",
    name: "Rosa Delgado",
    shop: "Rosa's Chair, Austin",
    img: "/images/ghostdesk-rosa.jpg",
  },
  {
    quote:
      "The no-show radar paid for itself in the first fortnight. Overdue bookings glow, I tap once, and the slot is free again.",
    name: "Marcus Webb",
    shop: "Webb & Sons Barbers, Leeds",
    img: "/images/ghostdesk-marcus.jpg",
  },
  {
    quote:
      "My regulars think the midnight theme is a joke until they book at 2am from their sofa. Then they never call the shop again.",
    name: "Priya Nair",
    shop: "The Velvet Comb, Toronto",
    img: "/images/ghostdesk-priya.jpg",
  },
];

export const HERO_IMG =
  "/images/ghostdesk-hero.jpg";
export const BENTO_IMG =
  "/images/ghostdesk-shop.jpg";
export const SCRUB_IMG =
  "/images/ghostdesk-night.jpg";
