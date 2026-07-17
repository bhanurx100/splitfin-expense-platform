import type { Config } from "tailwindcss";

/**
 * SplitFin "Aurora" — final Tailwind configuration.
 *
 * Colors reference the full-value CSS variables defined in `app/globals.css`
 * (e.g. --primary: #7c3cff). Tailwind v3 cannot statically parse var() colors,
 * so alpha modifiers (bg-primary/15, text-foreground/90, outline-ring/50…)
 * are emitted through its color-mix() fallback — which is exactly what the
 * Premium UI components rely on.
 */
const config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./shared/**/*.{ts,tsx}",
    "./features/**/*.{ts,tsx}",
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
        sans: ["Inter", "system-ui", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["DM Mono", "SF Mono", "Fira Code", "monospace"],
      },

      /* ── Aurora design tokens (full-value CSS variables) ────────────── */
      colors: {
        border:     "var(--border)",
        input:      "var(--input)",
        ring:       "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",

        primary: {
          DEFAULT:    "var(--primary)",
          bright:     "var(--primary-bright)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT:    "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT:    "var(--destructive)",
          foreground: "var(--destructive)",
        },
        muted: {
          DEFAULT:    "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT:    "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT:    "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT:    "var(--card)",
          foreground: "var(--card-foreground)",
        },

        /* Aurora semantic accents */
        positive: "var(--positive)",
        negative: "var(--negative)",
        info:     "var(--info)",
        warning:  "var(--warning)",

        /* Glass materials & surfaces */
        glass: {
          DEFAULT: "var(--glass)",
          strong:  "var(--glass-strong)",
        },
        surface: {
          DEFAULT:  "var(--surface)",
          elevated: "var(--surface-elevated)",
        },
      },

      /* ── Border radius — Aurora scale ───────────────────────────────── */
      borderRadius: {
        sm:   "12px",
        md:   "16px",
        lg:   "20px",
        xl:   "24px",
        "2xl": "28px",
        "3xl": "32px",
        "4xl": "36px",
        full: "9999px",
      },

      /* ── Box shadows ────────────────────────────────────────────────── */
      boxShadow: {
        xs:    "0 1px 2px 0 rgb(0 0 0 / 0.04)",
        sm:    "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        md:    "0 4px 6px -1px rgb(0 0 0 / 0.06), 0 2px 4px -2px rgb(0 0 0 / 0.04)",
        lg:    "0 10px 15px -3px rgb(0 0 0 / 0.06), 0 4px 6px -4px rgb(0 0 0 / 0.04)",
        xl:    "0 20px 25px -5px rgb(0 0 0 / 0.06), 0 8px 10px -6px rgb(0 0 0 / 0.04)",
        card:  "0 1px 3px 0 rgb(0 0 0 / 0.06), 0 1px 2px -1px rgb(0 0 0 / 0.04)",
        glow:  "0 0 20px rgba(124, 60, 255, 0.35)",
        // Legacy — keep for compat
        DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      },

      /* ── Spacing — Aurora additions (size-4.5 / size-13 utilities) ──── */
      spacing: {
        "4.5":  "1.125rem",
        "13":   "3.25rem",
        "safe": "env(safe-area-inset-bottom, 16px)",
      },

      /* ── Animation / keyframes (retained) ───────────────────────────── */
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to:   { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to:   { height: "0" },
        },
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
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up":   "accordion-up 0.2s ease-out",
        "page-enter":     "pageEnter 0.35s cubic-bezier(0.16, 1, 0.3, 1) both",
        "slide-up":       "slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both",
        "fade-in":        "fadeIn 0.2s ease-out both",
        "scale-in":       "scaleIn 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) both",
        shimmer:          "shimmer 1.4s ease-in-out infinite",
        "count-pop":      "countPop 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
      },

      /* ── Max widths ─────────────────────────────────────────────────── */
      maxWidth: {
        content: "1280px",
        narrow:  "720px",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
