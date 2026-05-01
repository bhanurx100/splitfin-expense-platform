"use client";

// CHANGES vs mock version
// ─ Removed: `import { ACCOUNTS, Account } from "@/lib/mock-data"`
// ─ Added:   useGetAccounts() — real accounts from backend
// ─ Changed: prop type from `Account` (mock) to `{ id: string; name: string }`
//            which matches what the real hook returns
// ─ Fixed:   dropdown replaced with shadcn DropdownMenu (keyboard accessible,
//            closes on outside click automatically — no manual z-index overlay)
// ─ Added:   loading skeleton for account pill while accounts fetch
// ─ Kept:    search bar behaviour identical to original
// ─ Kept:    all styling identical to original

import { useState } from "react";
import { ChevronDown, Search, Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGetAccounts } from "@/features/accounts/api/use-get-accounts";

// The real API returns { id: string; name: string } — no balance or type
export type RealAccount = { id: string; name: string };

type DashboardHeaderProps = {
  selectedAccountId: string;        // "" = all accounts
  onAccountChange: (acc: RealAccount) => void;
};

export function DashboardHeader({
  selectedAccountId,
  onAccountChange,
}: DashboardHeaderProps) {
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");

  const { data: accounts = [], isLoading } = useGetAccounts();

  const selected = accounts.find((a) => a.id === selectedAccountId);
  const displayName = selected?.name ?? (accounts.length > 0 ? "All accounts" : "…");

  return (
    <div className="relative">
      <div className="flex items-center justify-between">
        {/* Left spacer keeps account pill centred */}
        <div className="w-9" />

        {/* ── Account selector ── */}
        {isLoading ? (
          // Skeleton pill while loading
          <div className="h-9 w-36 animate-pulse rounded-full bg-gray-200" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-2 transition hover:bg-gray-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="max-w-[130px] truncate text-sm font-semibold text-gray-700">
                  {displayName}
                </span>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="center"
              sideOffset={8}
              className="w-56 rounded-2xl border-gray-100 p-1 shadow-xl"
            >
              <DropdownMenuLabel className="px-2 text-xs text-gray-400">
                My Accounts
              </DropdownMenuLabel>
              <DropdownMenuSeparator />

              {/* "All accounts" option — passes empty id */}
              <DropdownMenuItem
                onClick={() => onAccountChange({ id: "", name: "All accounts" })}
                className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 ${
                  selectedAccountId === "" ? "bg-blue-50" : ""
                }`}
              >
                <span className="text-sm font-medium text-gray-700">
                  All accounts
                </span>
                {selectedAccountId === "" && (
                  <div className="h-2 w-2 rounded-full bg-blue-500" />
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              {accounts.map((acc) => (
                <DropdownMenuItem
                  key={acc.id}
                  onClick={() => onAccountChange(acc)}
                  className={`flex cursor-pointer items-center justify-between rounded-xl px-3 py-2.5 ${
                    acc.id === selectedAccountId ? "bg-blue-50" : ""
                  }`}
                >
                  <span className="text-sm font-medium text-gray-700">
                    {acc.name}
                  </span>
                  {acc.id === selectedAccountId && (
                    <div className="h-2 w-2 rounded-full bg-blue-500" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Right icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => {
              setShowSearch((s) => !s);
              setQuery("");
            }}
            aria-label="Toggle search"
            className="rounded-full p-2 transition hover:bg-gray-100"
          >
            <Search className="h-5 w-5 text-gray-600" />
          </button>

          <button
            aria-label="Notifications"
            className="relative rounded-full p-2 transition hover:bg-gray-100"
          >
            <Bell className="h-5 w-5 text-gray-600" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
          </button>
        </div>
      </div>

      {/* Collapsible search bar — identical to original */}
      {showSearch && (
        <div className="mt-3">
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search transactions…"
            className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-700 placeholder-gray-400 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
      )}
    </div>
  );
}