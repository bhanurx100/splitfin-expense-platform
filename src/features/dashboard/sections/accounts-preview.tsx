'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import { springs } from '@/src/shared/lib/motion'
import { cn } from '@/src/lib/utils'
import type { AccountPreview } from '@/src/types/transaction'
import { AnimatePresence, motion, useMotionValue, useSpring } from 'framer-motion'
import {
  Banknote,
  CreditCard,
  Landmark,
  Lock,
  TrendingDown,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from 'lucide-react'
import Link from 'next/link'
import { useId, useRef, useState } from 'react'

/**
 * Visual language mirrors the Accounts page: each account is a small
 * collectible card whose hero zone is a bespoke, type-specific 3D-style
 * illustration (not a generic icon), so the carousel reads as a miniature
 * Accounts page rather than a dashboard widget.
 */
const typeMeta: Record<
  string,
  { icon: LucideIcon; gradient: string; glow: string; ring: string; c1: string; c2: string; c3: string }
> = {
  bank: {
    icon: Landmark,
    gradient: 'linear-gradient(135deg, #3b1d9e 0%, #5b3df5 55%, #7c5cff 100%)',
    glow: 'rgba(124,60,255,0.45)',
    ring: 'rgba(155,92,255,0.5)',
    c1: '#3b1d9e',
    c2: '#5b3df5',
    c3: '#a48bff',
  },
  'credit-card': {
    icon: CreditCard,
    gradient: 'linear-gradient(135deg, #0e4b5e 0%, #0f7ea8 55%, #14d9ff 100%)',
    glow: 'rgba(20,217,255,0.35)',
    ring: 'rgba(20,217,255,0.45)',
    c1: '#0e4b5e',
    c2: '#0f7ea8',
    c3: '#5eeaff',
  },
  'debit-card': {
    icon: CreditCard,
    gradient: 'linear-gradient(135deg, #5e3a0e 0%, #a87a0f 55%, #ffaa2b 100%)',
    glow: 'rgba(255,170,43,0.35)',
    ring: 'rgba(255,170,43,0.45)',
    c1: '#5e3a0e',
    c2: '#a87a0f',
    c3: '#ffc766',
  },
  wallet: {
    icon: Wallet,
    gradient: 'linear-gradient(135deg, #06503c 0%, #0b9c6e 55%, #16e6a1 100%)',
    glow: 'rgba(22,230,161,0.35)',
    ring: 'rgba(22,230,161,0.45)',
    c1: '#06503c',
    c2: '#0b9c6e',
    c3: '#5cf0c2',
  },
  cash: {
    icon: Banknote,
    gradient: 'linear-gradient(135deg, #4a5e0e 0%, #84a80f 55%, #c6ff2b 100%)',
    glow: 'rgba(198,255,43,0.28)',
    ring: 'rgba(198,255,43,0.4)',
    c1: '#4a5e0e',
    c2: '#84a80f',
    c3: '#e2ff7a',
  },
  investment: {
    icon: TrendingUp,
    gradient: 'linear-gradient(135deg, #5e0e46 0%, #a80f6e 55%, #ff2d78 100%)',
    glow: 'rgba(255,45,120,0.35)',
    ring: 'rgba(255,45,120,0.45)',
    c1: '#5e0e46',
    c2: '#a80f6e',
    c3: '#ff7ab0',
  },
  savings: {
    icon: Lock,
    gradient: 'linear-gradient(135deg, #16222f 0%, #2f4c66 55%, #7fb0e0 100%)',
    glow: 'rgba(127,176,224,0.35)',
    ring: 'rgba(127,176,224,0.45)',
    c1: '#16222f',
    c2: '#3a5877',
    c3: '#bcd9f5',
  },
}

type IllustrationProps = { c1: string; c2: string; c3: string }

/* ------------------------------------------------------------------ */
/* Per-account-type illustrations — lightweight inline SVG, no assets   */
/* ------------------------------------------------------------------ */

function BankIllustration({ c1, c2, c3 }: IllustrationProps) {
  const id = useId()
  return (
    <svg viewBox="0 0 100 100" className="h-14 w-14 drop-shadow-[0_10px_14px_rgba(0,0,0,0.4)]">
      <defs>
        <linearGradient id={`roof-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c3} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
        <linearGradient id={`col-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c3} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <path d="M50 12 L87 33 L13 33 Z" fill={`url(#roof-${id})`} />
      <rect x="15" y="33" width="70" height="6.5" rx="1.5" fill={c3} opacity="0.95" />
      {[21, 36.3, 51.6, 67].map((x, i) => (
        <rect key={i} x={x} y="42" width="7" height="29" rx="1.6" fill={`url(#col-${id})`} />
      ))}
      <rect x="12" y="74" width="76" height="7.5" rx="2" fill={c2} />
      <rect x="8" y="83" width="84" height="6" rx="2" fill={c1} />
    </svg>
  )
}

function CardIllustration({ c1, c2, c3 }: IllustrationProps) {
  const id = useId()
  return (
    <svg viewBox="0 0 100 100" className="h-14 w-14 drop-shadow-[0_10px_14px_rgba(0,0,0,0.4)]">
      <defs>
        <linearGradient id={`face-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c3} />
          <stop offset="100%" stopColor={c2} />
        </linearGradient>
      </defs>
      <rect x="20" y="24" width="62" height="42" rx="7" fill={c1} opacity="0.75" transform="rotate(10 51 45)" />
      <rect x="16" y="30" width="62" height="42" rx="7" fill={`url(#face-${id})`} transform="rotate(-6 47 51)" />
      <g transform="rotate(-6 47 51)">
        <rect x="22" y="42" width="12" height="9" rx="2" fill={c1} opacity="0.85" />
        <rect x="22" y="60" width="34" height="3.4" rx="1.7" fill="#ffffff" opacity="0.7" />
        <rect x="22" y="66" width="20" height="3.4" rx="1.7" fill="#ffffff" opacity="0.4" />
      </g>
    </svg>
  )
}

function WalletIllustration({ c1, c2, c3 }: IllustrationProps) {
  const id = useId()
  return (
    <svg viewBox="0 0 100 100" className="h-14 w-14 drop-shadow-[0_10px_14px_rgba(0,0,0,0.4)]">
      <defs>
        <linearGradient id={`body-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={c3} />
          <stop offset="100%" stopColor={c1} />
        </linearGradient>
      </defs>
      <rect x="14" y="30" width="52" height="20" rx="3" fill={c2} opacity="0.9" />
      <rect x="12" y="38" width="76" height="46" rx="9" fill={`url(#body-${id})`} />
      <rect x="12" y="38" width="76" height="11" rx="4" fill={c3} opacity="0.5" />
      <circle cx="72" cy="61" r="8" fill={c3} />
      <circle cx="72" cy="61" r="3.4" fill={c1} />
    </svg>
  )
}

function CashIllustration({ c1, c2, c3 }: IllustrationProps) {
  const id = useId()
  return (
    <svg viewBox="0 0 100 100" className="h-14 w-14 drop-shadow-[0_10px_14px_rgba(0,0,0,0.4)]">
      <defs>
        <linearGradient id={`bill-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={c2} />
          <stop offset="100%" stopColor={c3} />
        </linearGradient>
      </defs>
      <rect x="14" y="56" width="66" height="24" rx="4" fill={c1} />
      <rect x="18" y="46" width="66" height="24" rx="4" fill={c2} />
      <rect x="22" y="36" width="66" height="24" rx="4" fill={`url(#bill-${id})`} />
      <circle cx="55" cy="48" r="7" fill="#ffffff" opacity="0.35" />
      <circle cx="30" cy="76" r="9" fill={c3} />
      <circle cx="30" cy="76" r="9" fill="none" stroke={c1} strokeWidth="1.5" opacity="0.5" />
    </svg>
  )
}

function InvestmentIllustration({ c1, c2, c3 }: IllustrationProps) {
  return (
    <svg viewBox="0 0 100 100" className="h-14 w-14 drop-shadow-[0_10px_14px_rgba(0,0,0,0.4)]">
      <polygon points="50,14 82,30 50,46 18,30" fill={c3} />
      <polygon points="18,30 50,46 50,80 18,64" fill={c1} />
      <polygon points="82,30 50,46 50,80 82,64" fill={c2} />
      <path d="M32 55 L44 47 L52 53 L66 42" fill="none" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity="0.75" />
    </svg>
  )
}

function VaultIllustration({ c1, c2, c3 }: IllustrationProps) {
  const id = useId()
  return (
    <svg viewBox="0 0 100 100" className="h-14 w-14 drop-shadow-[0_10px_14px_rgba(0,0,0,0.4)]">
      <defs>
        <radialGradient id={`door-${id}`}>
          <stop offset="0%" stopColor={c3} />
          <stop offset="75%" stopColor={c2} />
          <stop offset="100%" stopColor={c1} />
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="36" fill={`url(#door-${id})`} stroke={c1} strokeWidth="3" />
      <circle cx="50" cy="50" r="24" fill="none" stroke={c1} strokeWidth="2.5" opacity="0.6" />
      {[0, 60, 120].map((deg) => (
        <rect key={deg} x="47" y="26" width="6" height="20" rx="2" fill={c1} opacity="0.75" transform={`rotate(${deg} 50 50)`} />
      ))}
      <circle cx="50" cy="50" r="8" fill={c1} />
    </svg>
  )
}

const illustrationMap: Record<string, (p: IllustrationProps) => React.JSX.Element> = {
  bank: BankIllustration,
  'credit-card': CardIllustration,
  'debit-card': CardIllustration,
  wallet: WalletIllustration,
  cash: CashIllustration,
  investment: InvestmentIllustration,
  savings: VaultIllustration,
}

/* ------------------------------------------------------------------ */
/* Card                                                                 */
/* ------------------------------------------------------------------ */

function AccountCard({ account, index }: { account: AccountPreview; index: number }) {
  const meta = typeMeta[account.type] ?? typeMeta.bank
  const Icon = meta.icon
  const Illustration = illustrationMap[account.type] ?? illustrationMap.bank
  const positive = account.monthlyChangePercent >= 0

  const rotateX = useMotionValue(0)
  const rotateY = useMotionValue(0)
  const springRotateX = useSpring(rotateX, springs.soft)
  const springRotateY = useSpring(rotateY, springs.soft)

  const rippleId = useRef(0)
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([])

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width - 0.5
    const py = (e.clientY - rect.top) / rect.height - 0.5
    rotateY.set(px * 9)
    rotateX.set(py * -9)
  }

  function resetTilt() {
    rotateX.set(0)
    rotateY.set(0)
  }

  function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect()
    const id = rippleId.current++
    setRipples((prev) => [...prev, { id, x: e.clientX - rect.left, y: e.clientY - rect.top }])
    window.setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== id))
    }, 650)
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 24, scale: 0.96 }}
      whileInView={{ opacity: 1, x: 0, scale: 1 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ ...springs.soft, delay: index * 0.06 }}
      className="snap-start"
    >
      <Link
        href={`/accounts?account=${account.id}`}
        aria-label={`${account.institution} ${account.name} — open account`}
        className="block rounded-[20px] focus-visible:outline-2 focus-visible:outline-ring"
        style={{ perspective: 900 }}
      >
        <motion.div
          onMouseMove={handleMouseMove}
          onMouseLeave={resetTilt}
          onPointerDown={handlePointerDown}
          whileHover={{ y: -6, scale: 1.03 }}
          whileTap={{ scale: 0.96 }}
          transition={springs.snappy}
          style={{
            rotateX: springRotateX,
            rotateY: springRotateY,
            transformStyle: 'preserve-3d',
            boxShadow: `0 10px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.06)`,
          }}
          className="group relative flex w-[150px] shrink-0 flex-col overflow-hidden rounded-[20px] border border-white/10"
        >
          {/* Hover glow ring */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[20px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={{ boxShadow: `0 0 0 1.5px ${meta.ring}, 0 14px 32px ${meta.glow}` }}
          />

          {/* ── Illustration hero zone ─────────────────────────── */}
          <div
            className="relative flex h-28 items-center justify-center overflow-hidden"
            style={{ background: meta.gradient }}
          >
            <span
              aria-hidden
              className="absolute size-20 rounded-full opacity-70 blur-2xl"
              style={{ background: meta.glow }}
            />
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-10"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.28), transparent)' }}
            />
            <span
              aria-hidden
              className="absolute -inset-x-6 -top-8 h-16 rotate-[8deg] opacity-70 mix-blend-overlay"
              style={{ background: 'linear-gradient(180deg, rgba(255,255,255,0.5), transparent)' }}
            />
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.4 + index * 0.2, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="transition-transform duration-300 ease-out group-hover:-rotate-3 group-hover:scale-[1.12]">
                <Illustration c1={meta.c1} c2={meta.c2} c3={meta.c3} />
              </div>
            </motion.div>
            {account.isPrimary && (
              <span className="absolute top-2 right-2 rounded-full border border-white/30 bg-black/25 px-2 py-0.5 text-[9px] font-semibold tracking-wide text-white/90 backdrop-blur-sm">
                PRIMARY
              </span>
            )}

            {/* Click ripple */}
            <AnimatePresence>
              {ripples.map((r) => (
                <motion.span
                  key={r.id}
                  className="pointer-events-none absolute rounded-full bg-white/45"
                  style={{ left: r.x, top: r.y, width: 10, height: 10, marginLeft: -5, marginTop: -5 }}
                  initial={{ scale: 0, opacity: 0.5 }}
                  animate={{ scale: 15, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.65, ease: 'easeOut' }}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* ── Info zone ────────────────────────────────────── */}
          <div className="flex flex-col gap-1.5 bg-[rgba(14,15,32,0.92)] p-3 backdrop-blur-xl">
            <div className="flex min-w-0 items-center gap-1.5">
              <span
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-white"
                style={{ background: meta.glow }}
              >
                <Icon className="size-3" aria-hidden="true" />
              </span>
              <p className="truncate text-[13px] font-semibold">{account.institution}</p>
            </div>
            <p className="truncate pl-[26px] text-[10.5px] text-muted-foreground">
              {account.name}
              {account.maskedNumber ? ` · ${account.maskedNumber}` : ''}
            </p>
            <div className="mt-0.5 flex items-end justify-between gap-2">
              <AnimatedAmount
                value={account.balance}
                currency={account.currency}
                className="text-base font-bold leading-tight"
              />
              <span
                className={cn(
                  'flex shrink-0 items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[9.5px] font-semibold',
                  positive ? 'bg-positive/12 text-positive' : 'bg-negative/12 text-negative',
                )}
              >
                {positive ? (
                  <TrendingUp className="size-2.5" aria-hidden="true" />
                ) : (
                  <TrendingDown className="size-2.5" aria-hidden="true" />
                )}
                {Math.abs(account.monthlyChangePercent)}%
              </span>
            </div>
          </div>
        </motion.div>
      </Link>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Section                                                              */
/* ------------------------------------------------------------------ */

export function AccountsPreview({ accounts }: { accounts: AccountPreview[] }) {
  if (accounts.length === 0) {
    return (
      <section aria-label="Accounts preview" className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Accounts</h2>
        </div>
        <div className="glass flex flex-col items-center gap-2 rounded-2xl p-8 text-center">
          <p className="text-sm font-semibold">No accounts yet</p>
          <p className="max-w-56 text-xs leading-relaxed text-muted-foreground">
            Add your first account to see it here.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section aria-label="Accounts preview" className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Accounts</h2>
        <Link
          href="/accounts"
          className="rounded-lg text-sm font-medium text-primary transition-colors hover:text-primary-bright focus-visible:outline-2 focus-visible:outline-ring"
        >
          View all
        </Link>
      </div>
      <div className="-mx-6 flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-6 pt-1 pb-3 scrollbar-none">
        {accounts.map((account, i) => (
          <AccountCard key={account.id} account={account} index={i} />
        ))}
      </div>
    </section>
  )
}