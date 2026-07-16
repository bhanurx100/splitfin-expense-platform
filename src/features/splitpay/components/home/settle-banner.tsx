'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'

export function SettleBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 240, damping: 26 }}
      className="flex items-center gap-4 rounded-xl border border-dashed border-primary/40 bg-primary/5 p-4"
    >
      <span className="glow-breathe flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
        <Zap className="size-5" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold">Settle up instantly</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
          Use UPI to settle your dues in a click
        </p>
      </div>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        className="glow-primary flex min-h-11 shrink-0 items-center gap-1.5 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        Settle Now
        <ArrowRight className="size-4" aria-hidden="true" />
      </motion.button>
    </motion.div>
  )
}
