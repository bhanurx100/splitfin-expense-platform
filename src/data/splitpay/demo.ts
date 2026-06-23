/**
 * data/splitpay/demo.ts
 *
 * Realistic demo data for the SplitPay feature.
 * Covers all split methods: equal, exact, percent, shares.
 * Three groups: Goa Trip, Flat Expenses, Team Dinner.
 *
 * Usage: imported by hooks/splitpay/useGroupStore.ts
 * to seed the Zustand store on first load (no data in localStorage).
 */

import type { Group } from "@/src/features/splitpay/types";

// ─────────────────────────────────────────────────────────────────────────────
// Member color palette (matches AVATAR_COLORS in useGroupStore)
// ─────────────────────────────────────────────────────────────────────────────

const COLORS = {
  blue:    "#3b82f6",
  purple:  "#8b5cf6",
  pink:    "#ec4899",
  green:   "#10b981",
  amber:   "#f59e0b",
  red:     "#ef4444",
  cyan:    "#06b6d4",
  lime:    "#84cc16",
  orange:  "#f97316",
  indigo:  "#6366f1",
};

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 1 — Goa Trip 🌴
// Members: Bhanu, Akhil, Priya, Ravi
// Expenses: hotel (equal), flights (exact), food (percent), activities (shares)
// Payers: all four members take turns
// ─────────────────────────────────────────────────────────────────────────────

