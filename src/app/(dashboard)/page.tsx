'use client'

import { MobileShell } from '@/src/shared/components/mobile-shell'
import { QuickActions } from '@/src/shared/components/quick-actions'
import {
  accounts,
  balanceSummary,
  cashFlow,
  categories,
  greeting,
  insights,
  moneySummary,
  splitPaySummary,
} from '@/src/lib/data'
import { HeroCard } from '@/src/features/dashboard/components/hero-card'
import { MoneySummaryRow } from '@/src/features/dashboard/components/money-summary'
import { OverviewHeader } from '@/src/features/dashboard/components/overview-header'
import { AccountsPreview } from '@/src/features/dashboard/sections/accounts-preview'
import { CashFlowCard } from '@/src/features/dashboard/sections/cash-flow-card'
import { CategoriesPreview } from '@/src/features/dashboard/sections/categories-preview'
import { InsightCard } from '@/src/features/dashboard/sections/insight-card'
import { SplitPayPreview } from '@/src/features/dashboard/sections/splitpay-preview'
import { motion } from 'framer-motion'
import { Plus, ScanLine, Target, Users } from 'lucide-react'

const quickActions = [
  { id: 'scan', icon: ScanLine, label: 'Scan Bill', hint: 'Auto capture', tone: 'primary' as const },
  { id: 'add', icon: Plus, label: 'Add Money', hint: 'Any account', tone: 'positive' as const },
  { id: 'goal', icon: Target, label: 'Set Goal', hint: 'Save smart', tone: 'info' as const },
  { id: 'split', icon: Users, label: 'SplitPay', hint: 'With friends', tone: 'warning' as const },
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
      <OverviewHeader greeting={greeting} />
      <motion.div {...sectionMotion}>
        <HeroCard summary={balanceSummary} />
      </motion.div>
      <motion.div {...sectionMotion}>
        <MoneySummaryRow summary={moneySummary} />
      </motion.div>
      <motion.section aria-label="Quick actions" {...sectionMotion}>
        <QuickActions actions={quickActions} />
      </motion.section>
      <motion.div {...sectionMotion}>
        <AccountsPreview accounts={accounts.slice(0, 4)} />
      </motion.div>
      <motion.div {...sectionMotion}>
        <CashFlowCard data={cashFlow} />
      </motion.div>
      <motion.div {...sectionMotion}>
        <CategoriesPreview categories={categories} />
      </motion.div>
      <motion.div {...sectionMotion}>
        <SplitPayPreview summary={splitPaySummary} />
      </motion.div>
      {insights.map((insight) => (
        <motion.div key={insight.id} {...sectionMotion}>
          <InsightCard insight={insight} />
        </motion.div>
      ))}
    </MobileShell>
  )
}
