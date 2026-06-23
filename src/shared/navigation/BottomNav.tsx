"use client";
/**
 * shared/navigation/BottomNav.tsx
 *
 * Mobile bottom navigation for SplitFin.
 * 5 tabs: Overview · Transactions · SplitPay · Categories · Accounts
 * Matches the reference design exactly (purple active state, icon + label).
 *
 * Usage: drop into AppShell in place of the existing BottomNav.
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ArrowLeftRight,
  SplitSquareHorizontal,
  LayoutGrid,
  Wallet,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Overview", icon: Home, exact: true },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight, exact: false },
  { href: "/split", label: "SplitPay", icon: SplitSquareHorizontal, exact: false },
  { href: "/categories", label: "Categories", icon: LayoutGrid, exact: false },
  { href: "/accounts", label: "Accounts", icon: Wallet, exact: false },
] as const;

export function SFBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around lg:hidden"
      style={{
        background: "var(--sf-card)",
        borderTop: "1px solid var(--sf-border-subtle)",
        paddingBottom: "env(safe-area-inset-bottom, 6px)",
        paddingTop: "6px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        const isSplit = href === "/split";

        if (isSplit) {
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-0.5 px-2 py-1 -mt-3"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full shadow-lg transition-transform active:scale-90"
                style={{
                  background: active
                    ? "linear-gradient(135deg,#6C5CE7,#A29BFE)"
                    : "linear-gradient(135deg,#6C5CE7,#A29BFE)",
                  boxShadow: "0 4px 16px rgba(108,92,231,0.45)",
                }}
              >
                <Icon className="h-5 w-5 text-white" strokeWidth={4.5} />
              </div>
              <span className="text-[10px] font-semibold" style={{ color: "var(--brand)" }}>
                {label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center justify-center gap-0.5 px-3 py-1 min-w-[56px]"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150",
                active && "bg-[var(--sf-info-bg)]",
              )}
            >
              <Icon
                className={cn("h-5 w-5 transition-colors")}
                style={{ color: active ? "var(--brand)" : "var(--sf-text-muted)" }}
                strokeWidth={active ? 2.5 : 1.8}
              />
            </div>
            <span
              className="text-[10px] font-semibold transition-colors"
              style={{ color: active ? "var(--brand)" : "var(--sf-text-muted)" }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}