/**
 * scripts/seed-demo.ts
 *
 * Realistic demo data for SpendWise finance dashboard.
 * Run: bun ./scripts/seed-demo.ts
 *
 * Generates 90 days of believable Indian personal finance data:
 *  - 3 accounts (HDFC Savings, ICICI Credit Card, SBI Salary)
 *  - 10 categories
 *  - ~180 transactions with realistic merchants, amounts, and patterns
 */

import { neon } from "@neondatabase/serverless";
import { subDays, addDays, format, getDay} from "date-fns";
import { config } from "dotenv";
import { drizzle } from "drizzle-orm/neon-http";
import { accounts, categories, transactions } from "@/src/db/schema";
import { convertAmountToMilliunits } from "@/src/lib/utils";

config({ path: ".env" });

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql);

// ─── CHANGE THIS to your actual Clerk userId ───────────────────────────────────
const SEED_USER_ID = process.env.DEMO_USER_ID || "user_3DiEsxXHqLSrKG7cRKHX7ZYME7E";
// ──────────────────────────────────────────────────────────────────────────────

// ── Accounts ──────────────────────────────────────────────────────────────────
const SEED_ACCOUNTS = [
  { id: "acc_hdfc",   name: "HDFC Savings",      userId: SEED_USER_ID },
  { id: "acc_icici",  name: "ICICI Credit Card",  userId: SEED_USER_ID },
  { id: "acc_sbi",    name: "SBI Salary Account", userId: SEED_USER_ID },
];

// ── Categories ─────────────────────────────────────────────────────────────────
const SEED_CATEGORIES = [
  { id: "cat_food",          name: "Food",           userId: SEED_USER_ID },
  { id: "cat_rent",          name: "Rent",           userId: SEED_USER_ID },
  { id: "cat_shopping",      name: "Shopping",       userId: SEED_USER_ID },
  { id: "cat_travel",        name: "Travel",         userId: SEED_USER_ID },
  { id: "cat_entertainment", name: "Entertainment",  userId: SEED_USER_ID },
  { id: "cat_utilities",     name: "Utilities",      userId: SEED_USER_ID },
  { id: "cat_health",        name: "Health",         userId: SEED_USER_ID },
  { id: "cat_education",     name: "Education",      userId: SEED_USER_ID },
  { id: "cat_salary",        name: "Salary",         userId: SEED_USER_ID },
  { id: "cat_investments",   name: "Investments",    userId: SEED_USER_ID },
];

// ── Type helpers ───────────────────────────────────────────────────────────────
type TxSeed = {
  id: string;
  accountId: string;
  categoryId: string;
  payee: string;
  amount: number;       // plain rupees (positive = income, negative = expense)
  date: Date;
  notes?: string;
};

// ── Utility: pick random item ─────────────────────────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ── Utility: random float in range ────────────────────────────────────────────
function rand(min: number, max: number, step = 1): number {
  const raw = Math.random() * (max - min) + min;
  return Math.round(raw / step) * step;
}

// ── Date helpers ───────────────────────────────────────────────────────────────
const TODAY = new Date();
const DAY_0  = subDays(TODAY, 89); // 90 days ago

function dateAt(daysFromStart: number, hour = 10, minute = 0): Date {
  const d = addDays(DAY_0, daysFromStart);
  d.setHours(hour, minute, 0, 0);
  return d;
}

// ── Salary: credited on 1st of each month ─────────────────────────────────────
function salaryTransactions(): TxSeed[] {
  const result: TxSeed[] = [];
  // Find the 1st of each month within our 90-day window
  for (let offset = 0; offset <= 89; offset++) {
    const d = addDays(DAY_0, offset);
    if (d.getDate() === 1) {
      result.push({
        id: `tx_salary_${format(d, "yyyy-MM")}`,
        accountId: "acc_sbi",
        categoryId: "cat_salary",
        payee: "Information Technologies Ltd",
        amount: 95000,
        date: dateAt(offset, 9, 0),
        notes: "Monthly salary credit",
      });
      // Bonus / allowance credit mid-month
      result.push({
        id: `tx_allowance_${format(d, "yyyy-MM")}`,
        accountId: "acc_sbi",
        categoryId: "cat_salary",
        payee: "Information Technologies Ltd",
        amount: 12000,
        date: dateAt(offset + 14, 9, 15),
        notes: "Travel & conveyance allowance",
      });
    }
  }
  return result;
}

