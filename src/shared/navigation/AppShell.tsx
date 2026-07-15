"use client";

import { ClerkLoaded, ClerkLoading, UserButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Building2, PieChart, Home, Landmark, Loader2, ReceiptText, UsersRound, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode, useState } from "react";
import { cn } from "@/src/lib/utils";
import { ThemeToggleCompact } from "@/src/shared/components/theme-toggle";

type NavItem = { href: string; label: string; icon: LucideIcon; exact?: boolean };
const items: NavItem[] = [
  { href: "/", label: "Overview", icon: Home, exact: true },
  { href: "/transactions", label: "Transactions", icon: ReceiptText },
  { href: "/split", label: "SplitPay", icon: UsersRound },
  { href: "/categories", label: "Categories", icon: PieChart },
  { href: "/accounts", label: "Accounts", icon: Landmark },
];

const active = (item: NavItem, pathname: string) => item.exact ? pathname === item.href : pathname.startsWith(item.href);

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  return <div className="min-h-dvh bg-[var(--surface-bg)] text-[var(--text-primary)]">
    <aside className={cn("fixed inset-y-0 left-0 z-[var(--aurora-z-navigation)] hidden border-r border-[var(--aurora-glass-border)] bg-[var(--surface-sidebar)]/80 backdrop-blur-2xl transition-[width] duration-300 lg:flex lg:flex-col", collapsed ? "w-20" : "w-60")}>
      <Link href="/" className="flex h-[76px] items-center gap-3 border-b border-[var(--aurora-glass-border)] px-5"><span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--aurora-gradient)] text-white shadow-[var(--aurora-glow-violet)]"><Building2 size={19} /></span>{!collapsed && <span className="text-lg font-bold tracking-tight">SplitFin</span>}</Link>
      <nav aria-label="Main navigation" className="flex-1 space-y-1 p-3">{items.map((item) => { const Icon = item.icon; const selected = active(item, pathname); return <Link key={item.href} href={item.href} aria-current={selected ? "page" : undefined} title={collapsed ? item.label : undefined} className={cn("relative flex h-11 items-center rounded-xl px-3 text-sm font-medium transition", collapsed ? "justify-center" : "gap-3", selected ? "bg-[var(--aurora-gradient-soft)] text-[var(--aurora-cyan)]" : "text-[var(--text-secondary)] hover:bg-white/5 hover:text-[var(--text-primary)]")}><Icon size={19} strokeWidth={selected ? 2.25 : 1.8} />{!collapsed && item.label}{selected && <motion.span layoutId="desktop-nav" className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-[var(--aurora-cyan)] shadow-[var(--aurora-glow-cyan)]" />}</Link>; })}</nav>
      <div className="space-y-2 border-t border-[var(--aurora-glass-border)] p-3"><button type="button" onClick={() => setCollapsed((state) => !state)} className="w-full rounded-lg py-2 text-xs text-[var(--text-secondary)] hover:bg-white/5">{collapsed ? "Expand" : "Collapse"}</button>{!collapsed && <ThemeToggleCompact />}<div className={cn("flex items-center rounded-xl bg-white/5 p-2", collapsed ? "justify-center" : "gap-2")}><ClerkLoaded><UserButton afterSignOutUrl="/" /></ClerkLoaded><ClerkLoading><Loader2 className="animate-spin" size={18} /></ClerkLoading>{!collapsed && <span className="text-xs text-[var(--text-secondary)]">Your account</span>}</div></div>
    </aside>
    <div className={cn("min-h-dvh transition-[padding-left] duration-300", collapsed ? "lg:pl-20" : "lg:pl-60")}><header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--aurora-glass-border)] bg-[var(--surface-bg)]/75 px-4 backdrop-blur-xl lg:hidden"><Link href="/" className="font-bold tracking-tight">SplitFin</Link><ThemeToggleCompact /></header><main>{children}</main></div>
    <nav aria-label="Main navigation" className="fixed inset-x-0 bottom-0 z-[var(--aurora-z-navigation)] border-t border-[var(--aurora-glass-border)] bg-[var(--surface-raised)]/85 px-1 backdrop-blur-2xl lg:hidden"><div className="mx-auto flex max-w-[30rem]">{items.map((item) => { const Icon = item.icon; const selected = active(item, pathname); return <Link key={item.href} href={item.href} aria-current={selected ? "page" : undefined} className={cn("relative flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium", selected ? "text-[var(--aurora-cyan)]" : "text-[var(--text-muted)]")}><Icon size={20} strokeWidth={selected ? 2.25 : 1.8} />{item.label}{selected && <span className="absolute bottom-1 h-0.5 w-7 rounded-full bg-[var(--aurora-cyan)] shadow-[var(--aurora-glow-cyan)]" />}</Link>; })}</div></nav>
  </div>;
}
