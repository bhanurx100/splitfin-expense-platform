// SINGLE SOURCE OF TRUTH.
// A transaction store + derived selectors. Every page reads from these —
// zero hardcoded display values. Accounts, categories, cash-flow and the
// dashboard all derive from `transactions`.

export type TxType = "income" | "expense" | "transfer" | "refund"

export type Category =
  | "Salary"
  | "Interest"
  | "Refund"
  | "Shopping"
  | "Food"
  | "Travel"
  | "Bills"
  | "Transport"
  | "Entertainment"
  | "Healthcare"
  | "Education"
  | "Rent"
  | "Transfer"
  | "Others"

export type AccountId = "hdfc" | "icici" | "paytm" | "cash"

export interface Transaction {
  id: string
  type: TxType
  amount: number
  category: Category
  account: AccountId
  /** transfer destination account */
  toAccount?: AccountId
  /** ISO date string */
  date: string
  note: string
  merchant: string
}

export interface Account {
  id: AccountId
  name: string
  kind: "Savings Account" | "Salary Account" | "Wallet" | "Cash"
  short: string
}

export const accounts: Account[] = [
  { id: "hdfc", name: "HDFC Bank", kind: "Savings Account", short: "HD" },
  { id: "icici", name: "ICICI Bank", kind: "Salary Account", short: "IC" },
  { id: "paytm", name: "Paytm Wallet", kind: "Wallet", short: "PW" },
  { id: "cash", name: "Cash in Hand", kind: "Cash", short: "₹" },
]

export const incomeCategories: Category[] = ["Salary", "Interest", "Refund"]

// Deterministic pseudo-random so the build is stable but data feels organic.
function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

interface SpendSpec {
  category: Category
  account: AccountId
  merchants: string[]
  min: number
  max: number
}

const spendSpecs: SpendSpec[] = [
  { category: "Food", account: "paytm", merchants: ["Zomato", "Swiggy", "Starbucks", "Dominos"], min: 120, max: 900 },
  { category: "Shopping", account: "icici", merchants: ["Amazon", "Flipkart", "Myntra", "Nykaa"], min: 400, max: 4200 },
  { category: "Transport", account: "paytm", merchants: ["IndianOil", "Uber", "Ola", "Metro"], min: 80, max: 1400 },
  { category: "Bills", account: "hdfc", merchants: ["BSES", "Airtel", "Jio", "ACT Fibernet"], min: 300, max: 2400 },
  { category: "Entertainment", account: "icici", merchants: ["Netflix", "BookMyShow", "Spotify", "PVR"], min: 150, max: 1800 },
  { category: "Healthcare", account: "hdfc", merchants: ["Apollo", "PharmEasy", "1mg", "Practo"], min: 200, max: 2200 },
  { category: "Education", account: "hdfc", merchants: ["Coursera", "Udemy", "Kindle", "Coding Ninjas"], min: 300, max: 2600 },
  { category: "Travel", account: "icici", merchants: ["MakeMyTrip", "IRCTC", "Airbnb", "Goibibo"], min: 800, max: 6500 },
]

