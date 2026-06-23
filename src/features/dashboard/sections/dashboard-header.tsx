"use client";

/**
 * Top bar: period label · account picker · hide/bell actions.
 * Pure presentational — all state lives in page.tsx.
 */

import { Eye, EyeOff, Bell, ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { Skeleton } from "@/src/components/ui/skeleton";

type Account = { id: string; name: string };

type Props = {
  period: string;
  accounts: Account[];
  selectedId: string;
  accName: string;
  hidden: boolean;
  isLoading: boolean;
  onHide: () => void;
  onAccChange: (a: Account) => void;
};

export function DashboardHeader({
  period, accounts, selectedId, accName,
  hidden, isLoading, onHide, onAccChange,
}: Props) {
  return (
    <div
      className="mb-6 flex items-center justify-between pb-5"
      style={{ borderBottom: "1px solid var(--border-subtle)" }}
    >
      <div>
        <h1 className="text-xl font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          Overview
        </h1>
        <p className="text-[13px]" style={{ color: "var(--text-muted)" }}>{period}</p>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Account picker */}
        {isLoading ? (
          <Skeleton className="h-9 w-36 rounded-xl" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="flex items-center gap-2 rounded-xl border px-3 py-1.5 text-[13px] font-medium transition-all focus-visible:outline-none"
                style={{
                  background: "var(--surface-card)",
                  border: "1px solid var(--border-default)",
                  color: "var(--text-secondary)",
                  boxShadow: "var(--shadow-xs)",
                }}
              >
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--color-income-light)" }} />
                <span className="max-w-[130px] truncate">{accName}</span>
                <ChevronDown className="h-3.5 w-3.5 opacity-50" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 shadow-xl">
              <DropdownMenuItem
                className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-[13px]"
                onClick={() => onAccChange({ id: "", name: "All Accounts" })}
              >
                All Accounts
                {selectedId === "" && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {accounts.map(acc => (
                <DropdownMenuItem
                  key={acc.id}
                  className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 text-[13px]"
                  onClick={() => onAccChange(acc)}
                >
                  {acc.name}
                  {acc.id === selectedId && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Hide/show */}
        <button
          type="button"
          onClick={onHide}
          className="flex h-9 w-9 items-center justify-center rounded-xl transition"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-default)",
            color: "var(--text-tertiary)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          {hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>

        {/* Bell (placeholder) */}
        <button
          type="button"
          className="flex h-9 w-9 items-center justify-center rounded-xl transition"
          style={{
            background: "var(--surface-card)",
            border: "1px solid var(--border-default)",
            color: "var(--text-tertiary)",
            boxShadow: "var(--shadow-xs)",
          }}
        >
          <Bell className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}