// ── Rent: debited on 2nd of each month ────────────────────────────────────────
function rentTransactions(): TxSeed[] {
  const result: TxSeed[] = [];
  for (let offset = 0; offset <= 89; offset++) {
    const d = addDays(DAY_0, offset);
    if (d.getDate() === 2) {
      result.push({
        id: `tx_rent_${format(d, "yyyy-MM")}`,
        accountId: "acc_hdfc",
        categoryId: "cat_rent",
        payee: "Prestige Properties",
        amount: -28000,
        date: dateAt(offset, 10, 0),
        notes: "Monthly apartment rent — Koramangala 5th Block",
      });
    }
  }
  return result;
}

// ── Recurring utilities & subscriptions ───────────────────────────────────────
function recurringTransactions(): TxSeed[] {
  const result: TxSeed[] = [];

  // Utility bills — 5th of each month
  const utilityBills = [
    { payee: "BESCOM Electricity", amount: () => -rand(1400, 2200, 50) },
    { payee: "Airtel Broadband",   amount: () => -999                  },
    { payee: "BWSSB Water Supply", amount: () => -rand(280, 450, 10)   },
  ];
  // Entertainment subscriptions — 10th of each month
  const subscriptions = [
    { payee: "Netflix India",      amount: () => -649  },
    { payee: "Spotify Premium",    amount: () => -119  },
    { payee: "Amazon Prime",       amount: () => -299  },
    { payee: "Hotstar Disney+",    amount: () => -299  },
  ];
  // SIP / Investment — 5th of each month
  const investments = [
    { payee: "Zerodha Coin SIP",    amount: () => -5000, cat: "cat_investments" },
    { payee: "HDFC Mutual Fund SIP",amount: () => -3000, cat: "cat_investments" },
  ];

  for (let offset = 0; offset <= 89; offset++) {
    const d = addDays(DAY_0, offset);

    if (d.getDate() === 5) {
      utilityBills.forEach((b, i) => {
        result.push({
          id: `tx_util_${i}_${format(d, "yyyy-MM")}`,
          accountId: "acc_hdfc",
          categoryId: "cat_utilities",
          payee: b.payee,
          amount: b.amount(),
          date: dateAt(offset, 11, i * 5),
        });
      });
      investments.forEach((inv, i) => {
        result.push({
          id: `tx_inv_${i}_${format(d, "yyyy-MM")}`,
          accountId: "acc_sbi",
          categoryId: inv.cat,
          payee: inv.payee,
          amount: inv.amount(),
          date: dateAt(offset, 9, 30 + i * 10),
          notes: "Monthly SIP installment",
        });
      });
    }

    if (d.getDate() === 10) {
      // Only 2 subscriptions active at a time (realistic)
      const activeSubs = subscriptions.slice(0, 2);
      activeSubs.forEach((s, i) => {
        result.push({
          id: `tx_sub_${i}_${format(d, "yyyy-MM")}`,
          accountId: "acc_icici",
          categoryId: "cat_entertainment",
          payee: s.payee,
          amount: s.amount(),
          date: dateAt(offset, 10, i * 3),
        });
      });
    }
  }
  return result;
}

// ── Food transactions (Swiggy, Zomato, restaurants) ──────────────────────────
const FOOD_MERCHANTS = [
  { payee: "Swiggy",              range: [180, 580] as [number, number] },
  { payee: "Zomato",              range: [150, 650] as [number, number] },
  { payee: "Café Coffee Day",     range: [120, 280] as [number, number] },
  { payee: "Starbucks",           range: [350, 720] as [number, number] },
  { payee: "Domino's Pizza",      range: [280, 680] as [number, number] },
  { payee: "McDonald's",          range: [180, 420] as [number, number] },
  { payee: "Burger King",         range: [200, 450] as [number, number] },
  { payee: "Barbeque Nation",     range: [800, 1600] as [number, number] },
  { payee: "Social",              range: [600, 1400] as [number, number] },
  { payee: "Truffles",            range: [400, 900] as [number, number] },
  { payee: "MTR Foods",           range: [140, 320] as [number, number] },
  { payee: "KFC",                 range: [220, 520] as [number, number] },
  { payee: "Lunchbox",            range: [120, 260] as [number, number] },
  { payee: "Subway",              range: [200, 380] as [number, number] },
];

