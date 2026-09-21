import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

// Inter carries the interface (labels, times, buttons, data) — legible at
// small sizes in a narrow calendar cell. Fraunces carries the editorial
// voice (headings, month names, section titles) — the hand-painted,
// letterpress feeling from the group's artwork, without touching legibility
// anywhere it matters.
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-inter",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-fraunces",
});

export const metadata: Metadata = {
  title: "MVCC Moms Connect — Playdate Calendar",
  description: "2027 playdate calendar for MVCC Moms Connect",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${fraunces.variable} font-sans bg-cream text-ink antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
