/**
 * SplitFin Design Tokens
 * Single source of truth for all visual constants.
 * Dark-only theme. Glassmorphism. Neon accents.
 */

// ─── Color Palette ──────────────────────────────────────────────────────────

export const colors = {
  // Background layers
  bg: {
    /** True black base */
    base: "#030712",
    /** Primary surface (cards, sheets) */
    surface: "rgba(255, 255, 255, 0.04)",
    /** Elevated surface (modals, popovers) */
    elevated: "rgba(255, 255, 255, 0.07)",
    /** Active / hover state */
    active: "rgba(255, 255, 255, 0.10)",
    /** Overlay backdrop */
    overlay: "rgba(3, 7, 18, 0.80)",
  },

  // Neon brand accents
  accent: {
    /** Pink — primary CTA, danger actions */
    pink: "#FF008C",
    pinkMuted: "rgba(255, 0, 140, 0.15)",
    pinkGlow: "rgba(255, 0, 140, 0.35)",
    pinkBorder: "rgba(255, 0, 140, 0.40)",

    /** Purple — groups, secondary actions */
    purple: "#7C3AED",
    purpleMuted: "rgba(124, 58, 237, 0.15)",
    purpleGlow: "rgba(124, 58, 237, 0.35)",
    purpleBorder: "rgba(124, 58, 237, 0.40)",

    /** Cyan — income, positive balances, confirmation */
    cyan: "#00FFD0",
    cyanMuted: "rgba(0, 255, 208, 0.12)",
    cyanGlow: "rgba(0, 255, 208, 0.30)",
    cyanBorder: "rgba(0, 255, 208, 0.35)",
  },

  // Semantic colors
  semantic: {
    /** Positive / you will receive */
    positive: "#00FFD0",
    positiveText: "#00D4AE",
    /** Negative / you will pay */
    negative: "#FF4472",
    negativeText: "#FF6B8F",
    /** Warning / pending */
    warning: "#FFB800",
    warningMuted: "rgba(255, 184, 0, 0.15)",
    /** Success / settled */
    success: "#00D68F",
    successMuted: "rgba(0, 214, 143, 0.15)",
  },

  // Text hierarchy
  text: {
    primary: "#F9FAFB",
    secondary: "rgba(249, 250, 251, 0.65)",
    tertiary: "rgba(249, 250, 251, 0.38)",
    inverse: "#030712",
    disabled: "rgba(249, 250, 251, 0.25)",
  },

  // Glass borders
  border: {
    subtle: "rgba(255, 255, 255, 0.06)",
    default: "rgba(255, 255, 255, 0.10)",
    strong: "rgba(255, 255, 255, 0.18)",
    focus: "rgba(124, 58, 237, 0.60)",
  },
} as const

// ─── Typography ──────────────────────────────────────────────────────────────

export const typography = {
  fontFamily: {
    sans: "'Inter', system-ui, -apple-system, sans-serif",
    mono: "'JetBrains Mono', 'Fira Code', monospace",
  },

  // Scale (rem)
  size: {
    "2xs": "0.625rem",  // 10px
    xs:   "0.75rem",   // 12px
    sm:   "0.875rem",  // 14px
    base: "1rem",      // 16px
    lg:   "1.125rem",  // 18px
    xl:   "1.25rem",   // 20px
    "2xl":"1.5rem",    // 24px
    "3xl":"1.875rem",  // 30px
    "4xl":"2.25rem",   // 36px
    "5xl":"3rem",      // 48px
  },

  // Weight
  weight: {
    regular: "400",
    medium:  "500",
    semibold:"600",
    bold:    "700",
    black:   "900",
  },

  // Line height
  leading: {
    tight:  "1.15",
    snug:   "1.3",
    normal: "1.5",
    relaxed:"1.65",
  },

  // Letter spacing
  tracking: {
    tight:  "-0.025em",
    normal: "0em",
    wide:   "0.025em",
    wider:  "0.06em",
    widest: "0.12em",
  },
} as const

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const spacing = {
  0:    "0px",
  0.5:  "2px",
  1:    "4px",
  1.5:  "6px",
  2:    "8px",
  2.5:  "10px",
  3:    "12px",
  4:    "16px",
  5:    "20px",
  6:    "24px",
  7:    "28px",
  8:    "32px",
  10:   "40px",
  12:   "48px",
  16:   "64px",
  20:   "80px",
} as const

// ─── Border Radius ────────────────────────────────────────────────────────────

export const radius = {
  none: "0px",
  sm:   "6px",
  md:   "10px",
  lg:   "14px",
  xl:   "18px",
  "2xl":"24px",
  "3xl":"32px",
  full: "9999px",
} as const

// ─── Shadows & Glows ─────────────────────────────────────────────────────────

