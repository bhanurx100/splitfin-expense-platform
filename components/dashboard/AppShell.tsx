"use client";

import Link from "next/link";
import Image from "next/image";
import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { Loader2 } from "lucide-react";

import { FloatingActionButton } from "./FloatingActionButton";
import { BottomNav } from "./BottomNav";

type AppShellProps = {
  children: React.ReactNode;
};

//
// ─── Desktop Nav (ONLY lg+) ─────────────────────────
//
function DesktopNav() {
  return (
    <nav className="sticky top-0 z-40 hidden border-b border-white/10 bg-blue-700/95 backdrop-blur-md lg:block">
      <div className="mx-auto flex max-w-screen-2xl items-center justify-between px-14 py-3">
        
        {/* Logo → Home */}
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <Image src="/logo.svg" alt="SpendWise" width={24} height={24} />
          <span className="text-base font-bold text-white">
            SpendWise
          </span>
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {[
            { href: "/", label: "Overview" },
            { href: "/transactions", label: "Transactions" },
            { href: "/categories", label: "Categories" },
            { href: "/accounts", label: "Accounts" },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="rounded-lg px-4 py-2 text-sm font-medium text-white/80 transition-all duration-200 hover:bg-white/10 hover:text-white"
            >
              {label}
            </Link>
          ))}
        </div>

        {/* User */}
        <ClerkLoaded>
          <UserButton afterSignOutUrl="/" />
        </ClerkLoaded>

        <ClerkLoading>
          <Loader2 className="h-6 w-6 animate-spin text-white/50" />
        </ClerkLoading>
      </div>
    </nav>
  );
}

//
// ─── AppShell ───────────────────────────────────────
//
export function AppShell({ children }: AppShellProps) {
  return (
    <div className="relative min-h-screen bg-gray-50">
      
      {/* Desktop Navbar */}
      <DesktopNav />

      {/* CONTENT */}
      <div className="pb-44 lg:pb-0">
        {children}
      </div>

      {/* Mobile FAB */}
      <div className="lg:hidden">
        <FloatingActionButton />
      </div>

      {/* Mobile Bottom Nav */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  );
}