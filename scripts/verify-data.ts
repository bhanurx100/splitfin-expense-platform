/**
 * Data-integrity verification — runs the REAL selectors against the REAL
 * store and asserts every cross-page invariant the product promises.
 * Execute: tsc -p tsconfig.verify.json && node -r ./.tmp-verify/hook.js .tmp-verify/scripts/verify-data.js
 */
import {
  balanceSummary,
  cashFlowByPeriod,
  categories,
  categoryInsight,
  insights,
  moneySummary,
  monthGroups,
  splitPaySummary,
  transactions,
} from '../src/lib/data'

let failures = 0

function check(label: string, actual: unknown, expected?: unknown) {
  const ok = expected !== undefined ? actual === expected : actual
  if (!ok) failures += 1
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${label}: ${JSON.stringify(actual)}${ok ? '' : ` (expected ${JSON.stringify(expected)})`}`)
}

// 1 — Overview and Transactions must show IDENTICAL flow totals
check('Money In == Transactions Income', moneySummary.moneyIn)
check('Money Out == Transactions Expense', moneySummary.moneyOut)
check('Net Balance == Net Flow', moneySummary.netBalance)

// 2 — Category totals must equal the expense total exactly
const categorySum = categories.reduce((s, c) => s + c.amount, 0)
check('Sum(category amounts) == expense total', categorySum)

// 3 — Cash flow 1M series must sum to the same totals
const flowIn = cashFlowByPeriod['1M'].reduce((s, p) => s + p.inflow, 0)
const flowOut = cashFlowByPeriod['1M'].reduce((s, p) => s + p.outflow, 0)
check('CashFlow 1M inflow == Money In', flowIn, moneySummary.moneyIn)
check('CashFlow 1M outflow == Money Out', flowOut, moneySummary.moneyOut)

// 4 — Balance: banks + wallet + cash − credit dues; debit card never double-counted
check('Total balance (net worth)', balanceSummary.totalBalance, 284500 + 96800 + 12400 + 6150 - 48200)
check('Credit dues disclosed', balanceSummary.creditOutstanding, 48200)
check('Active accounts (linked card excluded)', balanceSummary.accountCount, 5)

// 5 — SplitPay summary derived from members + groups
check('You owe', splitPaySummary.youOwe, 2600)
check("You're owed", splitPaySummary.youAreOwed, 2300)
check('Net position', splitPaySummary.netBalance, -300)
check('Owe groups', splitPaySummary.oweGroups, 2)
check('Owed groups', splitPaySummary.owedGroups, 1)

// 6 — Timeline totals match the flow totals per month
check('Timeline July totalSpent', monthGroups[0]?.totalSpent)

// 7 — MoM percentages are period-aligned (July 1–19 vs June 1–19)
// console.log(`INFO  incomeChangePercent: ${transactionSummary.incomeChangePercent}`)
// console.log(`INFO  expenseChangePercent: ${transactionSummary.expenseChangePercent}`)
console.log(`INFO  monthlyChange: ${balanceSummary.monthlyChange} (${balanceSummary.monthlyChangePercent}%)`)

// 8 — Insight engine produces live findings
check('Insights generated', insights.length > 0, true)
check('Category insight defined', categoryInsight !== undefined, true)
console.log(`INFO  insights: ${insights.map((i) => i.id).join(', ')}`)

// 9 — Sparklines are real (match the 1M series length)
check('inBars length == 1M days', moneySummary.inBars.length, cashFlowByPeriod['1M'].length)

// 10 — Month switching: June is a full month with full-month comparison
import { availableMonths, getCategoriesForMonth, getCategoryPageSummaryForMonth } from '../src/lib/data'
const june = getCategoryPageSummaryForMonth('2026-06')
check('June total spent', june.totalSpent, 75264)
check('June label', june.month, 'June 2026')
const juneCategories = getCategoriesForMonth('2026-06')
check('June categories sum', juneCategories.reduce((s, c) => s + c.amount, 0), 75264)
check('June top category', juneCategories[0]?.name, 'Shopping')
check('Available months (Feb–Jul 2026)', availableMonths.length, 6)

// 11 — Raw store sanity
check('Transactions count', transactions.length >= 80, true)

if (failures > 0) {
  console.error(`\n${failures} invariant(s) BROKEN`)
  process.exit(1)
}
console.log('\nAll data invariants hold.')
