"use client";

// components/app/AppShell.tsx
// The single outer wrapper for every dashboard page.
// - Mobile + desktop: content centred at max-w-md (app-like, not full-width)
// - Mobile: BottomNav + FAB at bottom
// - Desktop: sticky top DesktopNav, no BottomNav/FAB

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { Home, ArrowLeftRight, LayoutGrid, SplitSquareHorizontal, Loader2 } from "lucide-react";
import { FAB } from "./FAB";

// ── Nav config ────────────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { href: "/",           label: "Home",         icon: Home,                    exact: true  },
  { href: "/transactions",label: "Transactions",icon: ArrowLeftRight,          exact: false },
  { href: "/categories", label: "Categories",   icon: LayoutGrid,              exact: false },
  { href: "/split-pay",  label: "Split",        icon: SplitSquareHorizontal,   exact: false },
] as const;

// ── Desktop sticky nav ────────────────────────────────────────────────────────
function DesktopNav() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-50 hidden border-b border-blue-800/30 bg-gradient-to-r from-blue-700 to-blue-600 backdrop-blur-md lg:block">
      <div className="mx-auto flex max-w-screen-lg items-center justify-between px-8 py-3">
        <Link href="/" className="flex items-center gap-2 transition-opacity hover:opacity-80">
          <Image src="/logo.svg" alt="SpendWise" width={22} height={22} />
          <span className="text-sm font-bold text-white tracking-tight">SpendWise</span>
        </Link>
        <div className="flex items-center gap-1">
          {NAV_ITEMS.map(({ href, label, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link key={href} href={href}
                className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 ${
                  active ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                }`}>
                {label}
              </Link>
            );
          })}
        </div>
        <ClerkLoaded><UserButton afterSignOutUrl="/" /></ClerkLoaded>
        <ClerkLoading><Loader2 className="h-5 w-5 animate-spin text-white/50" /></ClerkLoading>
      </div>
    </nav>
  );
}

// ── Mobile bottom nav ─────────────────────────────────────────────────────────
function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-gray-100 bg-white/96 pb-safe pt-2 backdrop-blur-xl">
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link key={href} href={href}
            className={`flex flex-col items-center gap-0.5 px-4 py-1.5 transition-all duration-150 ${
              active ? "text-blue-600" : "text-gray-400"
            }`}>
            <div className={`rounded-xl p-1.5 transition-all duration-150 ${active ? "bg-blue-50" : ""}`}>
              <Icon className="h-[22px] w-[22px]" strokeWidth={active ? 2.5 : 1.8} />
            </div>
            <span className={`text-[10px] font-semibold ${active ? "text-blue-600" : "text-gray-400"}`}>
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
    <div className="min-h-screen bg-gray-50/80">
      {/* Desktop sticky nav */}
      <DesktopNav />

      {/* Centred content column — app-like on all screens */}
      <div className="mx-auto w-full max-w-md pb-28 lg:max-w-2xl lg:pb-12">
        {children}
      </div>

      {/* Mobile-only chrome */}
      <div className="lg:hidden">
        <FAB />
        <BottomNav />
      </div>
    </div>
  );
}