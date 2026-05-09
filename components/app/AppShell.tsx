"use client";
// components/app/AppShell.tsx
// Premium SaaS layout:
//   Desktop (lg+): fixed left sidebar (240px) + full-width content area
//   Mobile (<lg):  full-width content + bottom nav + FAB
import Link from "next/link";
//import Image from "next/image";
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
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-60 flex-col border-r border-slate-200/80 bg-white lg:flex">
      {/* Logo */}
      <div className="flex h-16 items-center gap-3 border-b border-slate-100 px-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600">
          <TrendingUp className="h-4 w-4 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-[15px] font-bold tracking-tight text-slate-800">
          SpendWise
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
        <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
          Menu
        </p>
        {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150 ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              }`}
            >
              <Icon
                className={`h-[18px] w-[18px] flex-shrink-0 transition-colors ${
                  active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
                }`}
                strokeWidth={active ? 2.5 : 2}
              />
              {label}
              {active && (
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="border-t border-slate-100 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-3 py-2.5">
          <ClerkLoaded>
            <UserButton afterSignOutUrl="/" />
          </ClerkLoaded>
          <ClerkLoading>
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          </ClerkLoading>
          <span className="text-xs font-medium text-slate-500">Account</span>
        </div>
      </div>
    </aside>
  );
}

// ── Mobile top bar (minimal, no redundant nav) ────────────────────────────────
function MobileTopBar() {
  return (
    <div className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-slate-100 bg-white/95 px-4 backdrop-blur-md lg:hidden">
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600">
          <TrendingUp className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
        </div>
        <span className="text-sm font-bold tracking-tight text-slate-800">SpendWise</span>
      </div>
      <ClerkLoaded>
        <UserButton afterSignOutUrl="/" />
      </ClerkLoaded>
      <ClerkLoading>
        <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
      </ClerkLoading>
    </div>
  );
}

// ── Mobile bottom nav ─────────────────────────────────────────────────────────
function BottomNav() {
  const pathname = usePathname();
  // Only show 4 primary items in bottom nav (split pay omitted — less common)
  const bottomItems = NAV_ITEMS.slice(0, 4);
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-slate-100 bg-white/97 pb-safe pt-1.5 backdrop-blur-xl lg:hidden">
      {bottomItems.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-0.5 px-3 py-1"
          >
            <div
              className={`rounded-xl p-1.5 transition-all duration-150 ${
                active ? "bg-blue-50" : ""
              }`}
            >
              <Icon
                className={`h-5 w-5 ${active ? "text-blue-600" : "text-slate-400"}`}
                strokeWidth={active ? 2.5 : 1.8}
              />
            </div>
            <span
              className={`text-[10px] font-semibold ${
                active ? "text-blue-600" : "text-slate-400"
              }`}
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
    <div className="min-h-screen bg-slate-50">
      {/* Desktop sidebar */}
      <Sidebar />

      {/* Main content — offset by sidebar width on desktop */}
      <div className="lg:pl-60">
        {/* Mobile top bar */}
        <MobileTopBar />

        {/* Page content */}
        <main className="min-h-screen pb-24 lg:pb-8">
          {children}
        </main>
      </div>

      {/* Mobile-only chrome */}
      <div className="lg:hidden">
        <FAB />
        <BottomNav />
      </div>
    </div>
  );
}