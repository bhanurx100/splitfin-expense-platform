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

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col lg:flex"
      style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
    >
      {/* Logo */}
      <div
        className="flex h-16 flex-shrink-0 items-center gap-3 px-5"
        style={{ borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 shadow-sm">
          <TrendingUp className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          SpendWise
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p
          className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest"
          style={{ color: "var(--text-muted)" }}
        >
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
              )}
              style={{
                background: active ? "var(--sidebar-nav-active)" : "transparent",
                color: active ? "var(--sidebar-nav-active-text)" : "var(--text-tertiary)",
                fontWeight: active ? "600" : "500",
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "var(--sidebar-nav-hover)";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-primary)";
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  (e.currentTarget as HTMLElement).style.background = "transparent";
                  (e.currentTarget as HTMLElement).style.color = "var(--text-tertiary)";
                }
              }}
            >
              <Icon
                className="h-[18px] w-[18px] flex-shrink-0 transition-colors"
                style={{ color: active ? "var(--sidebar-nav-active-icon)" : "var(--text-muted)" }}
                strokeWidth={active ? 2.5 : 2}
              />
              {label}
              {active && (
                <span
                  className="ml-auto h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--sidebar-nav-active-icon)" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom: Theme + User */}
      <div
        className="flex-shrink-0 space-y-2 p-4"
        style={{ borderTop: "1px solid var(--sidebar-border)" }}
      >
        <ThemeToggleCompact />
        <div
          className="flex items-center gap-3 rounded-xl px-3 py-2.5"
          style={{ background: "var(--surface-sunken)" }}
        >
          <ClerkLoaded>
            <UserButton afterSignOutUrl="/" />
          </ClerkLoaded>
          <ClerkLoading>
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: "var(--text-muted)" }} />
          </ClerkLoading>
          <span className="text-xs font-medium" style={{ color: "var(--text-muted)" }}>
            Account
          </span>
        </div>
      </div>
    </aside>
  );
}

// ── Mobile top bar ────────────────────────────────────────────────────────────
function MobileTopBar() {
  return (
    <div
      className="sticky top-0 z-30 flex h-14 flex-shrink-0 items-center justify-between px-4 lg:hidden"
      style={{
        background: "var(--surface-card)",
        borderBottom: "1px solid var(--border-default)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 shadow-sm">
          <TrendingUp className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold tracking-tight" style={{ color: "var(--text-primary)" }}>
          SpendWise
        </span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ClerkLoaded>
          <UserButton afterSignOutUrl="/" />
        </ClerkLoaded>
        <ClerkLoading>
          <Loader2 className="h-4 w-4 animate-spin" style={{ color: "var(--text-muted)" }} />
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
      className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around lg:hidden"
      style={{
        background: "var(--surface-card)",
        borderTop: "1px solid var(--border-subtle)",
        paddingBottom: "env(safe-area-inset-bottom, 8px)",
        paddingTop: "6px",
      }}
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
              className="rounded-xl p-1.5 transition-all duration-150"
              style={{
                background: active ? "var(--sidebar-nav-active)" : "transparent",
              }}
            >
              <Icon
                className="h-5 w-5"
                style={{
                  color: active ? "var(--sidebar-nav-active-icon)" : "var(--text-muted)",
                }}
                strokeWidth={active ? 2.5 : 1.8}
              />
            </div>
            <span
              className="text-[10px] font-semibold"
              style={{
                color: active ? "var(--sidebar-nav-active-text)" : "var(--text-muted)",
              }}
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
    <div className="min-h-screen" style={{ background: "var(--surface-bg)" }}>
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