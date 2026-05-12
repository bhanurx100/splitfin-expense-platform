/**
 * utils/splitpay/__tests__/calculations.test.ts
 *
 * Lightweight tests — run with: bun utils/splitpay/__tests__/calculations.test.ts
 * No Jest dependency required. Uses bun's built-in test runner.
 */

import { describe, test, expect } from "bun:test";
import {
  computeExpenseShares,
  computeGroupBalances,
  computeSettlements,
  computeGroupSettlement,
  validateExpenseShares,
} from "../calculations";
import type { Expense, Group, Member } from "@/types/splitpay";

// ── Fixtures ──────────────────────────────────────────────────────────────────

const members: Member[] = [
  { id: "bhanu",  name: "Bhanu",  phone: "9876543210", color: "#3b82f6" },
  { id: "akhil",  name: "Akhil",  phone: "9876543211", color: "#8b5cf6" },
  { id: "ravi",   name: "Ravi",   phone: "9876543212", color: "#10b981" },
];

function makeExpense(overrides: Partial<Expense>): Expense {
  return {
    id: "e1", groupId: "g1", title: "Dinner", amount: 2400,
    taxPct: 0, tipPct: 0, paidBy: "bhanu",
    splitMethod: "equal",
    participants: members.map(m => ({ memberId: m.id })),
    date: "2024-05-01",
    ...overrides,
  };
}

// ── Equal split ───────────────────────────────────────────────────────────────

describe("equal split", () => {
  test("2400 ÷ 3 = 800 each", () => {
    const shares = computeExpenseShares(makeExpense({}));
    expect(shares["bhanu"]).toBe(800);
    expect(shares["akhil"]).toBe(800);
    expect(shares["ravi"]).toBe(800);
  });

  test("handles indivisible amounts (₹100 ÷ 3)", () => {
    const shares = computeExpenseShares(makeExpense({ amount: 100 }));
    const total  = Object.values(shares).reduce((s, v) => s + v, 0);
    expect(Math.abs(total - 100)).toBeLessThan(0.01);
  });

  test("only 2 participants", () => {
    const shares = computeExpenseShares(makeExpense({
      amount: 600,
      participants: [{ memberId: "akhil" }, { memberId: "ravi" }],
    }));
    expect(shares["akhil"]).toBe(300);
    expect(shares["ravi"]).toBe(300);
    expect(shares["bhanu"]).toBeUndefined();
  });
});

// ── Exact split ───────────────────────────────────────────────────────────────

describe("exact split", () => {
  test("preserves specified values", () => {
    const shares = computeExpenseShares(makeExpense({
      splitMethod: "exact",
      participants: [
        { memberId: "bhanu", value: 1200 },
        { memberId: "akhil", value: 700 },
        { memberId: "ravi",  value: 500 },
      ],
    }));
    expect(shares["bhanu"]).toBe(1200);
    expect(shares["akhil"]).toBe(700);
    expect(shares["ravi"]).toBe(500);
  });

  test("validation fails when sum ≠ amount", () => {
    const expense = makeExpense({
      splitMethod: "exact",
      participants: [
        { memberId: "bhanu", value: 1000 },
        { memberId: "akhil", value: 1000 },
      ],
    });
    const result = validateExpenseShares(expense);
    expect(result.valid).toBe(false);
    expect(result.error).toContain("sum");
  });
});

// ── Percent split ─────────────────────────────────────────────────────────────

describe("percent split", () => {
  test("50/30/20 adds to total", () => {
    const shares = computeExpenseShares(makeExpense({
      splitMethod: "percent",
      participants: [
        { memberId: "bhanu", value: 50 },
        { memberId: "akhil", value: 30 },
        { memberId: "ravi",  value: 20 },
      ],
    }));
    const total = Object.values(shares).reduce((s, v) => s + v, 0);
    expect(Math.abs(total - 2400)).toBeLessThan(0.01);
    expect(shares["bhanu"]).toBe(1200);
    expect(shares["akhil"]).toBe(720);
    expect(shares["ravi"]).toBe(480);
  });
});

// ── Shares split ──────────────────────────────────────────────────────────────

