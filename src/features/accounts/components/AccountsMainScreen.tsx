"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { Plus } from "lucide-react";
import { AccountRow } from "@/src/features/accounts/components/AccountRow";
import { useNewAccount } from "@/src/features/accounts/hooks/use-new-account";
import { useTransactions } from "@/src/hooks/use-transactions";
import { getAccounts, type AccountData } from "@/src/lib/transaction-selectors";

function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

function HeroCard({ accounts }: { accounts: AccountData[] }) {
  const totalBalance = accounts.reduce((sum, account) => sum + account.balance, 0);
  const accountCount = accounts.length;

  return (
    <div className="acct-hero">
      <Image
        src="/acc_light_theme_card.png"
        alt=""
        fill
        priority
        sizes="(max-width: 480px) 100vw, 480px"
        className="acct-hero__image acct-hero__image--light"
        aria-hidden="true"
      />
      <Image
        src="/acc_dark_theme_card.png"
        alt=""
        fill
        priority
        sizes="(max-width: 480px) 100vw, 480px"
        className="acct-hero__image acct-hero__image--dark"
        aria-hidden="true"
      />
      <div className="acct-hero__overlay" aria-hidden="true" />

      <div className="acct-hero__body">
        <div className="acct-hero__text">
          <p className="acct-hero__label">TOTAL BALANCE</p>
          <p className="acct-hero__amount">{formatINR(totalBalance)}</p>
          <p className="acct-hero__meta">Across {accountCount} Accounts</p>
        </div>
      </div>
    </div>
  );
}

function AccountListCard({ accounts }: { accounts: AccountData[] }) {
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
          key={acc.name}
          account={acc}
          isLast={i === accounts.length - 1}
        />
      ))}
    </div>
  );
}

export function AccountsMainScreen() {
  const { data: transactions, isLoading } = useTransactions();
  const newAccount = useNewAccount();

  const accounts = useMemo(() => {
    if (!transactions) return [];
    return getAccounts(transactions);
  }, [transactions]);

  if (isLoading) {
    return (
      <div className="acct-screen">
        <div className="acct-header">
          <div className="acct-header__left">
            <h1 className="acct-header__title">
              Accounts
              <span className="acct-header__title-sparkle" aria-hidden="true">
                ✦
              </span>
            </h1>
            <p className="acct-header__sub">Manage your money, all in one place.</p>
          </div>
          <button type="button" className="acct-header__btn" onClick={newAccount.onOpen}>
            <Plus className="acct-header__btn-icon" aria-hidden="true" />
            <span>Add Account</span>
          </button>
        </div>
        <div className="acct-list-card">
          <div className="animate-pulse h-20 rounded-xl" style={{ background: "var(--surface-card)" }} />
          <div className="animate-pulse h-20 rounded-xl" style={{ background: "var(--surface-card)" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="acct-screen">
      <div className="acct-header">
        <div className="acct-header__left">
          <h1 className="acct-header__title">
            Accounts
            <span className="acct-header__title-sparkle" aria-hidden="true">
              ✦
            </span>
          </h1>
          <p className="acct-header__sub">Manage your money, all in one place.</p>
        </div>
        <button type="button" className="acct-header__btn" onClick={newAccount.onOpen}>
          <Plus className="acct-header__btn-icon" aria-hidden="true" />
          <span>Add Account</span>
        </button>
      </div>

      <HeroCard accounts={accounts} />
      <AccountListCard accounts={accounts} />
    </div>
  );
}
