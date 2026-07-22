'use client'

import { useTheme } from '@/src/providers/theme-provider'
import { IconButton } from '@/src/shared/components/icon-button'
import type { UserGreeting } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import { Bell, Layers, Moon, Search, Sun } from 'lucide-react'
import Link from 'next/link'

export function OverviewHeader({ greeting: _greeting }: { greeting: UserGreeting }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="flex h-14 items-center justify-between" aria-label="Application header">
      <Link href="/" aria-label="SplitFin overview" className="flex min-h-11 items-center gap-2 focus-visible:outline-2 focus-visible:outline-ring">
        <motion.span
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="flex size-7 items-center justify-center rounded-[10px] border border-[var(--surface-border)] text-primary"
        >
          <Layers className="size-4" aria-hidden="true" />
        </motion.span>
        <span className="text-[1.625rem] font-bold tracking-tight">SplitFin</span>
      </Link>
      <div className="flex gap-3">
        <IconButton icon={Search} label="Search" />
        <IconButton icon={theme === 'dark' ? Sun : Moon} label="Toggle theme" onClick={toggleTheme} />
        <IconButton icon={Bell} label="Notifications" />
      </div>
    </header>
  )
}
