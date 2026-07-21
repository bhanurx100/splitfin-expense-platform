'use client'

import { HeroCard } from '@/src/features/dashboard/components/hero-card'
import { AccountsPreview } from '@/src/features/dashboard/sections/accounts-preview'
import { CashFlowCard } from '@/src/features/dashboard/sections/cash-flow-card'
import { CategoriesPreview } from '@/src/features/dashboard/sections/categories-preview'
import { InsightCard } from '@/src/features/dashboard/sections/insight-card'
import { SplitPayPreview } from '@/src/features/dashboard/sections/splitpay-preview'
import {
  accounts,
  balanceSummary,
  cashFlowByPeriod,
  categories,
  greeting,
  insights,

  splitMembers,
  splitPaySummary,
} from '@/src/lib/data'
import { MobileShell } from '@/src/shared/components/mobile-shell'
import { QuickActions, type QuickAction } from '@/src/shared/components/quick-actions'
import { motion } from 'framer-motion'
import { Plus, ScanLine, Sparkles, Users } from 'lucide-react'

const quickActions: QuickAction[] = [
  { id: 'add', icon: Plus, label: 'Add Money', hint: 'Any account', tone: 'positive', href: '/accounts' },
  { id: 'scan', icon: ScanLine, label: 'Scan Bill', hint: 'Auto capture', tone: 'info', href: '/transactions?action=scan' },
  { id: 'split', icon: Users, label: 'Split', hint: 'With friends', tone: 'warning', href: '/splitpay' },
  { id: 'insights', icon: Sparkles, label: 'Insights', hint: 'Spend smart', tone: 'info', href: '/categories' },
]

const sectionMotion = {
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-30px' },
  transition: { type: 'spring' as const, stiffness: 200, damping: 26 },
}

export default function OverviewPage() {
  return (
    <MobileShell>
      {/* Hero — canvas with typography and 3D bank, plus balance card */}
      <motion.div {...sectionMotion}>
        <HeroCard summary={balanceSummary} />
      </motion.div>
      {/* Quick actions */}
      <motion.section aria-label="Quick actions" {...sectionMotion}>
        <QuickActions actions={quickActions} />
      </motion.section>
      {/* Cash flow (→ Transactions) */}
      <motion.div {...sectionMotion}>
        <CashFlowCard seriesByPeriod={cashFlowByPeriod} currency={balanceSummary.currency} />
      </motion.div>
      {/* Top categories (→ Categories / selected category) */}
      <motion.div {...sectionMotion}>
        <CategoriesPreview categories={categories} />
      </motion.div>
      {/* Accounts preview (→ Accounts / account detail) */}
      <motion.div {...sectionMotion}>
        <AccountsPreview accounts={accounts} />
      </motion.div>
      {/* SplitPay preview (→ SplitPay) */}
      <motion.div {...sectionMotion}>
        <SplitPayPreview summary={splitPaySummary} members={splitMembers} />
      </motion.div>
      {/* Live insights from the insight engine */}
      <motion.div {...sectionMotion}>
        <InsightCard insights={insights} />
      </motion.div>
    </MobileShell>
  )
}
