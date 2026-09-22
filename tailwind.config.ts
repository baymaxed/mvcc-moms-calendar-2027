import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand — sampled directly from the group's official artwork/moodboard
        pine: "#23402F", // deep forest green — headings, primary ink
        sage: "#7C9C86", // muted sage green — secondary accents, leaves
        sagetint: "#EAF1EC",
        teal: "#3F6B7A", // muted blue — the brand's main interactive color
        tealdeep: "#2C4F5B",
        sky: "#BED9EC", // powder blue — soft fills, the "everything's fine" tint
        skytint: "#EEF6FB",
        terracotta: "#C97B5C", // earthy accent — used sparingly for warmth/CTA emphasis
        terracottatint: "#F5E7DF",
        cream: "#F3F0E7", // parchment/linen — the page's canvas, not stark white
        paper: "#FCFBF7", // warm near-white for cards sitting on the cream canvas
        ink: "#20262B",
        // Status — matched to the moodboard's own calendar mock (blue = as
        // scheduled, gold = moved, terracotta-red = cancelled) rather than a
        // generic green/amber/red traffic light
        confirmed: "#3F6B7A",
        confirmedtint: "#DCEBF3",
        // A punchier version of "confirmed" used only for the calendar's
        // date-dot, which needs to read clearly on the dark grid — the
        // softer teal above stays for badges/cards on light backgrounds
        confirmedvivid: "#1789B3",
        moved: "#8A5F13",
        movedtint: "#F8E2B0",
        cancelled: "#A14A3D",
        cancelledtint: "#F1CEC7",
        weather: "#5C7D5F",
        weathertint: "#E7F0E5",
      },
      fontFamily: {
        // Inter for anything functional (UI chrome, labels, times, data) —
        // Fraunces for anything editorial (headings, month names, section
        // titles) so the app reads as a curated print piece, not a SaaS tool
        sans: ["var(--font-inter)", "-apple-system", "Helvetica Neue", "Arial", "sans-serif"],
        serif: ["var(--font-fraunces)", "Georgia", "serif"],
      },
      borderRadius: {
        card: "20px",
        chip: "12px",
        sheet: "28px",
      },
      keyframes: {
        slideUp: {
          "0%": { transform: "translateY(24px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideFromRight: {
          "0%": { transform: "translateX(28px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideFromLeft: {
          "0%": { transform: "translateX(-28px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        popIn: {
          "0%": { transform: "scale(0.96)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
      animation: {
        "slide-up": "slideUp 0.32s cubic-bezier(0.16,1,0.3,1)",
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-from-right": "slideFromRight 0.22s cubic-bezier(0.16,1,0.3,1)",
        "slide-from-left": "slideFromLeft 0.22s cubic-bezier(0.16,1,0.3,1)",
        "pop-in": "popIn 0.18s cubic-bezier(0.16,1,0.3,1)",
      },
    },
  },
  plugins: [],
};
export default config;
