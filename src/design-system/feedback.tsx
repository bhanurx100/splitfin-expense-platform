import type { ReactNode } from "react";
import { cn } from "@/src/lib/utils";

export function AuroraSkeleton({ className }: { className?: string }) { return <div aria-hidden className={cn("animate-pulse rounded-xl bg-[var(--aurora-glass-strong)]", className)} />; }

export function EmptyState({ icon, title, description, action, className }: { icon?: ReactNode; title: string; description?: string; action?: ReactNode; className?: string }) {
  return <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>{icon && <div className="mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[var(--aurora-gradient-soft)] text-[var(--aurora-cyan)]">{icon}</div>}<h2 className="font-semibold text-[var(--text-primary)]">{title}</h2>{description && <p className="mt-1 max-w-sm text-sm text-[var(--text-secondary)]">{description}</p>}{action && <div className="mt-5">{action}</div>}</div>;
}
