import type { Transition, Variants } from 'framer-motion'

/**
 * SplitFin motion tokens — the single source of truth for animation.
 * Every interactive surface (buttons, cards, charts, timeline, carousel)
 * should consume these presets so the whole app shares one motion language.
 */

export const springs = {
  /** Fast, precise — press feedback, small hovers */
  snappy: { type: 'spring', stiffness: 400, damping: 30 } satisfies Transition,
  /** Default UI motion — cards, chips, tooltips */
  soft: { type: 'spring', stiffness: 300, damping: 26 } satisfies Transition,
  /** Playful overshoot — icon pops, ripple settle */
  bouncy: { type: 'spring', stiffness: 500, damping: 22 } satisfies Transition,
  /** Slow, calm — large surfaces, hero elements */
  gentle: { type: 'spring', stiffness: 180, damping: 20 } satisfies Transition,
  /** Layout pill indicators (filter chips, tabs) */
  pill: { type: 'spring', stiffness: 380, damping: 32 } satisfies Transition,
} as const

export const easings = {
  /** Premium ease-out — counters, entrances */
  premiumOut: [0.22, 1, 0.36, 1] as const,
  /** Symmetric premium — crossfades */
  premiumInOut: [0.65, 0, 0.35, 1] as const,
  /** Sharp exit */
  accelerate: [0.4, 0, 1, 1] as const,
}

export const durations = {
  instant: 0.15,
  fast: 0.25,
  base: 0.4,
  slow: 0.6,
  counter: 1.1,
} as const

/** Fade + rise entrance. Pass delay for staggering outside containers. */
export function fadeUp(delay = 0, distance = 14): Variants {
  return {
    initial: { opacity: 0, y: distance },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: durations.slow, ease: [...easings.premiumOut], delay },
    },
  }
}

/** Staggered children container. */
export function staggerContainer(stagger = 0.06, delayChildren = 0): Variants {
  return {
    initial: {},
    animate: { transition: { staggerChildren: stagger, delayChildren } },
  }
}

/** Child variant to pair with staggerContainer. */
export const staggerItem: Variants = {
  initial: { opacity: 0, y: 14, scale: 0.98 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: durations.slow, ease: [...easings.premiumOut] },
  },
}

/** Card hover lift (use with whileHover). */
export const hoverLift = { y: -4, scale: 1.01 } as const

/** Standard press feedback (use with whileTap). */
export const tapPress = { scale: 0.96 } as const

/** Crossfade for swapped content (donut center, badges). */
export const crossfade: Variants = {
  initial: { opacity: 0, scale: 0.96 },
  animate: { opacity: 1, scale: 1, transition: { duration: durations.fast, ease: [...easings.premiumOut] } },
  exit: { opacity: 0, scale: 0.96, transition: { duration: durations.instant, ease: [...easings.accelerate] } },
}