export const shadows = {
  /** Subtle card lift */
  sm: "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
  /** Default card */
  md: "0 4px 16px rgba(0,0,0,0.5), 0 2px 6px rgba(0,0,0,0.4)",
  /** Elevated panels */
  lg: "0 8px 32px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)",
  /** Bottom sheets / modals */
  xl: "0 20px 60px rgba(0,0,0,0.7), 0 8px 24px rgba(0,0,0,0.5)",

  // Neon glow shadows
  glowPink:   "0 0 20px rgba(255, 0, 140, 0.4), 0 0 60px rgba(255, 0, 140, 0.15)",
  glowPurple: "0 0 20px rgba(124, 58, 237, 0.4), 0 0 60px rgba(124, 58, 237, 0.15)",
  glowCyan:   "0 0 20px rgba(0, 255, 208, 0.35), 0 0 60px rgba(0, 255, 208, 0.12)",

  // Inner glow for active states
  innerPink:   "inset 0 0 12px rgba(255, 0, 140, 0.15)",
  innerPurple: "inset 0 0 12px rgba(124, 58, 237, 0.15)",
} as const

// ─── Motion Tokens ────────────────────────────────────────────────────────────

export const motion = {
  // Durations (ms)
  duration: {
    instant:  80,
    fast:    150,
    normal:  250,
    slow:    400,
    slower:  600,
    crawl:   800,
  },

  // Easing curves
  ease: {
    /** Snappy interactions — button press, toggle */
    snap:    [0.23, 1, 0.32, 1] as const,
    /** Standard entrance */
    enter:   [0.16, 1, 0.3, 1] as const,
    /** Standard exit */
    exit:    [0.5, 0, 0.75, 0] as const,
    /** Spring-feel (non-spring easing) */
    spring:  [0.34, 1.56, 0.64, 1] as const,
    /** Smooth deceleration */
    decel:   [0, 0, 0.2, 1] as const,
    /** Smooth acceleration */
    accel:   [0.4, 0, 1, 1] as const,
    /** Linear */
    linear:  [0, 0, 1, 1] as const,
  },

  // Framer Motion spring configs
  spring: {
    /** Snappy, no wobble */
    stiff:  { type: "spring" as const, stiffness: 500, damping: 40 },
    /** Smooth, slight bounce */
    gentle: { type: "spring" as const, stiffness: 280, damping: 28 },
    /** Bouncy (use sparingly) */
    bouncy: { type: "spring" as const, stiffness: 300, damping: 20 },
    /** Sheet slide up */
    sheet:  { type: "spring" as const, stiffness: 320, damping: 34 },
  },

  // Standard animation variants for Framer Motion
  variants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit:    { opacity: 0 },
    },
    slideUp: {
      initial: { opacity: 0, y: 24 },
      animate: { opacity: 1, y: 0 },
      exit:    { opacity: 0, y: 16 },
    },
    slideDown: {
      initial: { opacity: 0, y: -16 },
      animate: { opacity: 1, y: 0 },
      exit:    { opacity: 0, y: -16 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.92 },
      animate: { opacity: 1, scale: 1 },
      exit:    { opacity: 0, scale: 0.95 },
    },
    sheet: {
      initial: { y: "100%", opacity: 0 },
      animate: { y: 0, opacity: 1 },
      exit:    { y: "100%", opacity: 0 },
    },
  },
} as const

// ─── Glass Presets ────────────────────────────────────────────────────────────

export const glass = {
  /** Default card glass */
  card: {
    background: "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(24px) saturate(160%)",
    WebkitBackdropFilter: "blur(24px) saturate(160%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
  /** Elevated panel (sheets, modals) */
  elevated: {
    background: "rgba(255, 255, 255, 0.07)",
    backdropFilter: "blur(40px) saturate(180%)",
    WebkitBackdropFilter: "blur(40px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.12)",
  },
  /** Input / form element */
  input: {
    background: "rgba(255, 255, 255, 0.06)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.10)",
  },
  /** Navigation bar */
  nav: {
    background: "rgba(3, 7, 18, 0.85)",
    backdropFilter: "blur(32px) saturate(180%)",
    WebkitBackdropFilter: "blur(32px) saturate(180%)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
  },
} as const

// ─── Z-Index Scale ────────────────────────────────────────────────────────────

export const zIndex = {
  below:   -1,
  base:     0,
  raised:  10,
  dropdown:20,
  sticky:  30,
  overlay: 40,
  modal:   50,
  toast:   60,
  tooltip: 70,
} as const

// ─── Breakpoints ──────────────────────────────────────────────────────────────

export const breakpoints = {
  sm:  "390px",   // min phone
  md:  "480px",   // large phone
  lg:  "768px",   // tablet
  xl:  "1024px",  // desktop
} as const

// ─── Layout ───────────────────────────────────────────────────────────────────

export const layout = {
  /** Maximum width of mobile shell */
  maxWidth: "430px",
  /** Safe area padding bottom (for home indicator) */
  safeAreaBottom: "env(safe-area-inset-bottom, 20px)",
  /** Bottom nav height */
  navHeight: "76px",
  /** Header height */
  headerHeight: "60px",
  /** Page horizontal padding */
  pagePaddingX: "20px",
  /** Standard page top padding */
  pagePaddingTop: "16px",
} as const