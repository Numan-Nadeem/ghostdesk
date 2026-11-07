import type { Metadata } from "next";
import { Geist_Mono, Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "GhostDesk — Haunted Booking for Barbershops & Salons",
  description:
    "GhostDesk is a full-stack booking and client-management app for barbershops and salons. Customers book online in under a minute; owners manage staff, slots and no-shows. Built with Kiro for Kiroween 2026, Costume Contest.",
  icons: {
    icon: "/favicon.svg",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} ${geistMono.variable} grain`}>
        {children}
      </body>
    </html>
  );
}
