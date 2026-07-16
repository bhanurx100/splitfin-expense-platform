'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  subtitle: string
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="flex items-start justify-between gap-4 pt-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24 }}
      >
        <h1 className="text-4xl font-extrabold tracking-tight text-balance">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </motion.div>
      {actions && <div className="flex shrink-0 gap-2 pt-1">{actions}</div>}
    </header>
  )
}
