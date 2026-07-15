"use client"

import React from "react"
import { motion, type Variants } from "framer-motion"

// ─── Types ────────────────────────────────────────────────────────────────────

type TransitionVariant = "slide-up" | "slide-left" | "fade" | "scale-fade"

interface PageTransitionProps {
  children:   React.ReactNode
  variant?:   TransitionVariant
  /** Delay before animation starts (seconds) */
  delay?:     number
  /** Key that forces remount on route change */
  routeKey?:  string
  className?: string
}

// ─── Variants ─────────────────────────────────────────────────────────────────

const pageVariants: Record<TransitionVariant, Variants> = {
  "slide-up": {
    initial: {
      opacity: 0,
      y:       28,
      filter:  "blur(4px)",
    },
    animate: {
      opacity: 1,
      y:       0,
      filter:  "blur(0px)",
      transition: {
        duration: 0.40,
        ease:     [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      y:       -16,
      filter:  "blur(2px)",
      transition: {
        duration: 0.22,
        ease:     [0.5, 0, 0.75, 0],
      },
    },
  },

  "slide-left": {
    initial: {
      opacity:    0,
      x:          40,
      filter:     "blur(3px)",
    },
    animate: {
      opacity:    1,
      x:          0,
      filter:     "blur(0px)",
      transition: {
        duration: 0.35,
        ease:     [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity:    0,
      x:          -24,
      filter:     "blur(2px)",
      transition: {
        duration: 0.22,
        ease:     [0.5, 0, 0.75, 0],
      },
    },
  },

  "fade": {
    initial: {
      opacity: 0,
    },
    animate: {
      opacity: 1,
      transition: {
        duration: 0.30,
        ease:     "easeOut",
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.18,
        ease:     "easeIn",
      },
    },
  },

  "scale-fade": {
    initial: {
      opacity: 0,
      scale:   0.96,
      filter:  "blur(4px)",
    },
    animate: {
      opacity: 1,
      scale:   1,
      filter:  "blur(0px)",
      transition: {
        duration: 0.36,
        ease:     [0.16, 1, 0.3, 1],
      },
    },
    exit: {
      opacity: 0,
      scale:   0.97,
      filter:  "blur(2px)",
      transition: {
        duration: 0.20,
        ease:     [0.5, 0, 0.75, 0],
      },
    },
  },
}

// ─── Stagger container for child elements ─────────────────────────────────────

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.06,
      delayChildren:   0.08,
    },
  },
}

export const staggerItem: Variants = {
  initial: { opacity: 0, y: 16 },
  animate: {
    opacity: 1,
    y:       0,
    transition: {
      duration: 0.35,
      ease:     [0.16, 1, 0.3, 1],
    },
  },
}

// ─── PageTransition ───────────────────────────────────────────────────────────

/**
 * Wraps a page in a Framer Motion entrance/exit animation.
 *
 * Usage — wrap inside AnimatePresence at the layout level:
 *
 * @example
 * // In layout.tsx
 * <AnimatePresence mode="wait">
 *   <PageTransition key={pathname} variant="slide-up">
 *     {children}
 *   </PageTransition>
 * </AnimatePresence>
 */
export function PageTransition({
  children,
  variant   = "slide-up",
  delay     = 0,
  routeKey,
  className,
}: PageTransitionProps) {
  const variants = pageVariants[variant]

  return (
    <motion.div
      key={routeKey}
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants}
      style={delay ? { ["--delay" as string]: `${delay}s` } : undefined}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// ─── ListTransition (stagger children) ───────────────────────────────────────

interface ListTransitionProps {
  children:   React.ReactNode
  className?: string
}

/**
 * Stagger-animates a list of children.
 * Each direct child should use <ListTransitionItem>.
 *
 * @example
 * <ListTransition>
 *   {groups.map(g => <ListTransitionItem key={g.id}><GroupCard ... /></ListTransitionItem>)}
 * </ListTransition>
 */
export function ListTransition({ children, className }: ListTransitionProps) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="initial"
      animate="animate"
      className={className}
    >
      {children}
    </motion.div>
  )
}

export function ListTransitionItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div variants={staggerItem} className={className}>
      {children}
    </motion.div>
  )
}

// ─── PresenceTransition (for AnimatePresence-wrapped conditionals) ────────────

interface PresenceTransitionProps {
  children:   React.ReactNode
  show:       boolean
  variant?:   TransitionVariant
  className?: string
}

/**
 * Shows/hides children with animation using AnimatePresence.
 *
 * @example
 * <PresenceTransition show={isOpen} variant="scale-fade">
 *   <Tooltip>content</Tooltip>
 * </PresenceTransition>
 */
export function PresenceTransition({
  children,
  show,
  variant   = "scale-fade",
  className,
}: PresenceTransitionProps) {
  // Import AnimatePresence at call site — exported from framer-motion
  const { AnimatePresence } = require("framer-motion") as typeof import("framer-motion")

  return (
    <AnimatePresence mode="wait">
      {show && (
        <motion.div
          key="presence"
          variants={pageVariants[variant]}
          initial="initial"
          animate="animate"
          exit="exit"
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ─── NumberTransition (animated number counter) ───────────────────────────────

import { useEffect, useRef } from "react"
import { animate } from "framer-motion"

interface NumberTransitionProps {
  value:      number
  prefix?:    string
  suffix?:    string
  decimals?:  number
  duration?:  number
  className?: string
}

/**
 * Animates a number from previous value to new value.
 * Useful for balance amounts, counters.
 *
 * @example
 * <NumberTransition value={1390} prefix="₹" className="text-4xl font-bold" />
 */
export function NumberTransition({
  value,
  prefix    = "",
  suffix    = "",
  decimals  = 0,
  duration  = 0.6,
  className,
}: NumberTransitionProps) {
  const nodeRef   = useRef<HTMLSpanElement>(null)
  const prevValue = useRef(0)

  useEffect(() => {
    const node = nodeRef.current
    if (!node) return

    const from = prevValue.current
    prevValue.current = value

    const controls = animate(from, value, {
      duration,
      ease:      [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        node.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`
      },
    })

    return () => controls.stop()
  }, [value, prefix, suffix, decimals, duration])

  return (
    <span ref={nodeRef} className={className}>
      {prefix}{value.toFixed(decimals)}{suffix}
    </span>
  )
}