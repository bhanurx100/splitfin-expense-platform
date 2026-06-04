"use client";

import { memo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { Loader2, TrendingUp, ChevronLeft, ChevronRight } from "lucide-react";
import { Icon } from "@iconify/react";
import {
  ThemeToggle,
  ThemeToggleCompact,
} from "@/shared/components/theme-toggle";
import { cn } from "@/lib/utils";

// ── Shared nav config ─────────────────────────────────────────────────────────
type NavItem = {
  href: string;
  label: string;
  icon: string;
  exact: boolean;
};

const NAV: NavItem[] = [
  { href: "/", label: "Overview", icon: "line-md:home-twotone", exact: true },
  {
    href: "/transactions",
    label: "Transactions",
    icon: "bitcoin-icons:transactions-filled",
    exact: false,
  },
  {
    href: "/split",
    label: "SplitPay",
    icon: "glyphs-poly:users",
    exact: false,
  },
  {
    href: "/categories",
    label: "Categories",
    icon: "material-symbols:category",
    exact: false,
  },
  { href: "/accounts", label: "Accounts", icon: "lucide:wallet", exact: false },
] as const;

function isActive(href: string, exact: boolean, pathname: string) {
  return exact ? pathname === href : pathname.startsWith(href);
}

const ACTIVE_GRADIENT = "linear-gradient(135deg, #F472B6, #FBBF24)";
const INACTIVE_COLOR = "rgba(148,163,184,0.85)";

// ── Desktop sidebar ───────────────────────────────────────────────────────────

const DesktopSidebar = memo(function DesktopSidebar({
  collapsed,
  onToggle,
}: {
  collapsed: boolean;
  onToggle: () => void;
}) {
  const pathname = usePathname();
  const sidebarWidth = collapsed ? 80 : 220;

  return (
    <aside
      className="fixed inset-y-0 left-0 z-40 hidden flex-col transition-[width] duration-200 lg:flex"
      style={{
        width: `${sidebarWidth}px`,
        background: "var(--sf-card,var(--surface-card))",
        borderRight: "1px solid var(--sf-border-subtle,var(--border-subtle))",
      }}
    >
      {/* Header with logo */}
      <div
        className="flex h-[72px] flex-shrink-0 items-center px-5"
        style={{
          borderBottom:
            "1px solid var(--sf-border-subtle,var(--border-subtle))",
        }}
      >
        <div
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl"
          style={{ background: "linear-gradient(135deg,#F472B6,#FBBF24)" }}
        >
          <TrendingUp className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        {!collapsed && (
          <span
            className="ml-3 text-[18px] font-bold tracking-tight"
            style={{ color: "var(--sf-text-primary,var(--text-primary))" }}
          >
            Split<span style={{ color: "#F472B6" }}>Fin</span>
          </span>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        {NAV.map(({ href, label, icon, exact }) => {
          const active = isActive(href, exact, pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex h-[40px] items-center rounded-xl px-3 transition-all duration-150",
                collapsed ? "justify-center" : "gap-[12px]",
                active
                  ? "bg-[rgba(244,114,182,0.08)] font-semibold"
                  : "font-medium hover:bg-[rgba(148,163,184,0.06)]"
              )}
              style={{ marginBottom: "2px" }}
              title={collapsed ? label : undefined}
            >
              <Icon
                icon={icon}
                width={20}
                height={20}
                className="flex-shrink-0"
                style={{
                  color: active ? undefined : INACTIVE_COLOR,
                  ...(active
                    ? {
                        background: ACTIVE_GRADIENT,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }
                    : {}),
                }}
              />
              {!collapsed && (
                <span
                  className="text-[13px] font-medium whitespace-nowrap"
                  style={{
                    color: active
                      ? "#F472B6"
                      : "var(--sf-text-muted,var(--text-muted))",
                  }}
                >
                  {label}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer: collapse toggle + user */}
      <div
        className="flex-shrink-0 space-y-2 p-3"
        style={{
          borderTop: "1px solid var(--sf-border-subtle,var(--border-subtle))",
        }}
      >
        <button
          type="button"
          onClick={onToggle}
          className="flex h-[36px] w-full items-center justify-center rounded-lg transition-colors hover:bg-[rgba(148,163,184,0.08)]"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <ChevronRight
              className="h-4 w-4"
              style={{ color: INACTIVE_COLOR }}
            />
          ) : (
            <ChevronLeft
              className="h-4 w-4"
              style={{ color: INACTIVE_COLOR }}
            />
          )}
        </button>

        {!collapsed && <ThemeToggleCompact />}

        <div
          className={cn(
            "flex items-center rounded-xl px-3 py-2",
            collapsed ? "justify-center" : "gap-3"
          )}
          style={{ background: "var(--sf-sunken,var(--surface-sunken))" }}
        >
          <ClerkLoaded>
            <UserButton afterSignOutUrl="/" />
          </ClerkLoaded>
          <ClerkLoading>
            <Loader2 className="h-5 w-5 animate-spin opacity-40" />
          </ClerkLoading>
          {!collapsed && (
            <span className="text-xs font-medium opacity-50">Account</span>
          )}
        </div>
      </div>
    </aside>
  );
});

// ── Mobile header ─────────────────────────────────────────────────────────────

function MobileHeader() {
  return (
    <header
      className="sticky top-0 z-50 flex h-[64px] flex-shrink-0 items-center justify-between px-4 lg:hidden"
      style={{
        background: "var(--sf-card,var(--surface-card))",
        borderBottom: "1px solid var(--sf-border-subtle,var(--border-subtle))",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
      }}
    >
      <Link href="/" className="flex items-center gap-2">
        <div
          className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg"
          style={{ background: "linear-gradient(135deg,#F472B6,#FBBF24)" }}
        >
          <TrendingUp className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
        <span
          className="text-[18px] font-bold tracking-tight"
          style={{ color: "var(--sf-text-primary,var(--text-primary))" }}
        >
          Split<span style={{ color: "#F472B6" }}>Fin</span>
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

// ── Mobile bottom nav ─────────────────────────────────────────────────────────

const MobileDock = memo(function MobileDock() {
  const pathname = usePathname();
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden"
      style={{
        background: "var(--sf-card,var(--surface-card))",
        borderTop: "1px solid var(--sf-border-subtle,var(--border-subtle))",
        paddingBottom: "env(safe-area-inset-bottom,8px)",
        paddingTop: "8px",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(5, 1fr)",
        }}
      >
        {NAV.map(({ href, label, icon, exact }) => {
          const active = isActive(href, exact, pathname);
          return (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center py-1"
            >
              <Icon
                icon={icon}
                width={22}
                height={22}
                style={{
                  color: active ? undefined : INACTIVE_COLOR,
                  ...(active
                    ? {
                        background: ACTIVE_GRADIENT,
                        WebkitBackgroundClip: "text",
                        WebkitTextFillColor: "transparent",
                        backgroundClip: "text",
                      }
                    : {}),
                }}
              />
              <span
                className="mt-0.5 text-[11px] font-medium leading-tight"
                style={{
                  whiteSpace: "nowrap",
                  color: active ? "#F472B6" : INACTIVE_COLOR,
                }}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
});

// ── Shell ─────────────────────────────────────────────────────────────────────

export function AppShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--sf-page,var(--surface-bg))" }}
    >
      <DesktopSidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((c) => !c)}
      />
      <div
        className={cn(
          "flex min-h-screen flex-col transition-[padding-left] duration-200",
          collapsed ? "lg:pl-[80px]" : "lg:pl-[220px]"
        )}
      >
        <MobileHeader />
        <main className="flex-1">{children}</main>
      </div>
      <MobileDock />
    </div>
  );
}
