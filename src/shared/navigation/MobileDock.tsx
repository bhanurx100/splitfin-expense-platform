"use client";
/**
 * shared/navigation/MobileDock.tsx
 *
 * Persistent 5-tab bottom dock — mobile only (hidden lg+).
 *
 * Tabs: Overview · Transactions · SplitPay · Categories · Accounts
 *
 * Design rules:
 *  - SplitPay tab gets a raised pill (brand gradient) — no FAB anywhere
 *  - Active tab: brand color icon + label
 *  - Inactive: muted icon + label
 *  - NO floating action button rendered by this component or its parent
 *  - Memo'd: identity-stable, no unnecessary rerenders
 */

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  ArrowLeftRight,
  SplitSquareHorizontal,
  LayoutGrid,
  Wallet, LucideIcon,
} from "lucide-react";
import { cn } from "@/src/lib/utils";

type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
  exact: boolean;
  raised?: boolean;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Overview", Icon: Home, exact: true },
  { href: "/transactions", label: "Transactions", Icon: ArrowLeftRight, exact: false },
  { href: "/split", label: "SplitPay", Icon: SplitSquareHorizontal, exact: false, raised: true },
  { href: "/categories", label: "Categories", Icon: LayoutGrid, exact: false },
  { href: "/accounts", label: "Accounts", Icon: Wallet, exact: false },
] as const;

export const MobileDock = memo(function MobileDock() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-end justify-around lg:hidden"
      style={{
        background: "var(--sf-card)",
        borderTop: "1px solid var(--sf-border-subtle)",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
        paddingTop: "6px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {NAV_ITEMS.map(({ href, label, Icon, exact, raised }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);

        if (raised) {
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center gap-0.5 pb-1 -mt-4"
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full transition-transform active:scale-90"
                style={{
                  background: "linear-gradient(135deg,#6C5CE7 0%,#A29BFE 100%)",
                  boxShadow: "0 4px 18px rgba(108,92,231,0.50)",
                }}
              >
                <Icon className="h-5 w-5 text-white" strokeWidth={2.5} />
              </div>
              <span
                className="text-[10px] font-semibold"
                style={{ color: active ? "#6C5CE7" : "var(--sf-text-muted)" }}
              >
                {label}
              </span>
            </Link>
          );
        }

        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1 min-w-[52px]"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150",
                active && "bg-[rgba(108,92,231,0.10)]",
              )}
            >
              <Icon
                className="h-5 w-5"
                style={{ color: active ? "#6C5CE7" : "var(--sf-text-muted)" }}
                strokeWidth={active ? 2.5 : 1.8}
              />
            </div>
            <span
              className="text-[10px] font-semibold"
              style={{ color: active ? "#6C5CE7" : "var(--sf-text-muted)" }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
});