function buildTransactions(): Transaction[] {
  const rand = mulberry32(20260613)
  const txs: Transaction[] = []
  const today = new Date()
  today.setHours(12, 0, 0, 0)

  let counter = 0
  const push = (t: Omit<Transaction, "id">) => {
    txs.push({ ...t, id: `tx_${counter++}` })
  }

  // Opening balances (dated before the visible window) so accounts stay funded.
  const openingDate = new Date(today)
  openingDate.setDate(today.getDate() - 400)
  const openingISO = openingDate.toISOString()
  const openings: { account: AccountId; amount: number; merchant: string }[] = [
    { account: "hdfc", amount: 280000, merchant: "Opening Balance" },
    { account: "icici", amount: 160000, merchant: "Opening Balance" },
    { account: "paytm", amount: 40000, merchant: "Opening Balance" },
    { account: "cash", amount: 12000, merchant: "Opening Balance" },
  ]
  for (const o of openings) {
    push({
      type: "income",
      amount: o.amount,
      category: "Interest",
      account: o.account,
      date: openingISO,
      note: "Opening balance",
      merchant: o.merchant,
    })
  }

  // ~12 months of history (365 days back) so 1Y range is rich.
  for (let d = 365; d >= 0; d--) {
    const date = new Date(today)
    date.setDate(today.getDate() - d)
    const iso = date.toISOString()
    const dayOfMonth = date.getDate()

    if (dayOfMonth === 1) {
      push({ type: "income", amount: 110000, category: "Salary", account: "hdfc", date: iso, note: "Monthly salary", merchant: "HDFC Bank" })
    }
    if (dayOfMonth === 5 && date.getMonth() % 3 === 0) {
      push({ type: "income", amount: 500 + Math.round(rand() * 600), category: "Interest", account: "hdfc", date: iso, note: "Savings interest", merchant: "HDFC Bank" })
    }
    if (rand() > 0.93) {
      push({ type: "refund", amount: 150 + Math.round(rand() * 600), category: "Refund", account: "paytm", date: iso, note: "Refund credited", merchant: "Amazon" })
    }
    if (dayOfMonth === 3) {
      push({ type: "expense", amount: 22000, category: "Rent", account: "hdfc", date: iso, note: "House rent", merchant: "Landlord" })
    }
    // Monthly transfer to savings
    if (dayOfMonth === 7) {
      push({ type: "transfer", amount: 8000, category: "Transfer", account: "hdfc", toAccount: "icici", date: iso, note: "Transfer to ICICI", merchant: "Self" })
    }

    const spends = Math.floor(rand() * 3)
    for (let s = 0; s < spends; s++) {
      const spec = spendSpecs[Math.floor(rand() * spendSpecs.length)]
      const amount = Math.round(spec.min + rand() * (spec.max - spec.min))
      const merchant = spec.merchants[Math.floor(rand() * spec.merchants.length)]
      push({
        type: "expense",
        amount,
        category: spec.category,
        account: spec.account,
        date: iso,
        note: `${spec.category} · ${merchant}`,
        merchant,
      })
    }
  }

  // A few recent named transactions matching the reference screens.
  const recentNamed: { back: number; t: Omit<Transaction, "id" | "date"> }[] = [
    { back: 0, t: { type: "income", amount: 50000, category: "Salary", account: "hdfc", note: "Salary Credited", merchant: "HDFC Bank" } },
    { back: 0, t: { type: "expense", amount: 450, category: "Food", account: "paytm", note: "Lunch at Zomato", merchant: "Zomato" } },
    { back: 0, t: { type: "expense", amount: 420, category: "Transport", account: "paytm", note: "Petrol", merchant: "IndianOil" } },
    { back: 1, t: { type: "expense", amount: 1280, category: "Shopping", account: "icici", note: "Amazon Order", merchant: "Amazon" } },
    { back: 1, t: { type: "expense", amount: 890, category: "Bills", account: "hdfc", note: "Electricity Bill", merchant: "BSES" } },
    { back: 1, t: { type: "refund", amount: 210, category: "Refund", account: "paytm", note: "Cashback Received", merchant: "Paytm" } },
    { back: 1, t: { type: "transfer", amount: 870, category: "Transfer", account: "hdfc", toAccount: "icici", note: "Transfer to ICICI", merchant: "Self" } },
  ]
  for (const r of recentNamed) {
    const date = new Date(today)
    date.setDate(today.getDate() - r.back)
    date.setHours(9 + Math.floor(rand() * 12), Math.floor(rand() * 59), 0, 0)
    push({ ...r.t, date: date.toISOString() })
  }

  return txs.sort((a, b) => +new Date(a.date) - +new Date(b.date))
}

export const transactions: Transaction[] = buildTransactions()

// ---------- Selectors ----------

export type RangeKey = "1M" | "3M" | "6M" | "1Y"

export const ranges: { key: RangeKey; label: string; days: number }[] = [
  { key: "1M", label: "1M", days: 30 },
  { key: "3M", label: "3M", days: 90 },
  { key: "6M", label: "6M", days: 180 },
  { key: "1Y", label: "1Y", days: 365 },
]

export function txInRange(txs: Transaction[], range: RangeKey): Transaction[] {
  const days = ranges.find((r) => r.key === range)!.days
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000
  return txs.filter((t) => +new Date(t.date) >= cutoff)
}

/** Signed effect of a tx on net worth. Transfers are net-zero across accounts. */
function netEffect(t: Transaction): number {
  if (t.type === "income" || t.type === "refund") return t.amount
  if (t.type === "expense") return -t.amount
  return 0 // transfer
}

export function totalBalance(txs: Transaction[]): number {
  return txs.reduce((sum, t) => sum + netEffect(t), 0)
}