// ── Travel (Uber, Ola, Metro, etc.) ──────────────────────────────────────────
const TRAVEL_MERCHANTS = [
  { payee: "Uber",           range: [80, 480] as [number, number]  },
  { payee: "Ola Cabs",       range: [70, 420] as [number, number]  },
  { payee: "Rapido",         range: [40, 180] as [number, number]  },
  { payee: "BMTC Metro",     range: [20, 60]  as [number, number]  },
  { payee: "Namma Metro",    range: [15, 80]  as [number, number]  },
  { payee: "Indian Railways",range: [320, 2800] as [number, number] },
  { payee: "IndiGo Airlines",range: [2800, 8500] as [number, number] },
  { payee: "Air India",      range: [3200, 9200] as [number, number] },
  { payee: "RedBus",         range: [250, 1200] as [number, number] },
];

// ── Shopping ──────────────────────────────────────────────────────────────────
const SHOPPING_MERCHANTS = [
  { payee: "Amazon India",        range: [299, 4500] as [number, number] },
  { payee: "Flipkart",            range: [199, 3800] as [number, number] },
  { payee: "Myntra",              range: [499, 2800] as [number, number] },
  { payee: "Nykaa",               range: [350, 1800] as [number, number] },
  { payee: "Reliance Smart",      range: [800, 3200] as [number, number] },
  { payee: "DMart",               range: [1200, 4500] as [number, number] },
  { payee: "BigBasket",           range: [600, 2800] as [number, number] },
  { payee: "Zepto",               range: [180, 1200] as [number, number] },
  { payee: "Blinkit",             range: [200, 1500] as [number, number] },
  { payee: "Decathlon",           range: [799, 5500] as [number, number] },
  { payee: "H&M India",           range: [999, 4500] as [number, number] },
  { payee: "Zara India",          range: [1999, 8500] as [number, number] },
  { payee: "Westside",            range: [699, 3200] as [number, number] },
];

// ── Health ────────────────────────────────────────────────────────────────────
const HEALTH_MERCHANTS = [
  { payee: "Apollo Pharmacy",     range: [120, 1800] as [number, number] },
  { payee: "MedPlus",             range: [80, 1200]  as [number, number] },
  { payee: "Dr. Reddy's Clinic",  range: [300, 900]  as [number, number] },
  { payee: "Cult.fit Gym",        range: [1200, 2500] as [number, number] },
  { payee: "PharmEasy",           range: [150, 2200] as [number, number] },
  { payee: "Practo",              range: [200, 800]  as [number, number] },
];

// ── Education ─────────────────────────────────────────────────────────────────
const EDUCATION_MERCHANTS = [
  { payee: "Udemy",               range: [399, 1299] as [number, number] },
  { payee: "Coursera",            range: [1500, 4500] as [number, number] },
  { payee: "LinkedIn Learning",   range: [999, 2499] as [number, number] },
  { payee: "Books & Beyond",      range: [250, 1200] as [number, number] },
];

// ── Entertainment ─────────────────────────────────────────────────────────────
const ENTERTAINMENT_MERCHANTS = [
  { payee: "BookMyShow",          range: [200, 1200] as [number, number] },
  { payee: "PVR Cinemas",         range: [250, 900]  as [number, number] },
  { payee: "Inox Multiplex",      range: [220, 850]  as [number, number] },
  { payee: "Steam",               range: [199, 3499] as [number, number] },
  { payee: "PlayStation Store",   range: [499, 3999] as [number, number] },
];