describe("shares split", () => {
  test("2:1:1 shares on ₹2400", () => {
    const shares = computeExpenseShares(makeExpense({
      splitMethod: "shares",
      participants: [
        { memberId: "bhanu", value: 2 },
        { memberId: "akhil", value: 1 },
        { memberId: "ravi",  value: 1 },
      ],
    }));
    expect(shares["bhanu"]).toBe(1200);
    expect(shares["akhil"]).toBe(600);
    expect(shares["ravi"]).toBe(600);
  });
});

// ── Group balances ────────────────────────────────────────────────────────────

describe("computeGroupBalances", () => {
  /**
   * Scenario (from task description):
   *  Dinner ₹2400 — paid by Bhanu, shared equally by all 3
   *  Cab    ₹600  — paid by Akhil, shared by Akhil + Ravi
   */
  const group: Group = {
    id: "g1", name: "Goa Trip", members, expenses: [
      makeExpense({ id: "e1", amount: 2400, paidBy: "bhanu", splitMethod: "equal" }),
      makeExpense({
        id: "e2", title: "Cab", amount: 600, paidBy: "akhil", splitMethod: "equal",
        participants: [{ memberId: "akhil" }, { memberId: "ravi" }],
      }),
    ],
    createdAt: "2024-05-01",
  };

  test("Bhanu paid 2400, owed 800 → net +1600", () => {
    const balances = computeGroupBalances(group);
    const bhanu    = balances.find(b => b.memberId === "bhanu")!;
    expect(bhanu.totalPaid).toBe(2400);
    expect(bhanu.totalOwed).toBe(800);
    expect(bhanu.netBalance).toBe(1600);
  });

  test("Akhil paid 600, owed 800+300=1100 → net -500", () => {
    const balances = computeGroupBalances(group);
    const akhil    = balances.find(b => b.memberId === "akhil")!;
    expect(akhil.totalPaid).toBe(600);
    expect(akhil.totalOwed).toBe(1100);
    expect(akhil.netBalance).toBe(-500);
  });

  test("Ravi paid 0, owed 800+300=1100 → net -1100", () => {
    const balances = computeGroupBalances(group);
    const ravi     = balances.find(b => b.memberId === "ravi")!;
    expect(ravi.totalPaid).toBe(0);
    expect(ravi.totalOwed).toBe(1100);
    expect(ravi.netBalance).toBe(-1100);
  });

  test("net balances sum to zero (conservation)", () => {
    const balances = computeGroupBalances(group);
    const sum      = balances.reduce((s, b) => s + b.netBalance, 0);
    expect(Math.abs(sum)).toBeLessThan(0.01);
  });
});

// ── Settlement optimisation ───────────────────────────────────────────────────

describe("computeSettlements", () => {
  test("Goa Trip: Akhil pays Bhanu 500, Ravi pays Bhanu 1100", () => {
    const group: Group = {
      id: "g1", name: "Goa Trip", members, expenses: [
        makeExpense({ id: "e1", amount: 2400, paidBy: "bhanu", splitMethod: "equal" }),
        makeExpense({
          id: "e2", amount: 600, paidBy: "akhil", splitMethod: "equal",
          participants: [{ memberId: "akhil" }, { memberId: "ravi" }],
        }),
      ],
      createdAt: "2024-05-01",
    };

    const { settlements } = computeGroupSettlement(group);

    // Ravi owes most → matched first against Bhanu's credit
    const raviPays  = settlements.find(s => s.fromId === "ravi");
    const akhilPays = settlements.find(s => s.fromId === "akhil");

    expect(raviPays?.toId).toBe("bhanu");
    expect(raviPays?.amount).toBe(1100);
    expect(akhilPays?.toId).toBe("bhanu");
    expect(akhilPays?.amount).toBe(500);
    // Minimised: at most 2 transactions for 3 people
    expect(settlements.length).toBeLessThanOrEqual(2);
  });

  test("settled balances produce no settlements", () => {
    const balances = members.map(m => ({ memberId: m.id, totalPaid: 1000, totalOwed: 1000, netBalance: 0 }));
    expect(computeSettlements(balances)).toHaveLength(0);
  });
});