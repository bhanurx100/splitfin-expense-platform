"use client";

/**
 * features/accounts/components/AccountRow.tsx
 *
 * Single row in the accounts list.
 * Height: 60px. Icon: 36px. No shadow. Subtle bottom divider.
 */

import type { DemoAccount } from "@/features/accounts/dev/accounts-demo-data";

interface Props {
  account: DemoAccount;
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

/** Two-letter initials from account name */
function initials(name: string): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

export function AccountRow({ account, isLast }: Props) {
  return (
    <div
      className="acct-row"
      style={{
        borderBottom: isLast ? "none" : "1px solid var(--acct-divider)",
      }}
    >
      {/* Icon */}
      <div
        className="acct-row__icon"
        style={{ background: account.iconColor }}
        aria-hidden="true"
      >
        {initials(account.name)}
      </div>

      {/* Name + type */}
      <div className="acct-row__info">
        <span className="acct-row__name">{account.name}</span>
        <span className="acct-row__type">{account.type}</span>
      </div>

      {/* Balance */}
      <span className="acct-row__balance">{formatINR(account.balance)}</span>
    </div>
  );
}