export function accountBalance(txs: Transaction[], id: AccountId): number {
  return txs.reduce((sum, t) => {
    if (t.type === "transfer") {
      if (t.account === id) return sum - t.amount
      if (t.toAccount === id) return sum + t.amount
      return sum
    }
    if (t.account !== id) return sum
    return sum + netEffect(t)
  }, 0)
}

export interface AccountFlow {
  inflow: number
  outflow: number
  count: number
}

/** Inflow / outflow for an account within a set of txs (e.g. current month). */
export function accountFlow(txs: Transaction[], id: AccountId): AccountFlow {
  let inflow = 0
  let outflow = 0
  let count = 0
  for (const t of txs) {
    if (t.type === "transfer") {
      if (t.account === id) {
        outflow += t.amount
        count++
      } else if (t.toAccount === id) {
        inflow += t.amount
        count++
      }
      continue
    }
    if (t.account !== id) continue
    count++
    if (t.type === "expense") outflow += t.amount
    else inflow += t.amount
  }
  return { inflow, outflow, count }
}

/** % change of net flow this period vs previous equal period. */
export function periodChangePct(txs: Transaction[], range: RangeKey): number {
  const days = ranges.find((r) => r.key === range)!.days
  const now = Date.now()
  const ms = days * 24 * 60 * 60 * 1000
  const net = (from: number, to: number) =>
    txs
      .filter((t) => {
        const d = +new Date(t.date)
        return d >= from && d < to
      })
      .reduce((s, t) => s + netEffect(t), 0)
  const current = net(now - ms, now)
  const previous = net(now - 2 * ms, now - ms)
  if (previous === 0) return current === 0 ? 0 : 100
  const pct = ((current - previous) / Math.abs(previous)) * 100
  return Math.max(-99, Math.min(99, pct))
}

/** Net flow (income - expense) over a range, plus absolute change vs prior. */
export function periodChangeAmount(txs: Transaction[], range: RangeKey): number {
  const days = ranges.find((r) => r.key === range)!.days
  const now = Date.now()
  const ms = days * 24 * 60 * 60 * 1000
  const net = (from: number, to: number) =>
    txs
      .filter((t) => {
        const d = +new Date(t.date)
        return d >= from && d < to
      })
      .reduce((s, t) => s + netEffect(t), 0)
  return net(now - ms, now) - net(now - 2 * ms, now - ms)
}

export interface DayPoint {
  date: string
  income: number
  expense: number
  count: number
}

/** Aggregate by day for the wave chart. Days with no activity stay at 0. */
export function dailySeries(txs: Transaction[], range: RangeKey): DayPoint[] {
  const days = ranges.find((r) => r.key === range)!.days
  const map = new Map<string, DayPoint>()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(today.getDate() - i)
    const key = d.toISOString().slice(0, 10)
    map.set(key, { date: key, income: 0, expense: 0, count: 0 })
  }
  for (const t of txs) {
    const key = new Date(t.date).toISOString().slice(0, 10)
    const point = map.get(key)
    if (!point) continue
    if (t.type === "income" || t.type === "refund") point.income += t.amount
    else if (t.type === "expense") point.expense += t.amount
    if (t.type !== "transfer") point.count += 1
  }
  return Array.from(map.values())
}

/** Fixed symmetric y-axis steps shared by every range. */
export const Y_STEPS = [0, 250, 500, 1000, 2000, 5000, 10000]

/**
 * SMART DYNAMIC SCALING.
 * Peak is NOT the highest value — use the SECOND largest, rounded up to a
 * clean nice step, so a single outlier never flattens the wave.
 */
export function smartPeak(values: number[]): number {
  const cleaned = values.filter((v) => v > 0).sort((a, b) => a - b)
  if (cleaned.length === 0) return 1000
  const secondHighest = cleaned.length > 1 ? cleaned[cleaned.length - 2] : cleaned[cleaned.length - 1]
  return roundUpNice(secondHighest)
}

function roundUpNice(n: number): number {
  if (n <= 0) return 1000
  // snap to the nearest predefined step at or above n
  for (const step of Y_STEPS) {
    if (step >= n) return step
  }
  const pow = Math.pow(10, Math.floor(Math.log10(n)))
  const steps = [1, 2, 2.5, 5, 10]
  for (const s of steps) {
    const candidate = s * pow
    if (candidate >= n) return candidate
  }
  return 10 * pow
}

export interface AxisLabel {
  /** index into the daily series */
  index: number
  label: string
}

