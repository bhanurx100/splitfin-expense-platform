'use client'

import { motion } from 'framer-motion'
import { Camera, Plus, Upload } from 'lucide-react'

export function TransactionActions() {
  return (
    <section aria-label="Transaction actions" className="flex gap-2.5">
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        className="glass flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-foreground/90 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Upload className="size-4" aria-hidden="true" />
        Import
      </motion.button>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        className="glass flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl text-sm font-semibold text-foreground/90 focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Camera className="size-4" aria-hidden="true" />
        Scan Bill
      </motion.button>
      <motion.button
        type="button"
        whileTap={{ scale: 0.96 }}
        className="glow-primary flex min-h-12 flex-[1.4] items-center justify-center gap-2 rounded-2xl bg-primary text-sm font-semibold text-primary-foreground focus-visible:outline-2 focus-visible:outline-ring"
      >
        <Plus className="size-4" aria-hidden="true" />
        Add Transaction
      </motion.button>
    </section>
  )
}