const goaTrip: Group = {
  id: "demo-goa-trip",
  name: "Goa Trip",
  emoji: "🌴",
  createdAt: "2025-04-01T00:00:00.000Z",

  members: [
    { id: "goa-bhanu", name: "Bhanu",  phone: "9876543210", color: COLORS.blue,   upiId: "bhanu@okicici"  },
    { id: "goa-akhil", name: "Akhil",  phone: "9876543211", color: COLORS.purple, upiId: "akhil@okhdfc"   },
    { id: "goa-priya", name: "Priya",  phone: "9876543212", color: COLORS.pink,   upiId: "priya@oksbi"    },
    { id: "goa-ravi",  name: "Ravi",   phone: "9876543213", color: COLORS.green,  upiId: "ravi@okaxis"    },
  ],

  expenses: [
    // ── Equal split ───────────────────────────────────────────────────────
    {
      id: "goa-exp-1",
      groupId: "demo-goa-trip",
      title: "Hotel (3 nights)",
      amount: 12000,
      taxPct: 0,
      tipPct: 0,
      paidBy: "goa-bhanu",
      splitMethod: "equal",
      participants: [
        { memberId: "goa-bhanu" },
        { memberId: "goa-akhil" },
        { memberId: "goa-priya" },
        { memberId: "goa-ravi"  },
      ],
      date: "2025-04-10",
      notes: "Airbnb Calangute",
    },

    // ── Exact split ───────────────────────────────────────────────────────
    {
      id: "goa-exp-2",
      groupId: "demo-goa-trip",
      title: "IndiGo Flights",
      amount: 18400,
      taxPct: 0,
      tipPct: 0,
      paidBy: "goa-akhil",
      splitMethod: "exact",
      participants: [
        { memberId: "goa-bhanu", value: 4800 },
        { memberId: "goa-akhil", value: 4800 },
        { memberId: "goa-priya", value: 4400 }, // booked earlier, cheaper
        { memberId: "goa-ravi",  value: 4400 },
      ],
      date: "2025-04-10",
    },

    // ── Percent split ─────────────────────────────────────────────────────
    {
      id: "goa-exp-3",
      groupId: "demo-goa-trip",
      title: "Thalassa Beach Dinner",
      amount: 6200,
      taxPct: 5,
      tipPct: 10,
      paidBy: "goa-priya",
      splitMethod: "percent",
      participants: [
        { memberId: "goa-bhanu", value: 30 },
        { memberId: "goa-akhil", value: 30 },
        { memberId: "goa-priya", value: 25 },
        { memberId: "goa-ravi",  value: 15 }, // had less
      ],
      date: "2025-04-11",
    },

    // ── Shares split ──────────────────────────────────────────────────────
    {
      id: "goa-exp-4",
      groupId: "demo-goa-trip",
      title: "Water Sports + Scooter",
      amount: 4800,
      taxPct: 0,
      tipPct: 0,
      paidBy: "goa-ravi",
      splitMethod: "shares",
      participants: [
        { memberId: "goa-bhanu", value: 2 }, // parasailing + scooter
        { memberId: "goa-akhil", value: 2 }, // parasailing + scooter
        { memberId: "goa-priya", value: 1 }, // scooter only
        { memberId: "goa-ravi",  value: 1 }, // scooter only
      ],
      date: "2025-04-12",
    },

    // ── Equal split ───────────────────────────────────────────────────────
    {
      id: "goa-exp-5",
      groupId: "demo-goa-trip",
      title: "Uber + Ola Rides",
      amount: 1560,
      taxPct: 0,
      tipPct: 0,
      paidBy: "goa-bhanu",
      splitMethod: "equal",
      participants: [
        { memberId: "goa-bhanu" },
        { memberId: "goa-akhil" },
        { memberId: "goa-priya" },
        { memberId: "goa-ravi"  },
      ],
      date: "2025-04-11",
    },

    // ── Equal split ───────────────────────────────────────────────────────
    {
      id: "goa-exp-6",
      groupId: "demo-goa-trip",
      title: "Groceries & Drinks",
      amount: 2200,
      taxPct: 0,
      tipPct: 0,
      paidBy: "goa-akhil",
      splitMethod: "equal",
      participants: [
        { memberId: "goa-bhanu" },
        { memberId: "goa-akhil" },
        { memberId: "goa-priya" },
        { memberId: "goa-ravi"  },
      ],
      date: "2025-04-12",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 2 — Flat Expenses 🏠
// Members: Bhanu, Kiran, Sneha
// Monthly recurring bills — realistic Bengaluru flat scenario
// ─────────────────────────────────────────────────────────────────────────────

const flatExpenses: Group = {
  id: "demo-flat-expenses",
  name: "Flat Expenses",
  emoji: "🏠",
  createdAt: "2025-03-01T00:00:00.000Z",

  members: [
    { id: "flat-bhanu", name: "Bhanu", phone: "9876543210", color: COLORS.blue,   upiId: "bhanu@okicici" },
    { id: "flat-kiran", name: "Kiran", phone: "9845001234", color: COLORS.cyan,   upiId: "kiran@okaxis"  },
    { id: "flat-sneha", name: "Sneha", phone: "9900112233", color: COLORS.lime,   upiId: "sneha@oksbi"   },
  ],

  expenses: [
    // ── Equal split ───────────────────────────────────────────────────────
    {
      id: "flat-exp-1",
      groupId: "demo-flat-expenses",
      title: "April Rent",
      amount: 24000,
      taxPct: 0,
      tipPct: 0,
      paidBy: "flat-bhanu",
      splitMethod: "equal",
      participants: [
        { memberId: "flat-bhanu" },
        { memberId: "flat-kiran" },
        { memberId: "flat-sneha" },
      ],
      date: "2025-04-01",
    },

    // ── Exact split ───────────────────────────────────────────────────────
    {
      id: "flat-exp-2",
      groupId: "demo-flat-expenses",
      title: "BESCOM Electricity",
      amount: 2340,
      taxPct: 0,
      tipPct: 0,
      paidBy: "flat-kiran",
      splitMethod: "exact",
      participants: [
        { memberId: "flat-bhanu", value: 1040 }, // AC usage
        { memberId: "flat-kiran", value:  800 },
        { memberId: "flat-sneha", value:  500 },
      ],
      date: "2025-04-05",
    },

    // ── Equal split ───────────────────────────────────────────────────────
    {
      id: "flat-exp-3",
      groupId: "demo-flat-expenses",
      title: "Airtel Broadband",
      amount: 999,
      taxPct: 18,
      tipPct: 0,
      paidBy: "flat-sneha",
      splitMethod: "equal",
      participants: [
        { memberId: "flat-bhanu" },
        { memberId: "flat-kiran" },
        { memberId: "flat-sneha" },
      ],
      date: "2025-04-05",
    },

    // ── Equal split ───────────────────────────────────────────────────────
    {
      id: "flat-exp-4",
      groupId: "demo-flat-expenses",
      title: "BigBasket Groceries",
      amount: 3600,
      taxPct: 0,
      tipPct: 0,
      paidBy: "flat-bhanu",
      splitMethod: "equal",
      participants: [
        { memberId: "flat-bhanu" },
        { memberId: "flat-kiran" },
        { memberId: "flat-sneha" },
      ],
      date: "2025-04-08",
    },

    // ── Shares split ──────────────────────────────────────────────────────
    {
      id: "flat-exp-5",
      groupId: "demo-flat-expenses",
      title: "BWSSB Water + Maintenance",
      amount: 2100,
      taxPct: 0,
      tipPct: 0,
      paidBy: "flat-kiran",
      splitMethod: "shares",
      participants: [
        { memberId: "flat-bhanu", value: 2 }, // master bedroom
        { memberId: "flat-kiran", value: 2 }, // master bedroom
        { memberId: "flat-sneha", value: 1 }, // smaller room
      ],
      date: "2025-04-05",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// GROUP 3 — Team Dinner 🍽️
// Members: Bhanu, Meera, Arjun, Nisha, Dev
// Single event, multiple payers, percent + equal mix
// ─────────────────────────────────────────────────────────────────────────────

const teamDinner: Group = {
  id: "demo-team-dinner",
  name: "Team Dinner",
  emoji: "🍽️",
  createdAt: "2025-04-15T00:00:00.000Z",

  members: [
    { id: "td-bhanu", name: "Bhanu", phone: "9876543210", color: COLORS.blue,   upiId: "bhanu@okicici" },
    { id: "td-meera", name: "Meera", phone: "9845009876", color: COLORS.amber,  upiId: "meera@okhdfc"  },
    { id: "td-arjun", name: "Arjun", phone: "9901234567", color: COLORS.red,    upiId: "arjun@oksbi"   },
    { id: "td-nisha", name: "Nisha", phone: "9812345678", color: COLORS.indigo, upiId: "nisha@okaxis"  },
    { id: "td-dev",   name: "Dev",   phone: "9898765432", color: COLORS.orange, upiId: "dev@okicici"   },
  ],

  expenses: [
    // ── Equal split (main course) ─────────────────────────────────────────
    {
      id: "td-exp-1",
      groupId: "demo-team-dinner",
      title: "Hard Rock Cafe — Food",
      amount: 8500,
      taxPct: 5,
      tipPct: 0,
      paidBy: "td-meera",
      splitMethod: "equal",
      participants: [
        { memberId: "td-bhanu" },
        { memberId: "td-meera" },
        { memberId: "td-arjun" },
        { memberId: "td-nisha" },
        { memberId: "td-dev"   },
      ],
      date: "2025-04-18",
    },

    // ── Exact split (drinks — some had more) ─────────────────────────────
    {
      id: "td-exp-2",
      groupId: "demo-team-dinner",
      title: "Drinks & Cocktails",
      amount: 4200,
      taxPct: 0,
      tipPct: 0,
      paidBy: "td-arjun",
      splitMethod: "exact",
      participants: [
        { memberId: "td-bhanu", value:  800 },
        { memberId: "td-meera", value:  600 }, // soft drinks only
        { memberId: "td-arjun", value: 1200 },
        { memberId: "td-nisha", value:  600 }, // soft drinks only
        { memberId: "td-dev",   value: 1000 },
      ],
      date: "2025-04-18",
    },

    // ── Equal split (cab pool back) ───────────────────────────────────────
    {
      id: "td-exp-3",
      groupId: "demo-team-dinner",
      title: "Cab Pool (Indiranagar → Koramangala)",
      amount: 680,
      taxPct: 0,
      tipPct: 0,
      paidBy: "td-bhanu",
      splitMethod: "equal",
      participants: [
        { memberId: "td-bhanu" },
        { memberId: "td-arjun" },
        { memberId: "td-dev"   },
      ],
      date: "2025-04-18",
    },

    // ── Percent split (farewell gift contribution) ────────────────────────
    {
      id: "td-exp-4",
      groupId: "demo-team-dinner",
      title: "Farewell Gift for Meera",
      amount: 3000,
      taxPct: 0,
      tipPct: 0,
      paidBy: "td-nisha",
      splitMethod: "percent",
      participants: [
        { memberId: "td-bhanu", value: 30 },
        { memberId: "td-arjun", value: 25 },
        { memberId: "td-nisha", value: 20 },
        { memberId: "td-dev",   value: 25 },
        // Meera is the recipient, excluded
      ],
      date: "2025-04-17",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// EXPORT
// ─────────────────────────────────────────────────────────────────────────────

/** All demo groups, ordered by visual impact (most interesting first) */
export const DEMO_GROUPS: Group[] = [goaTrip, flatExpenses, teamDinner];

/** The group to open by default when demo data is first loaded */
export const DEMO_DEFAULT_ACTIVE_GROUP_ID = goaTrip.id;