/** X-axis labels per range, matching the design spec. */
export function axisLabels(series: DayPoint[], range: RangeKey): AxisLabel[] {
  const n = series.length
  if (n === 0) return []
  const labels: AxisLabel[] = []
  const seen = new Set<string>()
  const monthFmt = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { month: "short" })

  if (range === "1M") {
    for (let i = 0; i < n; i++) {
      const day = new Date(series[i].date).getDate()
      if ([1, 5, 10, 15, 20, 25, 30].includes(day) && !seen.has(String(day))) {
        seen.add(String(day))
        labels.push({ index: i, label: String(day) })
      }
    }
  } else {
    // month-based ranges: label first occurrence of each month
    const everyMonth = range === "3M" || range === "6M"
    for (let i = 0; i < n; i++) {
      const d = new Date(series[i].date)
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (seen.has(key)) continue
      seen.add(key)
      const monthIdx = d.getMonth()
      if (range === "1Y" && monthIdx % 2 !== 0) continue
      if (everyMonth || monthIdx % 2 === 0) {
        labels.push({ index: i, label: monthFmt(series[i].date) })
      }
    }
  }
  return labels
}

export interface CategoryTotal {
  category: Category
  total: number
  count: number
}

export function spendingByCategory(txs: Transaction[]): CategoryTotal[] {
  const map = new Map<Category, { total: number; count: number }>()
  for (const t of txs) {
    if (t.type !== "expense") continue
    const cur = map.get(t.category) ?? { total: 0, count: 0 }
    cur.total += t.amount
    cur.count += 1
    map.set(t.category, cur)
  }
  return Array.from(map.entries())
    .map(([category, v]) => ({ category, total: v.total, count: v.count }))
    .sort((a, b) => b.total - a.total)
}

export function totalIncome(txs: Transaction[]): number {
  return txs.filter((t) => t.type === "income" || t.type === "refund").reduce((s, t) => s + t.amount, 0)
}

export function totalExpense(txs: Transaction[]): number {
  return txs.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0)
}

export function recentTransactions(txs: Transaction[], limit = 5): Transaction[] {
  return [...txs].sort((a, b) => +new Date(b.date) - +new Date(a.date)).slice(0, limit)
}

export interface DayGroup {
  key: string
  label: string
  date: string
  items: Transaction[]
  total: number
}

/** Group transactions by day, newest first — for the Transactions feed. */
export function groupByDay(txs: Transaction[]): DayGroup[] {
  const sorted = [...txs].sort((a, b) => +new Date(b.date) - +new Date(a.date))
  const map = new Map<string, Transaction[]>()
  for (const t of sorted) {
    const key = new Date(t.date).toISOString().slice(0, 10)
    const arr = map.get(key) ?? []
    arr.push(t)
    map.set(key, arr)
  }
  return [...Array.from(map.entries())].map(([key, items]) => ({
    key,
    label: relativeDay(items[0].date),
    date: items[0].date,
    items,
    total: items.reduce((s, t) => s + (t.type === "expense" ? t.amount : t.amount), 0),
  }))
}

export type TxFilter = "all" | "income" | "expense" | "transfer" | "refund"

export function filterByType(txs: Transaction[], f: TxFilter): Transaction[] {
  if (f === "all") return txs
  return txs.filter((t) => t.type === f)
}

// ---------- Formatting ----------

export function formatINR(n: number, opts?: { sign?: boolean }): string {
  const abs = Math.abs(Math.round(n))
  const formatted = abs.toLocaleString("en-IN")
  const sign = opts?.sign ? (n < 0 ? "-" : "+") : n < 0 ? "-" : ""
  return `${sign}₹${formatted}`
}

export function formatCompactINR(n: number): string {
  const abs = Math.abs(n)
  const sign = n < 0 ? "-" : ""
  if (abs >= 10000000) return `${sign}₹${(abs / 10000000).toFixed(2)}Cr`
  if (abs >= 100000) return `${sign}₹${(abs / 100000).toFixed(2)}L`
  if (abs >= 1000) return `${sign}₹${(abs / 1000).toFixed(abs >= 10000 ? 0 : 1)}k`
  return `${sign}₹${Math.round(abs)}`
}

export function relativeDay(iso: string): string {
  const d = new Date(iso)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const that = new Date(d)
  that.setHours(0, 0, 0, 0)
  const diff = Math.round((+today - +that) / (24 * 60 * 60 * 1000))
  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  if (diff < 7) return `${diff} days ago`
  return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
}

export function currentMonthLabel(): string {
  return new Date().toLocaleDateString("en-IN", { month: "long", year: "numeric" })
}
