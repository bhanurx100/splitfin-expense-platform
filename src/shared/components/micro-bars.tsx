'use client'

import { motion, useReducedMotion } from 'framer-motion'

interface MicroBarsProps {
  values: number[]
  color: string
  className?: string
}

/** Tiny animated histogram generated from API data — never decorative. */
export function MicroBars({ values, color, className }: MicroBarsProps) {
  const reduced = useReducedMotion()
  const max = Math.max(...values, 1)
  return (
    <div className={className} aria-hidden="true">
      <div className="flex h-9 items-end gap-1">
        {values.map((v, i) => (
          <motion.span
            key={i}
            className="w-1.5 flex-1 rounded-full"
            style={{ backgroundColor: color, opacity: 0.85 }}
            initial={reduced ? false : { height: 2 }}
            whileInView={{ height: `${Math.max((v / max) * 100, 8)}%` }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.04, type: 'spring', stiffness: 220, damping: 24 }}
          />
        ))}
      </div>
    </div>
  )
}
