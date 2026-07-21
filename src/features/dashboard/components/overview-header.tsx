'use client'

import { IconButton } from '@/src/shared/components/icon-button'
import { getTimeGreeting } from '@/src/shared/lib/format'
import { useTheme } from '@/src/providers/theme-provider'
import type { UserGreeting } from '@/src/types/transaction'
import { motion } from 'framer-motion'
import { Bell, Layers, Moon, Search, Sun } from 'lucide-react'
import { useEffect, useState } from 'react'

export function OverviewHeader({ greeting }: { greeting: UserGreeting }) {
  // Time-based greeting is resolved after mount to avoid SSR/client mismatch.
  const [timeGreeting, setTimeGreeting] = useState('Hello')
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    setTimeGreeting(getTimeGreeting())
  }, [])

  return (
    <header className="flex flex-col gap-4 pt-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <motion.span
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="flex size-9 items-center justify-center rounded-2xl border border-primary/12 text-primary"
            style={{ boxShadow: '0 0 20px rgba(124,60,255,0.08)' }}
          >
            <Layers className="size-5" aria-hidden="true" />
          </motion.span>
          <span className="text-lg font-bold tracking-tight">SplitFin</span>
        </div>
        <div className="flex gap-2">
          <IconButton icon={Search} label="Search" />
          <IconButton
            icon={theme === 'dark' ? Sun : Moon}
            label="Toggle theme"
            onClick={toggleTheme}
          />
          <IconButton icon={Bell} label="Notifications" badge={greeting.unreadNotifications} />
        </div>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 24, delay: 0.05 }}
      >
        <h1 className="text-3xl font-extrabold tracking-tight text-balance">
          {timeGreeting}, {greeting.name}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{greeting.subtitle}</p>
      </motion.div>
    </header>
  )
}
