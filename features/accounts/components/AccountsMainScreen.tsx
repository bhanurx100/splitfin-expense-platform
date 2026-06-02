"use client";

/**
 * features/accounts/components/AccountsMainScreen.tsx
 *
 * Accounts Home — Screen 1 only.
 * Contains: Header · Hero Balance Card · Filter Pills · Account List
 *
 * Consumes data from: features/accounts/dev/accounts-demo-data.ts
 * (that file is deleted when real API is wired)
 */

import { useState, useMemo } from "react";
import { Plus } from "lucide-react";
import {
  DEMO_ACCOUNTS,
  DEMO_TOTAL_BALANCE,
  type DemoAccount,
} from "@/features/accounts/dev/accounts-demo-data";
import { AccountRow } from "@/features/accounts/components/AccountRow";

// ─── types ────────────────────────────────────────────────────────────────────
type Tab = "All" | "Bank" | "Wallet" | "Cash";
const TABS: Tab[] = ["All", "Bank", "Wallet", "Cash"];

// ─── format helpers ────────────────────────────────────────────────────────────
function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

// ─── Decorative SVG wave (not a chart, not Recharts) ──────────────────────────
function HeroWave() {
  return (
    <svg
      viewBox="0 0 180 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="acct-hero__wave-svg"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
    >
      <path
        d="M2 43 C20 25 35 25 52 43 S84 61 102 43 S134 25 152 43 S171 60 178 50"
        stroke="rgba(255,255,255,.4)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}

// ─── Hero Balance Card ─────────────────────────────────────────────────────────
function HeroCard({ accounts }: { accounts: DemoAccount[] }) {
  return (
    <div className="acct-hero">
      <div className="acct-hero__inner-glow" aria-hidden="true" />
      <div className="acct-hero__wave" aria-hidden="true">
        <HeroWave />
      </div>

      <div className="acct-hero__body">
        <div className="acct-hero__text">
          <p className="acct-hero__label">TOTAL BALANCE</p>
          <p className="acct-hero__amount">{formatINR(DEMO_TOTAL_BALANCE)}</p>
          <p className="acct-hero__meta">
            Across {accounts.length} Accounts
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Filter pills ──────────────────────────────────────────────────────────────
function FilterPills({
  active,
  onChange,
}: {
  active: Tab;
  onChange: (t: Tab) => void;
}) {
  return (
    <div className="acct-pills">
      {TABS.map((tab) => (
        <button
          key={tab}
          type="button"
          onClick={() => onChange(tab)}
          className={
            tab === active ? "acct-pill acct-pill--active" : "acct-pill acct-pill--idle"
          }
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

// ─── Account list container ────────────────────────────────────────────────────
function AccountListCard({ accounts }: { accounts: DemoAccount[] }) {
  if (accounts.length === 0) {
    return (
      <div className="acct-list-card acct-list-empty">
        <p className="acct-list-empty__text">No accounts</p>
      </div>
    );
  }

  return (
    <div className="acct-list-card">
      {accounts.map((acc, i) => (
        <AccountRow
          key={acc.id}
          account={acc}
          isLast={i === accounts.length - 1}
        />
      ))}
    </div>
  );
}

// ─── Main exported component ───────────────────────────────────────────────────
export function AccountsMainScreen() {
  const [activeTab, setActiveTab] = useState<Tab>("All");

  const filtered = useMemo<DemoAccount[]>(() => {
    if (activeTab === "All") return DEMO_ACCOUNTS;
    return DEMO_ACCOUNTS.filter((a) => {
      if (activeTab === "Bank") return a.type === "Bank Account";
      if (activeTab === "Wallet") return a.type === "Wallet";
      if (activeTab === "Cash") return a.type === "Cash";
      return true;
    });
  }, [activeTab]);

  return (
    <div className="acct-screen">
      {/* ── 1. Header ─────────────────────────────────────────────────── */}
      <div className="acct-header">
        <div className="acct-header__left">
          <h1 className="acct-header__title">
            Accounts
            <span className="acct-header__title-plus" aria-hidden="true">
              {" +"}
            </span>
          </h1>
          <p className="acct-header__sub">Manage your money, all in one place.</p>
        </div>
        <button type="button" className="acct-header__btn">
          <Plus className="acct-header__btn-icon" aria-hidden="true" />
          <span>Add Account</span>
        </button>
      </div>

      {/* ── 2. Hero Balance Card ───────────────────────────────────────── */}
      <HeroCard accounts={DEMO_ACCOUNTS} />

      {/* ── 3. Filter Pills ───────────────────────────────────────────── */}
      <FilterPills active={activeTab} onChange={setActiveTab} />

      {/* ── 4. Account List ───────────────────────────────────────────── */}
      <AccountListCard accounts={filtered} />
    </div>
  );
}
