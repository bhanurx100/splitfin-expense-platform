"use client";

import { memo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import {
  Home,
  ArrowLeftRight,
  SplitSquareHorizontal,
  LayoutGrid,
  Wallet,
  TrendingUp,
  Loader2,
  LucideIcon,
} from "lucide-react";
import {
  ThemeToggle,
  ThemeToggleCompact,
} from "@/shared/components/theme-toggle";
import { cn } from "@/lib/utils";

// ── Shared nav config ─────────────────────────────────────────────────────────
type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
  exact: boolean;
  raised?: boolean;
};

const NAV: NavItem[] = [
  { href: "/", label: "Overview", Icon: Home, exact: true },
  {
    href: "/transactions",
    label: "Transactions",
    Icon: ArrowLeftRight,
    exact: false,
  },
  {
    href: "/split",
    label: "SplitPay",
    Icon: SplitSquareHorizontal,
    exact: false,
    raised: true,
  },
  { href: "/categories", label: "Categories", Icon: LayoutGrid, exact: false },
  { href: "/accounts", label: "Accounts", Icon: Wallet, exact: false },
] as const;

function isActive(href: string, exact: boolean, pathname: string) {
  return exact ? pathname === href : pathname.startsWith(href);
}

// ── Desktop sidebar ───────────────────────────────────────────────────────────

const DesktopSidebar = memo(function DesktopSidebar() {
  const pathname = usePathname();
  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col lg:flex"
      style={{
        background: "var(--sf-card,var(--surface-card))",
        borderRight: "1px solid var(--sf-border-subtle,var(--border-subtle))",
      }}
    >
      {/* Logo */}
      <div
        className="flex h-16 flex-shrink-0 items-center gap-3 px-5"
        style={{
          borderBottom:
            "1px solid var(--sf-border-subtle,var(--border-subtle))",
        }}
      >
        <div
          className="flex h-8 w-8 items-center justify-center rounded-xl"
          style={{ background: "linear-gradient(135deg,#6C5CE7,#A29BFE)" }}
        >
          <TrendingUp className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <span
          className="text-[16px] font-bold tracking-tight"
          style={{ color: "var(--sf-text-primary,var(--text-primary))" }}
        >
          Split<span style={{ color: "#6C5CE7" }}>Fin</span>
        </span>
      </div>

      {/* Links */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        {NAV.map(({ href, label, Icon, exact }) => {
          const active = isActive(href, exact, pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] transition-all duration-150",
                active
                  ? "bg-[rgba(108,92,231,0.10)] font-semibold text-[#6C5CE7]"
                  : "font-medium hover:bg-[rgba(108,92,231,0.06)]"
              )}
              style={{
                color: active
                  ? "#6C5CE7"
                  : "var(--sf-text-muted,var(--text-muted))",
              }}
            >
              <Icon
                className="h-[18px] w-[18px] flex-shrink-0"
                strokeWidth={active ? 2.5 : 2}
              />
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#6C5CE7]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User / theme */}
      <div
        className="flex-shrink-0 space-y-2 p-4"
        style={{
          borderTop: "1px solid var(--sf-border-subtle,var(--border-subtle))",
        }}
      >
        <ThemeToggleCompact />
        <div
          className="flex items-center gap-3 rounded-xl px-3 py-2.5"
          style={{ background: "var(--sf-sunken,var(--surface-sunken))" }}
        >
          <ClerkLoaded>
            <UserButton afterSignOutUrl="/" />
          </ClerkLoaded>
          <ClerkLoading>
            <Loader2 className="h-5 w-5 animate-spin opacity-40" />
          </ClerkLoading>
          <span className="text-xs font-medium opacity-50">Account</span>
        </div>
      </div>
    </aside>
  );
});

// ── Mobile header ─────────────────────────────────────────────────────────────

function MobileHeader() {
  return (
    <header
      className="sticky top-0 z-50 flex h-[60px] flex-shrink-0 items-center justify-between px-4 lg:hidden"
      style={{
        background: "var(--sf-card,var(--surface-card))",
        borderBottom: "1px solid var(--sf-border-subtle,var(--border-subtle))",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <Link href="/" className="flex items-center">
        <span
          className="text-[15px] font-bold tracking-tight"
          style={{ color: "var(--sf-text-primary,var(--text-primary))" }}
        >
          Split<span style={{ color: "#6C5CE7" }}>Fin</span>
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <ClerkLoaded>
          <UserButton afterSignOutUrl="/" />
        </ClerkLoaded>
        <ClerkLoading>
          <Loader2 className="h-4 w-4 animate-spin opacity-40" />
        </ClerkLoading>
      </div>
    </header>
  );
}

// ── Mobile dock ───────────────────────────────────────────────────────────────

const MobileDock = memo(function MobileDock() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 flex items-end justify-around lg:hidden"
      style={{
        background: "var(--sf-card,var(--surface-card))",
        borderTop: "1px solid var(--sf-border-subtle,var(--border-subtle))",
        paddingBottom: "env(safe-area-inset-bottom,8px)",
        paddingTop: "6px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      {NAV.map(({ href, label, Icon, exact, raised }) => {
        const active = isActive(href, exact, pathname);

        if (raised) {
          return (
            <Link
              key={href}
              href={href}
              className="-mt-3 flex flex-col items-center gap-0.5 pb-1"
            >
              <div
                className="flex h-[41px] w-[41px] items-center justify-center rounded-full transition-transform active:scale-90"
                style={{
                  background: "linear-gradient(135deg,#6C5CE7,#A29BFE)",
                  boxShadow: "0 3px 14px rgba(108,92,231,0.30)",
                }}
              >
                <Icon className="h-[18px] w-[18px] text-white" strokeWidth={2.5} />
              </div>
              <span
                className="text-[10px] font-semibold"
                style={{
                  color: active
                    ? "#6C5CE7"
                    : "var(--sf-text-muted,var(--text-muted))",
                }}
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
            className="flex min-w-[52px] flex-col items-center gap-0.5 px-3 py-1"
          >
            <div
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-150",
                active && "bg-[rgba(108,92,231,0.10)]"
              )}
            >
              <Icon
                className="h-5 w-5"
                style={{
                  color: active
                    ? "#6C5CE7"
                    : "var(--sf-text-muted,var(--text-muted))",
                }}
                strokeWidth={active ? 2.5 : 1.8}
              />
            </div>
            <span
              className="text-[10px] font-semibold"
              style={{
                color: active
                  ? "#6C5CE7"
                  : "var(--sf-text-muted,var(--text-muted))",
              }}
            >
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
});

// ── Shell ─────────────────────────────────────────────────────────────────────

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--sf-page,var(--surface-bg))" }}
    >
      <DesktopSidebar />
      <div className="flex min-h-screen flex-col lg:pl-60">
        <MobileHeader />
        <main className="flex-1">{children}</main>
      </div>
      <MobileDock />
    </div>
  );
}