// ── Generate variable daily spend ─────────────────────────────────────────────
function variableDailyTransactions(): TxSeed[] {
  const result: TxSeed[] = [];
  let txCounter = 0;

  for (let offset = 0; offset <= 89; offset++) {
    const d = addDays(DAY_0, offset);
    const dayOfWeek = getDay(d); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Food: 1–3 per day (more on weekends)
    const foodCount = isWeekend ? rand(1, 3, 1) : rand(1, 2, 1);
    for (let i = 0; i < foodCount; i++) {
      const m = pick(FOOD_MERCHANTS);
      result.push({
        id: `tx_food_${offset}_${i}`,
        accountId: pick(["acc_icici", "acc_hdfc"]),
        categoryId: "cat_food",
        payee: m.payee,
        amount: -rand(m.range[0], m.range[1], 10),
        date: dateAt(offset, rand(8, 22, 1), rand(0, 59, 1)),
      });
      txCounter++;
    }

    // Travel: most weekdays (commute), occasional weekend
    if (!isWeekend && Math.random() < 0.75) {
      // Morning commute
      const m = pick(["Uber", "Ola Cabs", "Rapido", "Namma Metro", "BMTC Metro"]);
      const merchant = TRAVEL_MERCHANTS.find(t => t.payee === m) || TRAVEL_MERCHANTS[0];
      result.push({
        id: `tx_travel_am_${offset}`,
        accountId: pick(["acc_icici", "acc_hdfc"]),
        categoryId: "cat_travel",
        payee: merchant.payee,
        amount: -rand(merchant.range[0], merchant.range[1], 5),
        date: dateAt(offset, rand(8, 10, 1), rand(0, 59, 1)),
      });
      // Evening commute (70% chance)
      if (Math.random() < 0.7) {
        result.push({
          id: `tx_travel_pm_${offset}`,
          accountId: pick(["acc_icici", "acc_hdfc"]),
          categoryId: "cat_travel",
          payee: merchant.payee,
          amount: -rand(merchant.range[0], merchant.range[1], 5),
          date: dateAt(offset, rand(18, 21, 1), rand(0, 59, 1)),
        });
      }
      txCounter++;
    }

    // Shopping: 2–3× per week
    if (Math.random() < 0.35) {
      const m = pick(SHOPPING_MERCHANTS);
      result.push({
        id: `tx_shop_${offset}_${txCounter}`,
        accountId: pick(["acc_icici", "acc_hdfc"]),
        categoryId: "cat_shopping",
        payee: m.payee,
        amount: -rand(m.range[0], m.range[1], 50),
        date: dateAt(offset, rand(10, 22, 1), rand(0, 59, 1)),
      });
      txCounter++;
    }

    // Health: ~once a week
    if (Math.random() < 0.14) {
      const m = pick(HEALTH_MERCHANTS);
      result.push({
        id: `tx_health_${offset}_${txCounter}`,
        accountId: "acc_hdfc",
        categoryId: "cat_health",
        payee: m.payee,
        amount: -rand(m.range[0], m.range[1], 20),
        date: dateAt(offset, rand(10, 19, 1), rand(0, 59, 1)),
      });
      txCounter++;
    }

    // Entertainment: weekends mostly
    if (isWeekend && Math.random() < 0.4) {
      const m = pick(ENTERTAINMENT_MERCHANTS);
      result.push({
        id: `tx_ent_${offset}_${txCounter}`,
        accountId: "acc_icici",
        categoryId: "cat_entertainment",
        payee: m.payee,
        amount: -rand(m.range[0], m.range[1], 50),
        date: dateAt(offset, rand(14, 21, 1), rand(0, 59, 1)),
      });
      txCounter++;
    }

    // Education: occasional
    if (Math.random() < 0.06) {
      const m = pick(EDUCATION_MERCHANTS);
      result.push({
        id: `tx_edu_${offset}_${txCounter}`,
        accountId: "acc_hdfc",
        categoryId: "cat_education",
        payee: m.payee,
        amount: -rand(m.range[0], m.range[1], 100),
        date: dateAt(offset, rand(9, 21, 1), rand(0, 59, 1)),
      });
      txCounter++;
    }

    // Bigger travel (flight/train): ~once a month
    if (offset % 28 === 15 || offset % 28 === 16) {
      const m = pick([TRAVEL_MERCHANTS[6], TRAVEL_MERCHANTS[7], TRAVEL_MERCHANTS[8]]); // flights/train
      result.push({
        id: `tx_bigtravel_${offset}`,
        accountId: "acc_icici",
        categoryId: "cat_travel",
        payee: m.payee,
        amount: -rand(m.range[0], m.range[1], 100),
        date: dateAt(offset, 7, 30),
        notes: "Weekend trip",
      });
    }
  }

  return result;
}

