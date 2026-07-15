/**
 * SplitFin Motion System
 * Single source of truth for all animation primitives.
 * Import from here — never define animations inline in components.
 */

import type { Variants, Transition } from "framer-motion"

// ─── Spring Configs ───────────────────────────────────────────────────────────

export const springs = {
  /** Snappy — button press, chip appear */
  snappy: { type: "spring", stiffness: 500, damping: 38 } as const,
  /** Standard — most interactions */
  standard: { type: "spring", stiffness: 360, damping: 32 } as const,
  /** Gentle — cards, hovers */
  gentle: { type: "spring", stiffness: 260, damping: 28 } as const,
  /** Sheet — bottom sheet slide */
  sheet: { type: "spring", stiffness: 320, damping: 34 } as const,
  /** Bouncy — disabled, but available */
  bouncy: { type: "spring", stiffness: 300, damping: 18 } as const,
} as const

// ─── Easing Curves ────────────────────────────────────────────────────────────

export const easings = {
  enter:  [0.16, 1, 0.3, 1]  as const,
  exit:   [0.5, 0, 0.75, 0]  as const,
  snap:   [0.23, 1, 0.32, 1] as const,
  decel:  [0, 0, 0.2, 1]     as const,
  linear: [0, 0, 1, 1]       as const,
} as const

// ─── 1. fadeUp ────────────────────────────────────────────────────────────────
/** Page sections, cards — fade in while rising */

export const fadeUp: Variants = {
  initial: { opacity: 0, y: 20, filter: "blur(4px)" },
  animate: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.45, ease: easings.enter },
  },
  exit: {
    opacity: 0,
    y: -12,
    filter: "blur(3px)",
    transition: { duration: 0.22, ease: easings.exit },
  },
}

/** Page-level fadeUp (slightly slower) */
export const pageFadeUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: easings.enter },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.25, ease: easings.exit },
  },
}

// ─── 2. scalePress ────────────────────────────────────────────────────────────
/** Button / card tap — scale down, spring back */

export const scalePress = {
  /** Tap target for motion.button whileTap */
  tap:       { scale: 0.96 } as const,
  /** Back button press */
  tapSubtle: { scale: 0.94 } as const,
  /** Chip remove */
  tapSmall:  { scale: 0.90 } as const,
  /** Icon orb tap */
  tapOrb:    { scale: 0.94 } as const,
  /** CTA button */
  tapCta:    { scale: 0.965 } as const,

  /** Hover lift (for cards) */
  hoverLift:  { y: -3, scale: 1.012 } as const,
  /** Hover glow ready (used with boxShadow in style) */
  hoverScale: { scale: 1.02 }  as const,
}

// ─── 3. springCard ────────────────────────────────────────────────────────────
/** Card entrance — used in staggered lists */

export const springCard: Variants = {
  initial: { opacity: 0, y: 14, scale: 0.97 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: springs.gentle,
  },
  exit: {
    opacity: 0,
    y: 8,
    scale: 0.97,
    transition: { duration: 0.18, ease: easings.exit },
  },
}

// ─── 4. sheetEnter ────────────────────────────────────────────────────────────
/** Bottom sheet slide up */

export const sheetEnter: Variants = {
  initial: { y: "100%", opacity: 0 },
  animate: {
    y: 0,
    opacity: 1,
    transition: springs.sheet,
  },
  exit: {
    y: "100%",
    opacity: 0,
    transition: { ...springs.sheet, stiffness: 280 },
  },
}

/** Sheet backdrop */
export const sheetBackdrop: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.22 } },
  exit:    { opacity: 0, transition: { duration: 0.20 } },
}

// ─── 5. sheetExit ─────────────────────────────────────────────────────────────
/** Alias — exported for symmetry, same as sheetEnter.exit */

export const sheetExit: Transition = {
  ...springs.sheet,
  stiffness: 280,
}

// ─── 6. counterAnimation ──────────────────────────────────────────────────────
/** Number counter config for framer-motion `animate()` */

export const counterAnimation = {
  duration: 0.8,
  ease: easings.enter,
} as const

// ─── 7. staggerContainer ──────────────────────────────────────────────────────
/** Parent container that staggers children */

