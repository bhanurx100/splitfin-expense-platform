'use client'

import { motion } from 'framer-motion'

interface ProgressRingProps {
  percent: number
  size?: number
  strokeWidth?: number
  color?: string
  trackColor?: string
  /** Adds a soft neon drop-shadow around the progress arc. */
  glow?: boolean
  children?: React.ReactNode
  label?: string
}

export function ProgressRing({
  percent,
  size = 64,
  strokeWidth = 6,
  color = 'var(--primary)',
  trackColor = 'oklch(1 0 0 / 8%)',
  glow = false,
  children,
  label,
}: ProgressRingProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius

  return (
    <div
      className="relative inline-flex items-center justify-center"
      role="img"
      aria-label={label ?? `${Math.round(percent)}% complete`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={trackColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{
            strokeDashoffset: circumference - (Math.min(percent, 100) / 100) * circumference,
          }}
          transition={{ type: 'spring', stiffness: 120, damping: 22 }}
          style={glow ? { filter: `drop-shadow(0 0 6px ${color})` } : undefined}
        />
      </svg>
      {children && <div className="absolute inset-0 flex items-center justify-center">{children}</div>}
    </div>
  )
}
