import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: { "2xl": "1400px" },
    },
    extend: {
      /* ── Font family ────────────────────────────────────────────────── */
      fontFamily: {
        sans: ["DM Sans", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["DM Mono", "SF Mono", "Fira Code", "monospace"],
      },

      /* ── Design System colors ───────────────────────────────────────── */
      colors: {
        border:      "hsl(var(--border))",
        input:       "hsl(var(--input))",
        ring:        "hsl(var(--ring))",
        background:  "hsl(var(--background))",
        foreground:  "hsl(var(--foreground))",

        primary: {
          DEFAULT:    "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT:    "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT:    "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT:    "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT:    "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT:    "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT:    "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },

        /* Finance semantic colors */
        income:  "#059669",
        expense: "#dc2626",
        surface: {
          base:    "#f8fafc",
          card:    "#ffffff",
          overlay: "#f1f5f9",
          hover:   "#f8fafc",
        },
      },

      /* ── Border radius ──────────────────────────────────────────────── */
      borderRadius: {
        sm:   "6px",
        md:   "10px",
        lg:   "14px",     /* shadcn default override */
        xl:   "18px",
        "2xl":"22px",
        "3xl":"28px",
        full: "9999px",
      },

      /* ── Box shadows ────────────────────────────────────────────────── */
      boxShadow: {
        xs:    "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        sm:    "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        md:    "0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
        lg:    "0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
        xl:    "0 20px 25px -5px rgb(0 0 0 / 0.06), 0 8px 10px -6px rgb(0 0 0 / 0.04)",
        brand: "0 4px 14px 0 rgb(37 99 235 / 0.18)",
        card:  "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        // Legacy — keep for compat
        DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      },

      /* ── Font sizes ─────────────────────────────────────────────────── */
      fontSize: {
        "2xs": ["0.6875rem", { lineHeight: "1rem" }],    /* 11px */
        xs:    ["0.75rem",   { lineHeight: "1rem" }],    /* 12px */
        sm:    ["0.8125rem", { lineHeight: "1.25rem" }], /* 13px */
        base:  ["0.9375rem", { lineHeight: "1.5rem" }],  /* 15px */
        lg:    ["1.0625rem", { lineHeight: "1.75rem" }], /* 17px */
        xl:    ["1.25rem",   { lineHeight: "1.75rem" }], /* 20px */
        "2xl": ["1.5rem",    { lineHeight: "2rem" }],    /* 24px */
        "3xl": ["1.875rem",  { lineHeight: "2.25rem" }], /* 30px */
        "4xl": ["2.25rem",   { lineHeight: "2.5rem" }],  /* 36px */
      },

      /* ── Animation / keyframes ──────────────────────────────────────── */
      keyframes: {
        /* shadcn accordion */
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },

        /* Design system */
        pageEnter: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(18px)" },
          to:   { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to:   { opacity: "1" },
        },
        scaleIn: {
          from: { opacity: "0", transform: "scale(0.96)" },
          to:   { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        countPop: {
          "0%":   { transform: "scale(1)" },
          "50%":  { transform: "scale(1.04)" },
          "100%": { transform: "scale(1)" },
        },
        ping: {
          "75%, 100%": { transform: "scale(2)", opacity: "0" },
        },
      },

      animation: {
        /* shadcn */
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",

        /* Design system */
        "page-enter": "pageEnter 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-up":   "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in":    "fadeIn 0.2s ease-out both",
        "scale-in":   "scaleIn 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        shimmer:      "shimmer 1.4s ease-in-out infinite",
        "count-pop":  "countPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      /* ── Spacing ────────────────────────────────────────────────────── */
      spacing: {
        "safe": "env(safe-area-inset-bottom, 16px)",
      },

      /* ── Max widths ─────────────────────────────────────────────────── */
      maxWidth: {
        "content": "1280px",
        "narrow":  "720px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;