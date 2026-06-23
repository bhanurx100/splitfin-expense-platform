"use client";

/**
 * features/accounts/components/AccountRow.tsx
 *
 * Single row in the accounts list.
 * Height: 60px. Icon: 36px. No shadow. Subtle bottom divider.
 */

import type { AccountData } from "@/src/lib/transaction-selectors";
import { BadgeIndianRupee, Landmark, Wallet } from "lucide-react";
import { useOpenAccount } from "@/src/features/accounts/hooks/use-open-account";

interface Props {
  account: AccountData;
  isLast: boolean;
}

/** Format ₹1,25,000 style (en-IN, no decimals) */
function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function AccountIcon({ account }: { account: AccountData }) {
  // Determine icon type based on account name
  const lowerName = account.name.toLowerCase();
  if (lowerName.includes("wallet") || lowerName.includes("paytm") || lowerName.includes("phonepe")) {
    return <Wallet className="acct-row__icon-svg" />;
  }
  if (lowerName.includes("cash")) {
    return <BadgeIndianRupee className="acct-row__icon-svg" />;
  }
  return <Landmark className="acct-row__icon-svg" />;
}

export function AccountRow({ account, isLast }: Props) {
  const openAccount = useOpenAccount((state) => state.onOpen);

  return (
    <button
      type="button"
      className="acct-row"
      onClick={() => openAccount(account.name)}
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--acct-divider)",
      }}
    >
      {/* Icon */}
      <div
        className="acct-row__icon"
        style={{ background: "#6C5CE7" }}
        aria-hidden="true"
      >
        <AccountIcon account={account} />
      </div>

      {/* Name + transaction count */}
      <div className="acct-row__info">
        <span className="acct-row__name">{account.name}</span>
        <span className="acct-row__type">{account.transactionCount} transactions</span>
      </div>

      {/* Balance */}
      <span className="acct-row__balance">{formatINR(account.balance)}</span>
    </button>
  );
}