export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren:  0.08,
      delayChildren:    0.10,
    },
  },
}

/** Tighter stagger for search results */
export const staggerTight: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.05,
      delayChildren:   0.05,
    },
  },
}

/** Child item in stagger list */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: easings.enter },
  },
  exit: {
    opacity: 0,
    y: 6,
    scale: 0.97,
    transition: { duration: 0.18 },
  },
}

// ─── 8. glowPulse ─────────────────────────────────────────────────────────────
/** Subtle glow pulse on active elements — NOT infinite by default */

export const glowPulse = {
  /** Use as animate prop values */
  boxShadow: {
    rest:   "0 0 0px rgba(124,58,237,0)",
    focus:  "0 0 16px rgba(124,58,237,0.35), 0 0 32px rgba(124,58,237,0.15)",
    pinkFocus: "0 0 16px rgba(255,0,140,0.35), 0 0 32px rgba(255,0,140,0.15)",
    cyanFocus: "0 0 16px rgba(0,255,208,0.30), 0 0 32px rgba(0,255,208,0.12)",
  },
  border: {
    rest:   "rgba(255,255,255,0.10)",
    focus:  "rgba(124,58,237,0.55)",
    pink:   "rgba(255,0,140,0.45)",
    cyan:   "rgba(0,255,208,0.40)",
    error:  "rgba(255,68,114,0.55)",
  },
} as const

// ─── 9. floatingParticles ─────────────────────────────────────────────────────
/** Background ambient particle definitions */

export interface ParticleDef {
  id:       number
  size:     number
  x:        string   // CSS %
  y:        string
  color:    string
  duration: number
  delay:    number
  driftX:   number   // px to drift
  driftY:   number
}

export const BACKGROUND_PARTICLES: ParticleDef[] = [
  {
    id: 1, size: 200, x: "10%",  y: "15%",
    color: "rgba(124,58,237,0.06)",
    duration: 18, delay: 0, driftX: 30, driftY: 20,
  },
  {
    id: 2, size: 160, x: "75%",  y: "8%",
    color: "rgba(255,0,140,0.05)",
    duration: 22, delay: 3, driftX: -25, driftY: 30,
  },
  {
    id: 3, size: 240, x: "50%",  y: "55%",
    color: "rgba(0,255,208,0.04)",
    duration: 15, delay: 6, driftX: 20, driftY: -18,
  },
  {
    id: 4, size: 180, x: "85%",  y: "70%",
    color: "rgba(124,58,237,0.05)",
    duration: 20, delay: 9, driftX: -30, driftY: -22,
  },
  {
    id: 5, size: 130, x: "20%",  y: "80%",
    color: "rgba(255,0,140,0.04)",
    duration: 17, delay: 12, driftX: 18, driftY: -28,
  },
]

/** Particle animate variant — use with particle.driftX/Y */
export function particleVariant(driftX: number, driftY: number): Variants {
  return {
    initial: { x: 0, y: 0, opacity: 0 },
    animate: {
      x: [0, driftX, -driftX * 0.5, 0],
      y: [0, driftY, -driftY * 0.6, 0],
      opacity: [0, 1, 1, 0.8, 1],
      transition: {
        duration: 15,
        repeat: Infinity,
        ease: easings.linear,
        opacity: { duration: 2 },
      },
    },
  }
}

// ─── 10. successMorph ────────────────────────────────────────────────────────
/** CTA button success state morphing */

export const successMorph: Variants = {
  initial: { scale: 0, opacity: 0, rotate: -45 },
  animate: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: springs.snappy,
  },
  exit: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.15 },
  },
}

/** Confetti particle spawn */
export interface ConfettiParticle {
  id:     number
  x:      number   // origin x offset from center (%)
  angle:  number   // launch angle degrees
  color:  string
  size:   number
}

export const CONFETTI_COLORS = [
  "#FF008C", "#7C3AED", "#00FFD0", "#FFB800", "#FF4472", "#9F6EF5",
]

export function generateConfetti(count = 18): ConfettiParticle[] {
  return Array.from({ length: count }, (_, i) => ({
    id:    i,
    x:     Math.random() * 80 - 40,
    angle: (360 / count) * i + Math.random() * 30,
    color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
    size:  4 + Math.random() * 5,
  }))
}