// ── HDFC transfer to ICICI (credit card payment) ─────────────────────────────
function creditCardPayments(): TxSeed[] {
  const result: TxSeed[] = [];
  // Pay CC bill on 20th of each month
  for (let offset = 0; offset <= 89; offset++) {
    const d = addDays(DAY_0, offset);
    if (d.getDate() === 20) {
      result.push({
        id: `tx_ccpay_${format(d, "yyyy-MM")}`,
        accountId: "acc_hdfc",
        categoryId: "cat_utilities",
        payee: "ICICI Credit Card Payment",
        amount: -rand(18000, 32000, 500),
        date: dateAt(offset, 12, 0),
        notes: "Monthly credit card bill payment",
      });
    }
  }
  return result;
}

// ── Assemble all transactions ─────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding demo data for SpendWise...\n");

  const allTransactions: TxSeed[] = [
    ...salaryTransactions(),
    ...rentTransactions(),
    ...recurringTransactions(),
    ...variableDailyTransactions(),
    ...creditCardPayments(),
  ].sort((a, b) => a.date.getTime() - b.date.getTime());

  // Deduplicate IDs (safety net)
  const seen = new Set<string>();
  const unique = allTransactions.filter((t) => {
    if (seen.has(t.id)) return false;
    seen.add(t.id);
    return true;
  });

  const dbRows = unique.map((t) => ({
    id: t.id,
    userId: SEED_USER_ID,
    accountId: t.accountId,
    categoryId: t.categoryId,
    payee: t.payee,
    amount: convertAmountToMilliunits(t.amount),
    date: t.date,
    notes: t.notes ?? null,
  }));

  try {
    console.log("🗑️  Clearing existing data...");
    await db.delete(transactions).execute();
    await db.delete(accounts).execute();
    await db.delete(categories).execute();

    console.log("🏦 Seeding accounts...");
    await db.insert(accounts).values(SEED_ACCOUNTS).execute();

    console.log("🏷️  Seeding categories...");
    await db.insert(categories).values(SEED_CATEGORIES).execute();

    console.log(`💳 Seeding ${dbRows.length} transactions...`);
    // Insert in batches of 100
    const BATCH = 100;
    for (let i = 0; i < dbRows.length; i += BATCH) {
      await db.insert(transactions).values(dbRows.slice(i, i + BATCH)).execute();
      process.stdout.write(`   ${Math.min(i + BATCH, dbRows.length)}/${dbRows.length}\r`);
    }

    // ── Summary ───────────────────────────────────────────────────────────────
    const totalIncome  = unique.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
    const totalExpense = unique.filter(t => t.amount < 0).reduce((s, t) => s + t.amount, 0);

    const categoryBreakdown: Record<string, number> = {};
    unique.filter(t => t.amount < 0).forEach(t => {
      const cat = SEED_CATEGORIES.find(c => c.id === t.categoryId)?.name ?? t.categoryId;
      categoryBreakdown[cat] = (categoryBreakdown[cat] ?? 0) + Math.abs(t.amount);
    });

    console.log("\n\n✅ Demo seed complete!\n");
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`  Accounts    : ${SEED_ACCOUNTS.length}`);
    console.log(`  Categories  : ${SEED_CATEGORIES.length}`);
    console.log(`  Transactions: ${dbRows.length}`);
    console.log(`  Date range  : ${format(DAY_0, "dd MMM yyyy")} → ${format(TODAY, "dd MMM yyyy")}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log(`  Total Income :  ₹${totalIncome.toLocaleString("en-IN")}`);
    console.log(`  Total Expense: -₹${Math.abs(totalExpense).toLocaleString("en-IN")}`);
    console.log(`  Net Balance  :  ₹${(totalIncome + totalExpense).toLocaleString("en-IN")}`);
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("\n  Expense breakdown:");
    Object.entries(categoryBreakdown)
      .sort((a, b) => b[1] - a[1])
      .forEach(([cat, amt]) => {
        const bar = "█".repeat(Math.round(amt / 5000));
        console.log(`  ${cat.padEnd(16)} ₹${amt.toLocaleString("en-IN").padStart(10)}  ${bar}`);
      });
    console.log();

  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
}

main();