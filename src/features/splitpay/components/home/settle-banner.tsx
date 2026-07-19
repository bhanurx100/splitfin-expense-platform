'use client'

import { springs } from '@/src/shared/lib/motion'
import { motion } from 'framer-motion'
import { ArrowRight, Zap } from 'lucide-react'

export function SettleBanner() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ type: 'spring', stiffness: 240, damping: 26 }}
      className="relative overflow-hidden rounded-2xl border border-primary/30 p-[1px]"
      style={{
        background: 'linear-gradient(135deg, rgba(124,60,255,0.35), rgba(20,217,255,0.12), rgba(124,60,255,0.05))',
      }}
    >
      {/* Ambient motion glow */}
      <motion.span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-y-8 w-24 blur-2xl"
        style={{ background: 'rgba(155,92,255,0.25)' }}
        animate={{ x: ['-20%', '420%'] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2 }}
      />
      <div className="relative flex items-center gap-4 rounded-[15px] bg-[rgba(10,8,26,0.72)] p-4 backdrop-blur-xl">
        <motion.span
          whileHover={{ scale: 1.1, rotate: -6 }}
          transition={springs.bouncy}
          className="glow-breathe flex size-11 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary"
        >
          <Zap className="size-5" aria-hidden="true" />
        </motion.span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold">Settle up instantly</p>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            Use UPI to settle your dues in a click
          </p>
        </div>
        <motion.button
          type="button"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          transition={springs.snappy}
          className="glow-primary flex min-h-11 shrink-0 items-center gap-1.5 rounded-2xl bg-primary px-4 text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring"
        >
          Settle Now
          <ArrowRight className="size-4" aria-hidden="true" />
        </motion.button>
      </div>
    </motion.div>
  )
}