// ─── 11. breathingGlow ───────────────────────────────────────────────────────
/** Slow breathing scale — orb, CTA button */

export const breathingGlow = {
  /** Icon orb breathing */
  orb: {
    animate: { scale: [1, 1.022, 1] as const },
    transition: {
      duration:   5,
      repeat:     Infinity,
      ease:       "easeInOut",
      repeatType: "loop",
    } as const,
  },
  /** CTA button breathing */
  cta: {
    animate: { scale: [1, 1.012, 1] as const },
    transition: {
      duration:   5,
      repeat:     Infinity,
      ease:       "easeInOut",
      repeatType: "loop",
    } as const,
  },
  /** Shadow glow pulse for orb */
  orbShadow: {
    animate: {
      boxShadow: [
        "0 0 24px rgba(124,58,237,0.25), 0 12px 48px rgba(0,0,0,0.5)",
        "0 0 40px rgba(124,58,237,0.40), 0 16px 56px rgba(0,0,0,0.5)",
        "0 0 24px rgba(124,58,237,0.25), 0 12px 48px rgba(0,0,0,0.5)",
      ],
    },
    transition: {
      duration:   5,
      repeat:     Infinity,
      ease:       "easeInOut",
      repeatType: "loop",
    } as const,
  },
} as const

// ─── 12. chipAppear / chipRemove ─────────────────────────────────────────────
/** Member chip entrance and removal */

export const chipAppear: Variants = {
  initial: { scale: 0.75, opacity: 0, x: -8 },
  animate: {
    scale: 1,
    opacity: 1,
    x: 0,
    transition: { ...springs.snappy, duration: 0.25 },
  },
  exit: {
    scale: 0.7,
    opacity: 0,
    x: -6,
    transition: { duration: 0.20, ease: easings.exit },
  },
}

// ─── 13. labelFloat ──────────────────────────────────────────────────────────
/** Input label float to top on focus/fill */

export const labelFloat = {
  rest: {
    y: 0,
    scale: 1,
    color: "rgba(249,250,251,0.40)",
    fontSize: "14px",
  },
  active: {
    y: -22,
    scale: 0.82,
    color: "rgba(124,58,237,0.90)",
    fontSize: "14px",
  },
} as const

// ─── 14. errorShake ──────────────────────────────────────────────────────────
/** Subtle input validation shake */

export const errorShake: Variants = {
  shake: {
    x: [0, -4, 4, -3, 3, -1, 1, 0],
    transition: { duration: 0.4, ease: easings.linear },
  },
}

// ─── 15. selectItemCheck ─────────────────────────────────────────────────────
/** Check icon morph when selecting split type / currency */

export const selectItemCheck: Variants = {
  unchecked: { scale: 0, opacity: 0, rotate: -90 },
  checked: {
    scale: 1,
    opacity: 1,
    rotate: 0,
    transition: springs.snappy,
  },
}

/** Glow ripple on select */
export const selectRipple: Variants = {
  initial: { scale: 0.6, opacity: 0.8 },
  animate: {
    scale: 2.2,
    opacity: 0,
    transition: { duration: 0.5, ease: easings.decel },
  },
}

// ─── Emoji swap variants ──────────────────────────────────────────────────────

export const emojiSwap: Variants = {
  exit:    { scale: 0.4, opacity: 0, filter: "blur(4px)", transition: { duration: 0.18 } },
  initial: { scale: 0.4, opacity: 0, filter: "blur(4px)" },
  animate: {
    scale: 1,
    opacity: 1,
    filter: "blur(0px)",
    transition: { ...springs.snappy },
  },
}

// ─── Helper: delay wrapper ────────────────────────────────────────────────────

/** Wrap any Variants with a custom delay on animate */
export function withDelay(variants: Variants, delay: number): Variants {
  return {
    ...variants,
    animate: {
      ...(typeof variants.animate === "object" ? variants.animate : {}),
      transition: {
        ...(typeof variants.animate === "object" && variants.animate !== null
          ? (variants.animate as Record<string, unknown>).transition as object ?? {}
          : {}),
        delay,
      },
    },
  }
}