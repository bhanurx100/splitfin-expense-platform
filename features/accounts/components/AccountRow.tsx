"use client";

/**
 * features/accounts/components/AccountRow.tsx
 *
 * Single row in the accounts list.
 * Height: 60px. Icon: 36px. No shadow. Subtle bottom divider.
 */

import type { DemoAccount } from "@/features/accounts/dev/accounts-demo-data";
import { BadgeIndianRupee, Landmark, Wallet } from "lucide-react";
import { useOpenAccount } from "@/features/accounts/hooks/use-open-account";

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

function AccountIcon({ type }: { type: DemoAccount["type"] }) {
  if (type === "Wallet") return <Wallet className="acct-row__icon-svg" />;
  if (type === "Cash") return <BadgeIndianRupee className="acct-row__icon-svg" />;
  return <Landmark className="acct-row__icon-svg" />;
}

export function AccountRow({ account, isLast }: Props) {
  const openAccount = useOpenAccount((state) => state.onOpen);

  return (
    <button
      type="button"
      className="acct-row"
      onClick={() => openAccount(account.id)}
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
        <AccountIcon type={account.type} />
      </div>

      {/* Name + type */}
      <div className="acct-row__info">
        <span className="acct-row__name">{account.name}</span>
        <span className="acct-row__type">{account.type}</span>
      </div>

      {/* Balance */}
      <span className="acct-row__balance">{formatINR(account.balance)}</span>
    </button>
  );
}
