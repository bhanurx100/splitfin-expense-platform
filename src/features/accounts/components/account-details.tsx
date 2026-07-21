'use client'

import { AnimatedAmount } from '@/src/shared/components/animated-number'
import type { AccountDetails } from '@/src/types/transaction'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AtSign,
  Banknote,
  Briefcase,
  Calendar,
  CalendarClock,
  CheckCircle2,
  Clock,
  Copy,
  CreditCard,
  Globe,
  Hash,
  Home,
  Landmark,
  MapPin,
  Percent,
  Plane,
  QrCode,
  ShieldCheck,
  Smartphone,
  Sparkles,
  User,
  Wallet,
  Wifi,
  type LucideIcon,
} from 'lucide-react'

const iconMap: Record<string, LucideIcon> = {
  landmark: Landmark,
  hash: Hash,
  'qr-code': QrCode,
  'map-pin': MapPin,
  calendar: Calendar,
  'calendar-clock': CalendarClock,
  percent: Percent,
  clock: Clock,
  'check-circle': CheckCircle2,
  'credit-card': CreditCard,
  banknote: Banknote,
  sparkles: Sparkles,
  wallet: Wallet,
  smartphone: Smartphone,
  'at-sign': AtSign,
  'shield-check': ShieldCheck,
  globe: Globe,
  wifi: Wifi,
  home: Home,
  briefcase: Briefcase,
  plane: Plane,
  user: User,
}

export function AccountDetailsSection({ details }: { details: AccountDetails }) {
  return (
    <section aria-label="Account overview" className="flex flex-col gap-4">
      <h2 className="text-lg font-bold">Account Overview</h2>

      <AnimatePresence mode="wait">
        <motion.div
          key={details.accountId}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          className="glass flex flex-col gap-5 rounded-xl p-5"
        >
          {/* Detail grid */}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
            {details.fields.map((field, i) => {
              const Icon = iconMap[field.icon] ?? Landmark
              return (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 26, delay: 0.05 + i * 0.04 }}
                  className="flex items-start gap-2.5"
                >
                  <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary">
                    <Icon className="size-3.5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-[11px] text-muted-foreground">{field.label}</dt>
                    <dd
                      className={`flex items-center gap-1 text-xs font-semibold ${field.tone === 'positive'
                        ? 'text-positive'
                        : field.tone === 'negative'
                          ? 'text-negative'
                          : ''
                        }`}
                    >
                      <span className="truncate">{field.value}</span>
                      {field.copyable && (
                        <button
                          type="button"
                          aria-label={`Copy ${field.label}`}
                          className="flex size-6 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                          onClick={() => navigator.clipboard?.writeText(field.value)}
                        >
                          <Copy className="size-3" aria-hidden="true" />
                        </button>
                      )}
                    </dd>
                  </div>
                </motion.div>
              )
            })}
          </dl>

          {/* Balance block */}
          <div className="border-t border-border pt-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-xs text-muted-foreground">{details.primaryAmountLabel}</p>
                <AnimatedAmount
                  value={details.primaryAmount}
                  currency={details.currency}
                  className="text-2xl font-extrabold tracking-tight"
                />
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">{details.secondaryAmountLabel}</p>
                <AnimatedAmount
                  value={details.secondaryAmount}
                  currency={details.currency}
                  className="text-sm font-bold"
                />
              </div>
            </div>

            <div
              role="progressbar"
              aria-valuenow={details.progressPercent}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={details.primaryAmountLabel}
              className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"
            >
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${details.progressPercent}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 24 }}
              />
            </div>

            <div className="mt-3 flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{details.footnoteLabel}</span>
              <span className="font-semibold text-positive">{details.footnoteValue}</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </section>
  )
}
