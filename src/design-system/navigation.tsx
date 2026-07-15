"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/src/lib/utils";

export type AuroraNavItem = { href: string; label: string; icon: LucideIcon };

export function AuroraBottomNavigation({ items, className }: { items: AuroraNavItem[]; className?: string }) {
  const pathname = usePathname();
  return <nav aria-label="Primary" className={cn("fixed inset-x-0 bottom-0 z-[var(--aurora-z-navigation)] border-t border-[var(--aurora-glass-border)] bg-[var(--surface-raised)]/80 px-2 backdrop-blur-2xl aurora-safe-bottom", className)}><div className="mx-auto flex max-w-[var(--aurora-shell-width)] items-center justify-around">{items.map(({ href, label, icon: Icon }) => { const active = pathname === href; return <Link href={href} key={href} className={cn("relative flex min-h-14 flex-1 flex-col items-center justify-center gap-1 text-[10px] font-medium transition-colors", active ? "text-[var(--aurora-cyan)]" : "text-[var(--text-muted)]")}><Icon size={20} strokeWidth={1.8} />{label}{active && <span className="absolute bottom-1 h-0.5 w-7 rounded-full bg-[var(--aurora-cyan)] shadow-[var(--aurora-glow-cyan)]" />}</Link>; })}</div></nav>;
}
