"use client";
// components/app/AppShell.tsx

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import {
  Home,
  ArrowLeftRight,
  LayoutGrid,
  SplitSquareHorizontal,
  Wallet,
  Loader2,
  TrendingUp,
} from "lucide-react";
import { FAB } from "./FAB";
import { ThemeToggle, ThemeToggleCompact } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

// ── Nav config ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: "/",             label: "Overview",     icon: Home,                  exact: true  },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight,        exact: false },
  { href: "/categories",   label: "Categories",   icon: LayoutGrid,            exact: false },
  { href: "/accounts",     label: "Accounts",     icon: Wallet,                exact: false },
  { href: "/split",        label: "Split Pay",    icon: SplitSquareHorizontal, exact: false },
] as const;

// ── Sidebar (desktop only) ────────────────────────────────────────────────────
function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className={cn(
      "fixed inset-y-0 left-0 z-40 hidden w-60 flex-col lg:flex",
      "ds-sidebar"
    )}>
      {/* Logo */}
      <div className="flex h-16 flex-shrink-0 items-center gap-3 border-b border-[var(--sidebar-border)] px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
          <TrendingUp className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-bold tracking-tight text-[var(--text-primary)]">
          SpendWise
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-[var(--text-muted)]">
          Menu
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium transition-all duration-150",
                active
                  ? "bg-[var(--sidebar-nav-active)] text-[var(--sidebar-nav-active-text)] font-semibold"
                  : "text-[var(--text-secondary)] hover:bg-[var(--sidebar-nav-hover)] hover:text-[var(--text-primary)]"
              )}
            >
              <Icon
                className={cn(
                  "h-[18px] w-[18px] flex-shrink-0 transition-colors",
                  active
                    ? "text-[var(--sidebar-nav-active-icon)]"
                    : "text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]"
                )}
                strokeWidth={active ? 2.5 : 2}
              />
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--sidebar-nav-active-icon)]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Theme toggle + User */}
      <div className="flex-shrink-0 border-t border-[var(--sidebar-border)] p-4 space-y-2">
        <ThemeToggleCompact />
        <div className="flex items-center gap-3 rounded-xl bg-[var(--surface-overlay)] px-3 py-2.5">
          <ClerkLoaded>
            <UserButton afterSignOutUrl="/" />
          </ClerkLoaded>
          <ClerkLoading>
            <Loader2 className="h-5 w-5 animate-spin text-[var(--text-muted)]" />
          </ClerkLoading>
          <span className="text-xs font-medium text-[var(--text-muted)]">Account</span>
        </div>
      </div>
    </aside>
  );
}

// ── Mobile top bar ────────────────────────────────────────────────────────────
function MobileTopBar() {
  return (
    <div className={cn(
      "sticky top-0 z-30 flex h-14 flex-shrink-0 items-center justify-between",
      "border-b border-[var(--border-default)] px-4 lg:hidden",
      "bg-[var(--surface-card)]/95 backdrop-blur-md"
    )}>
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
          <TrendingUp className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold tracking-tight text-[var(--text-primary)]">SpendWise</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ClerkLoaded>
          <UserButton afterSignOutUrl="/" />
        </ClerkLoaded>
        <ClerkLoading>
          <Loader2 className="h-4 w-4 animate-spin text-[var(--text-muted)]" />
        </ClerkLoading>
      </div>
    </div>
  );
}

// ── Mobile bottom nav ─────────────────────────────────────────────────────────
function BottomNav() {
  const pathname = usePathname();
  const bottomItems = NAV_ITEMS.slice(0, 4);
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around",
        "ds-bottom-nav lg:hidden"
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)", paddingTop: "6px" }}
    >
      {bottomItems.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1"
          >
            <div
              className={cn(
                "rounded-xl p-1.5 transition-all duration-150",
                active ? "bg-[var(--sidebar-nav-active)]" : ""
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5",
                  active ? "text-[var(--sidebar-nav-active-icon)]" : "text-[var(--text-muted)]"
                )}
                strokeWidth={active ? 2.5 : 1.8}
              />
            </div>
            <span
              className={cn(
                "text-[10px] font-semibold",
                active ? "text-[var(--sidebar-nav-active-text)]" : "text-[var(--text-muted)]"
              )}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

// ── AppShell ──────────────────────────────────────────────────────────────────
export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[var(--surface-base)]">
      <Sidebar />
      <div className="flex min-h-screen flex-col lg:pl-60">
        <MobileTopBar />
        <main className="flex-1 pb-32 lg:pb-8">
          {children}
        </main>
      </div>
      <div className="lg:hidden">
        <FAB />
        <BottomNav />
      </div>
    </div>
  );
}