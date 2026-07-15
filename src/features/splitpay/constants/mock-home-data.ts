/**
 * Mock data for Split Home page.
 * In production this is replaced by API/TanStack Query responses.
 * Components NEVER contain hardcoded data — only consume from here.
 */

import { DEMO_GROUPS, DEMO_CURRENT_USER_ID } from "@/src/data/splitpay/demo";
import { computeGroupSettlement } from "@/src/features/splitpay/lib/calculations";
import { SETTLEMENT_STATUS } from "@/src/config/constants";
import type {
  HomeBalance,
  GroupCardData,
  CurrentUser,
  HomePageData,
  SplitNavItem,
} from "../types";
import type { Group } from "../types";

// ─── Current User ─────────────────────────────────────────────────────────────

const DEMO_USER_MAP: Record<string, CurrentUser> = {
  user_karan: {
    id: "user_karan",
    name: "Karan",
    emoji: "👑",
  },
};

export const MOCK_CURRENT_USER: CurrentUser = DEMO_USER_MAP[DEMO_CURRENT_USER_ID];

// ─── Balance Overview ─────────────────────────────────────────────────────────

function computeHomeBalance(groups: Group[]): HomeBalance {
  let youWillPay = 0;
  let youWillReceive = 0;

  groups.forEach((group) => {
    const settlement = computeGroupSettlement(group);
    const yourBalance = settlement.balances.find((b) => b.memberId === DEMO_CURRENT_USER_ID);
    if (yourBalance) {
      if (yourBalance.netBalance > 0) {
        youWillReceive += yourBalance.netBalance;
      } else {
        youWillPay += Math.abs(yourBalance.netBalance);
      }
    }
  });

  return {
    youWillPay,
    youWillReceive,
    net: youWillReceive - youWillPay,
  };
}

export const MOCK_BALANCE: HomeBalance = computeHomeBalance(DEMO_GROUPS);

// ─── Groups ───────────────────────────────────────────────────────────────────

function groupToCardData(group: Group): GroupCardData {
  const settlement = computeGroupSettlement(group);
  const yourBalance = settlement.balances.find((b) => b.memberId === DEMO_CURRENT_USER_ID);
  const netBalance = yourBalance?.netBalance ?? 0;

  const expenseCount = group.expenses.length;
  const settledCount = settlement.settlements.filter((s) => s.status === SETTLEMENT_STATUS.PAID).length;
  const pendingCount = settlement.settlements.filter((s) => s.status === SETTLEMENT_STATUS.PENDING).length;

  return {
    id: group.id,
    name: group.name,
    emoji: group.emoji,
    memberCount: group.members.length,
    expenseCount,
    settledCount,
    pendingCount,
    yourBalance: netBalance,
    direction: netBalance >= 0 ? "receive" : "pay",
    lastSettledAt: settlement.settlements
      .filter((s) => s.status === SETTLEMENT_STATUS.PAID)
      .sort((a, b) => new Date(b.paidAt || "").getTime() - new Date(a.paidAt || "").getTime())[0]
      ?.paidAt || group.createdAt,
    settledProgress: expenseCount > 0 ? settledCount / expenseCount : 0,
  };
}

export const MOCK_GROUPS: GroupCardData[] = DEMO_GROUPS.map(groupToCardData);

// ─── Composed Page Data ───────────────────────────────────────────────────────

export const MOCK_HOME_DATA: HomePageData = {
  currentUser: MOCK_CURRENT_USER,
  balance: MOCK_BALANCE,
  groups: MOCK_GROUPS,
};

// ─── Bottom Navigation Items ──────────────────────────────────────────────────

export const MOCK_NAV_ITEMS: SplitNavItem[] = [
  {
    id: "overview",
    label: "Overview",
    icon: "home",
    href: "/",
    isActive: false,
  },
  {
    id: "transactions",
    label: "Transactions",
    icon: "arrow-left-right",
    href: "/transactions",
    isActive: false,
  },
  {
    id: "splitpay",
    label: "SplitPay",
    icon: "users",
    href: "/split",
    isActive: true,
  },
  {
    id: "accounts",
    label: "Accounts",
    icon: "credit-card",
    href: "/accounts",
    isActive: false,
  },
  {
    id: "categories",
    label: "Categories",
    icon: "pie-chart",
    href: "/categories",
    isActive: false,
  },
]