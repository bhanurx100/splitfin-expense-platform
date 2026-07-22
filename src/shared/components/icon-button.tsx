'use client'

import { cn } from '@/src/lib/utils'
import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

interface IconButtonProps {
  icon: LucideIcon
  label: string
  onClick?: () => void
  badge?: number
  className?: string
}

export function IconButton({ icon: Icon, label, onClick, badge, className }: IconButtonProps) {
  return (
    <motion.button
      type="button"
      aria-label={label}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.94 }}
      transition={{ type: 'spring', stiffness: 400, damping: 24 }}
      className={cn(
        'glass relative flex size-10 items-center justify-center rounded-[10px] text-foreground/90 transition-shadow focus-visible:outline-2 focus-visible:outline-ring',
        className,
      )}
    >
      <Icon className="size-5" aria-hidden="true" />
      {badge != null && badge > 0 && (
        <span className="absolute -top-1 -right-1 flex size-4.5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
          {badge}
        </span>
      )}
    </motion.button>
  )
}
