import { type ComponentPropsWithoutRef, type ReactNode } from "react";
import { cn } from "@/src/lib/utils";

export function AuroraPage({ children, className, ...props }: ComponentPropsWithoutRef<"main">) {
  return <main className={cn("aurora-canvas min-h-dvh px-[var(--aurora-space-page)] py-5", className)} {...props}>{children}</main>;
}

export function MobileShell({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto min-h-dvh w-full max-w-[var(--aurora-shell-width)] overflow-x-clip", className)}>{children}</div>;
}

export function PageHeader({ eyebrow, title, description, action, className }: { eyebrow?: string; title: string; description?: string; action?: ReactNode; className?: string }) {
  return <header className={cn("flex items-start justify-between gap-4", className)}><div className="min-w-0">{eyebrow && <p className="mb-1 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--aurora-cyan)]">{eyebrow}</p>}<h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)] sm:text-3xl">{title}</h1>{description && <p className="mt-1 text-sm text-[var(--text-secondary)]">{description}</p>}</div>{action && <div className="shrink-0">{action}</div>}</header>;
}

export function Section({ children, className }: { children: ReactNode; className?: string }) {
  return <section className={cn("space-y-3", className)}>{children}</section>;
}

export function SectionHeader({ title, action, className }: { title: string; action?: ReactNode; className?: string }) {
  return <div className={cn("flex items-center justify-between gap-4", className)}><h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>{action}</div>;
}

export function ContentGrid({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("grid gap-4 lg:grid-cols-2", className)}>{children}</div>;
}
