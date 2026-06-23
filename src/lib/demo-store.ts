"use client";

/**
 * lib/demo-store.ts
 *
 * Isolated demo mode state — completely separate from the real app.
 * Uses Zustand + localStorage persist with a demo-specific key.
 * Never touches the production DB.
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";

// ── Types ────────────────────────────────────────────────────────────────────

export type DemoAccount = {
  id: string;
  name: string;
  gradient: string;
};

export type DemoCategory = {
  id: string;
  name: string;
};

export type DemoTransaction = {
  id: string;
  date: string; // ISO date string
  category: string | null;
  categoryId: string | null;
  payee: string;
  amount: number; // plain rupees (positive = income, negative = expense)
  account: string;
  accountId: string;
  notes?: string | null;
};

export type DemoSummaryDay = {
  date: string;
  income: number;
  expenses: number;
};

// ── Seed data ─────────────────────────────────────────────────────────────────

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "demo-hdfc",
    name: "HDFC Savings",
    gradient: "from-blue-600 to-blue-400",
  },
  {
    id: "demo-icici",
    name: "ICICI Credit Card",
    gradient: "from-violet-600 to-violet-400",
  },
  {
    id: "demo-sbi",
    name: "SBI Salary Account",
    gradient: "from-emerald-600 to-emerald-400",
  },
];

const DEMO_CATEGORIES: DemoCategory[] = [
  { id: "demo-cat-food", name: "Food" },
  { id: "demo-cat-rent", name: "Rent" },
  { id: "demo-cat-shopping", name: "Shopping" },
  { id: "demo-cat-travel", name: "Travel" },
  { id: "demo-cat-entertainment", name: "Entertainment" },
  { id: "demo-cat-utilities", name: "Utilities" },
  { id: "demo-cat-health", name: "Health" },
  { id: "demo-cat-education", name: "Education" },
  { id: "demo-cat-salary", name: "Salary" },
  { id: "demo-cat-investments", name: "Investments" },
];

function buildDemoTransactions(): DemoTransaction[] {
  const today = new Date();
  const txs: DemoTransaction[] = [];

  // Helper
  const dateStr = (daysAgo: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().slice(0, 10);
  };

  // Salary credits (1st of month)
  txs.push(
    {
      id: "dt-sal-1",
      date: dateStr(28),
      category: "Salary",
      categoryId: "demo-cat-salary",
      payee: "TechCorp India Ltd",
      amount: 95000,
      account: "SBI Salary Account",
      accountId: "demo-sbi",
      notes: "Monthly salary",
    },
    {
      id: "dt-sal-2",
      date: dateStr(58),
      category: "Salary",
      categoryId: "demo-cat-salary",
      payee: "TechCorp India Ltd",
      amount: 95000,
      account: "SBI Salary Account",
      accountId: "demo-sbi",
      notes: "Monthly salary",
    },
    {
      id: "dt-sal-allow-1",
      date: dateStr(14),
      category: "Salary",
      categoryId: "demo-cat-salary",
      payee: "TechCorp India Ltd",
      amount: 12000,
      account: "SBI Salary Account",
      accountId: "demo-sbi",
      notes: "Conveyance allowance",
    }
  );

  // Rent
  txs.push(
    {
      id: "dt-rent-1",
      date: dateStr(26),
      category: "Rent",
      categoryId: "demo-cat-rent",
      payee: "Prestige Properties",
      amount: -28000,
      account: "HDFC Savings",
      accountId: "demo-hdfc",
    },
    {
      id: "dt-rent-2",
      date: dateStr(56),
      category: "Rent",
      categoryId: "demo-cat-rent",
      payee: "Prestige Properties",
      amount: -28000,
      account: "HDFC Savings",
      accountId: "demo-hdfc",
    }
  );

  // Utilities
  txs.push(
    {
      id: "dt-bescom",
      date: dateStr(23),
      category: "Utilities",
      categoryId: "demo-cat-utilities",
      payee: "BESCOM Electricity",
      amount: -1840,
      account: "HDFC Savings",
      accountId: "demo-hdfc",
    },
    {
      id: "dt-airtel",
      date: dateStr(23),
      category: "Utilities",
      categoryId: "demo-cat-utilities",
      payee: "Airtel Broadband",
      amount: -999,
      account: "HDFC Savings",
      accountId: "demo-hdfc",
    },
    {
      id: "dt-bwssb",
      date: dateStr(23),
      category: "Utilities",
      categoryId: "demo-cat-utilities",
      payee: "BWSSB Water",
      amount: -380,
      account: "HDFC Savings",
      accountId: "demo-hdfc",
    },
    {
      id: "dt-bescom-2",
      date: dateStr(53),
      category: "Utilities",
      categoryId: "demo-cat-utilities",
      payee: "BESCOM Electricity",
      amount: -2120,
      account: "HDFC Savings",
      accountId: "demo-hdfc",
    },
    {
      id: "dt-airtel-2",
      date: dateStr(53),
      category: "Utilities",
      categoryId: "demo-cat-utilities",
      payee: "Airtel Broadband",
      amount: -999,
      account: "HDFC Savings",
      accountId: "demo-hdfc",
    }
  );

  // Investments/SIP
  txs.push(
    {
      id: "dt-sip-1",
      date: dateStr(23),
      category: "Investments",
      categoryId: "demo-cat-investments",
      payee: "Zerodha Coin SIP",
      amount: -5000,
      account: "SBI Salary Account",
      accountId: "demo-sbi",
      notes: "Monthly SIP",
    },
    {
      id: "dt-sip-2",
      date: dateStr(23),
      category: "Investments",
      categoryId: "demo-cat-investments",
      payee: "HDFC Mutual Fund SIP",
      amount: -3000,
      account: "SBI Salary Account",
      accountId: "demo-sbi",
      notes: "Monthly SIP",
    },
    {
      id: "dt-sip-3",
      date: dateStr(53),
      category: "Investments",
      categoryId: "demo-cat-investments",
      payee: "Zerodha Coin SIP",
      amount: -5000,
      account: "SBI Salary Account",
      accountId: "demo-sbi",
      notes: "Monthly SIP",
    }
  );

  // Subscriptions
  txs.push(
    {
      id: "dt-netflix",
      date: dateStr(18),
      category: "Entertainment",
      categoryId: "demo-cat-entertainment",
      payee: "Netflix India",
      amount: -649,
      account: "ICICI Credit Card",
      accountId: "demo-icici",
    },
    {
      id: "dt-spotify",
      date: dateStr(18),
      category: "Entertainment",
      categoryId: "demo-cat-entertainment",
      payee: "Spotify Premium",
      amount: -119,
      account: "ICICI Credit Card",
      accountId: "demo-icici",
    },
    {
      id: "dt-hotstar",
      date: dateStr(48),
      category: "Entertainment",
      categoryId: "demo-cat-entertainment",
      payee: "Hotstar Disney+",
      amount: -299,
      account: "ICICI Credit Card",
      accountId: "demo-icici",
    }
  );

  // Daily food
  const foodPlaces = [
    { payee: "Swiggy", range: [180, 580] },
    { payee: "Zomato", range: [150, 650] },
    { payee: "Starbucks", range: [350, 720] },
    { payee: "Café Coffee Day", range: [120, 280] },
    { payee: "Domino's Pizza", range: [280, 680] },
    { payee: "MTR Foods", range: [140, 320] },
    { payee: "McDonald's", range: [180, 420] },
    { payee: "Burger King", range: [200, 450] },
    { payee: "Lunchbox", range: [120, 260] },
    { payee: "Truffles", range: [400, 900] },
  ];

  const travelPlaces = [
    { payee: "Uber", range: [80, 480] },
    { payee: "Ola Cabs", range: [70, 420] },
    { payee: "Rapido", range: [40, 180] },
    { payee: "Namma Metro", range: [15, 80] },
    { payee: "IndiGo", range: [2800, 8500] },
  ];

  const shopPlaces = [
    { payee: "Amazon India", range: [299, 4500] },
    { payee: "Flipkart", range: [199, 3800] },
    { payee: "BigBasket", range: [600, 2800] },
    { payee: "Zepto", range: [180, 1200] },
    { payee: "Blinkit", range: [200, 1500] },
    { payee: "Myntra", range: [499, 2800] },
    { payee: "DMart", range: [1200, 4500] },
  ];

  const healthPlaces = [
    { payee: "Apollo Pharmacy", range: [120, 1800] },
    { payee: "MedPlus", range: [80, 1200] },
    { payee: "Cult.fit Gym", range: [1200, 2500] },
    { payee: "PharmEasy", range: [150, 2200] },
  ];

  // Seeded random for reproducibility
  let seed = 42;
  const rand = (min: number, max: number) => {
    seed = (seed * 1664525 + 1013904223) & 0xffffffff;
    const t = (seed >>> 0) / 0xffffffff;
    return Math.round(t * (max - min) + min);
  };
  const pick = <T>(arr: T[]) => arr[rand(0, arr.length - 1)];

  for (let d = 0; d < 60; d++) {
    const date = dateStr(d);

    // 1-2 food transactions per day
    const foodCount = rand(1, 2);
    for (let i = 0; i < foodCount; i++) {
      const m = pick(foodPlaces);
      txs.push({
        id: `dt-food-${d}-${i}`,
        date,
        category: "Food",
        categoryId: "demo-cat-food",
        payee: m.payee,
        amount: -rand(m.range[0], m.range[1]),
        account: "ICICI Credit Card",
        accountId: "demo-icici",
      });
    }

    // Travel most weekdays
    if (d % 7 < 5 && rand(0, 10) > 3) {
      const m = pick(travelPlaces.slice(0, 4)); // no flights daily
      txs.push({
        id: `dt-travel-${d}`,
        date,
        category: "Travel",
        categoryId: "demo-cat-travel",
        payee: m.payee,
        amount: -rand(m.range[0], m.range[1]),
        account:
          pick(["HDFC Savings", "ICICI Credit Card"]) === "HDFC Savings"
            ? "HDFC Savings"
            : "ICICI Credit Card",
        accountId: pick(["demo-hdfc", "demo-icici"]),
      });
    }

    // Shopping ~2x per week
    if (rand(0, 10) > 7) {
      const m = pick(shopPlaces);
      txs.push({
        id: `dt-shop-${d}`,
        date,
        category: "Shopping",
        categoryId: "demo-cat-shopping",
        payee: m.payee,
        amount: -rand(m.range[0], m.range[1]),
        account: "ICICI Credit Card",
        accountId: "demo-icici",
      });
    }

    // Health ~once a week
    if (rand(0, 10) > 8) {
      const m = pick(healthPlaces);
      txs.push({
        id: `dt-health-${d}`,
        date,
        category: "Health",
        categoryId: "demo-cat-health",
        payee: m.payee,
        amount: -rand(m.range[0], m.range[1]),
        account: "HDFC Savings",
        accountId: "demo-hdfc",
      });
    }

    // Flight trip once
    if (d === 32) {
      txs.push({
        id: `dt-flight-${d}`,
        date,
        category: "Travel",
        categoryId: "demo-cat-travel",
        payee: "IndiGo Airlines",
        amount: -5400,
        account: "ICICI Credit Card",
        accountId: "demo-icici",
        notes: "Hyderabad → Bengaluru",
      });
    }

    // Education occasionally
    if (d === 10 || d === 40) {
      txs.push({
        id: `dt-edu-${d}`,
        date,
        category: "Education",
        categoryId: "demo-cat-education",
        payee: d === 10 ? "Udemy" : "Coursera",
        amount: d === 10 ? -499 : -2499,
        account: "HDFC Savings",
        accountId: "demo-hdfc",
      });
    }
  }

  return txs.sort((a, b) => b.date.localeCompare(a.date));
}

function buildSummaryDays(txs: DemoTransaction[]): DemoSummaryDay[] {
  const map: Record<string, { income: number; expenses: number }> = {};
  txs.forEach((tx) => {
    if (!map[tx.date]) map[tx.date] = { income: 0, expenses: 0 };
    if (tx.amount >= 0) map[tx.date].income += tx.amount;
    else map[tx.date].expenses += Math.abs(tx.amount);
  });
  return Object.entries(map)
    .map(([date, v]) => ({ date, ...v }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

const SEED_TXS = buildDemoTransactions();
const SEED_DAYS = buildSummaryDays(SEED_TXS);

function computeSummary(txs: DemoTransaction[]) {
  const income = txs
    .filter((t) => t.amount > 0)
    .reduce((s, t) => s + t.amount, 0);
  const expenses = txs
    .filter((t) => t.amount < 0)
    .reduce((s, t) => s + t.amount, 0);

  const catMap: Record<string, number> = {};
  txs
    .filter((t) => t.amount < 0)
    .forEach((t) => {
      const k = t.category ?? "Other";
      catMap[k] = (catMap[k] ?? 0) + Math.abs(t.amount);
    });
  const categories = Object.entries(catMap)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  return { income, expenses, remaining: income + expenses, categories };
}

// ── Store shape ───────────────────────────────────────────────────────────────

type DemoStore = {
  accounts: DemoAccount[];
  categories: DemoCategory[];
  transactions: DemoTransaction[];
  summaryDays: DemoSummaryDay[];

  // Actions
  addTransaction: (tx: Omit<DemoTransaction, "id">) => void;
  updateTransaction: (id: string, patch: Partial<DemoTransaction>) => void;
  deleteTransaction: (id: string) => void;
  addAccount: (name: string) => void;
  deleteAccount: (id: string) => void;
  addCategory: (name: string) => void;
  deleteCategory: (id: string) => void;
  resetToSeed: () => void;

  // Derived (computed on access)
  getSummary: () => ReturnType<typeof computeSummary>;
};

let demoIdCounter = 1000;
function demoId(prefix: string) {
  return `${prefix}-${++demoIdCounter}-${Date.now()}`;
}

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      accounts: DEMO_ACCOUNTS,
      categories: DEMO_CATEGORIES,
      transactions: SEED_TXS,
      summaryDays: SEED_DAYS,

      addTransaction: (tx) => {
        const newTx: DemoTransaction = { ...tx, id: demoId("dt-user") };
        set((s) => {
          const txs = [newTx, ...s.transactions].sort((a, b) =>
            b.date.localeCompare(a.date)
          );
          return { transactions: txs, summaryDays: buildSummaryDays(txs) };
        });
      },

      updateTransaction: (id, patch) => {
        set((s) => {
          const txs = s.transactions.map((t) =>
            t.id === id ? { ...t, ...patch } : t
          );
          return { transactions: txs, summaryDays: buildSummaryDays(txs) };
        });
      },

      deleteTransaction: (id) => {
        set((s) => {
          const txs = s.transactions.filter((t) => t.id !== id);
          return { transactions: txs, summaryDays: buildSummaryDays(txs) };
        });
      },

      addAccount: (name) => {
        const gradients = [
          "from-blue-600 to-blue-400",
          "from-violet-600 to-violet-400",
          "from-rose-600 to-rose-400",
          "from-amber-600 to-amber-400",
          "from-cyan-600 to-cyan-400",
        ];
        const gradient = gradients[get().accounts.length % gradients.length];
        set((s) => ({
          accounts: [...s.accounts, { id: demoId("demo-acc"), name, gradient }],
        }));
      },

      deleteAccount: (id) => {
        set((s) => ({
          accounts: s.accounts.filter((a) => a.id !== id),
          transactions: s.transactions.filter((t) => t.accountId !== id),
        }));
      },

      addCategory: (name) => {
        set((s) => ({
          categories: [...s.categories, { id: demoId("demo-cat"), name }],
        }));
      },

      deleteCategory: (id) => {
        set((s) => ({
          categories: s.categories.filter((c) => c.id !== id),
          transactions: s.transactions.map((t) =>
            t.categoryId === id ? { ...t, category: null, categoryId: null } : t
          ),
        }));
      },

      resetToSeed: () => {
        set({
          accounts: DEMO_ACCOUNTS,
          categories: DEMO_CATEGORIES,
          transactions: SEED_TXS,
          summaryDays: SEED_DAYS,
        });
      },

      getSummary: () => computeSummary(get().transactions),
    }),
    {
      name: "splitfin-demo-v1", // isolated from real app data
      partialize: (s) => ({
        accounts: s.accounts,
        categories: s.categories,
        transactions: s.transactions,
        summaryDays: s.summaryDays,
      }),
    }
  )
);
