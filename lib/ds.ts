/**
 * lib/ds.ts
 *
 * SpendWise Design System — utility functions, class builders, and constants.
 * Import from here instead of writing raw Tailwind in every component.
 *
 * Usage:
 *   import { card, btn, badge, amount } from "@/lib/ds"
 *   <div className={card()}> ...
 */

import { cn } from "@/lib/utils";

// ── Card variants ─────────────────────────────────────────────────────────────

type CardVariant = "default" | "flat" | "hero" | "inset";

export function card(variant: CardVariant = "default", className?: string) {
  const base = "bg-white rounded-[18px] border transition-all duration-200";
  const variants: Record<CardVariant, string> = {
    default: "border-slate-100 shadow-sm hover:shadow-md hover:border-slate-200",
    flat:    "border-slate-100 shadow-none",
    hero:    "border-0 shadow-none bg-gradient-to-br from-blue-600 to-blue-700 text-white",
    inset:   "border-slate-100 bg-slate-50 shadow-none",
  };
  return cn(base, variants[variant], className);
}

export function cardPadding(size: "sm" | "md" | "lg" = "md") {
  return { sm: "p-4", md: "p-5 lg:p-6", lg: "p-6 lg:p-8" }[size];
}

// ── Button variants ───────────────────────────────────────────────────────────

type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "success";
type BtnSize    = "xs" | "sm" | "md" | "lg";

export function btn(variant: BtnVariant = "primary", size: BtnSize = "md", className?: string) {
  const base = [
    "inline-flex items-center justify-center gap-2 font-semibold border",
    "transition-all duration-150 cursor-pointer select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
    "disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none",
    "active:scale-[0.97]",
  ].join(" ");

  const variants: Record<BtnVariant, string> = {
    primary:   "bg-blue-600 text-white border-transparent hover:bg-blue-700 shadow-sm hover:shadow-[0_4px_14px_rgb(37,99,235,0.3)] active:bg-blue-800",
    secondary: "bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm",
    ghost:     "bg-transparent text-slate-600 border-transparent hover:bg-slate-100 hover:text-slate-900",
    danger:    "bg-red-50 text-red-600 border-red-200 hover:bg-red-100 hover:border-red-300",
    success:   "bg-emerald-600 text-white border-transparent hover:bg-emerald-700 shadow-sm",
  };

  const sizes: Record<BtnSize, string> = {
    xs: "h-7 px-2.5 text-xs rounded-lg",
    sm: "h-8 px-3 text-xs rounded-[10px]",
    md: "h-9 px-4 text-[13px] rounded-xl",
    lg: "h-11 px-6 text-[15px] rounded-xl",
  };

  return cn(base, variants[variant], sizes[size], className);
}

// ── Badge variants ────────────────────────────────────────────────────────────

type BadgeVariant = "blue" | "green" | "red" | "amber" | "purple" | "slate" | "cyan";

export function badge(variant: BadgeVariant = "slate", className?: string) {
  const base = "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold";
  const variants: Record<BadgeVariant, string> = {
    blue:   "bg-blue-50 text-blue-700",
    green:  "bg-emerald-50 text-emerald-700",
    red:    "bg-red-50 text-red-600",
    amber:  "bg-amber-50 text-amber-700",
    purple: "bg-purple-50 text-purple-700",
    slate:  "bg-slate-100 text-slate-600",
    cyan:   "bg-cyan-50 text-cyan-700",
  };
  return cn(base, variants[variant], className);
}

// ── Amount display ────────────────────────────────────────────────────────────

export function amountClass(value: number, className?: string) {
  return cn(
    "font-mono tabular-nums font-semibold text-sm",
    value >= 0 ? "text-emerald-600" : "text-red-500",
    className
  );
}

// ── Empty state props helper ──────────────────────────────────────────────────

export const emptyState = {
  wrapper:  "flex flex-col items-center justify-center py-16 text-center",
  iconBox:  "mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-300",
  title:    "mb-1 text-sm font-semibold text-slate-600",
  desc:     "text-xs text-slate-400 max-w-[220px] leading-relaxed",
};

// ── Skeleton rows helper ──────────────────────────────────────────────────────

export const skeleton = {
  base:   "animate-[shimmer_1.4s_ease-in-out_infinite] bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 bg-[length:200%_100%] rounded-xl",
  line:   "h-4 rounded-xl",
  circle: "rounded-full",
};

// ── Section heading ───────────────────────────────────────────────────────────

export const section = {
  header:  "mb-5 flex items-center justify-between",
  title:   "text-[15px] font-semibold text-slate-800 tracking-tight",
  action:  "text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors",
};

// ── Input classes ─────────────────────────────────────────────────────────────

export const input = {
  base:  [
    "w-full h-10 px-3.5 text-[13px] text-slate-900 bg-white",
    "border-[1.5px] border-slate-200 rounded-xl outline-none",
    "placeholder:text-slate-400",
    "hover:border-slate-300",
    "focus:border-blue-500 focus:shadow-[0_0_0_3px_rgb(59,130,246,0.12)]",
    "disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed",
    "transition-all duration-150",
  ].join(" "),
  label: "block mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-slate-400",
};

// ── Table classes ─────────────────────────────────────────────────────────────

export const table = {
  wrapper: "w-full overflow-x-auto",
  base:    "w-full text-[13px]",
  th:      "px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 bg-slate-50/80 border-b border-slate-100 first:rounded-tl-xl last:rounded-tr-xl",
  td:      "px-4 py-3.5 text-slate-600 border-b border-slate-50",
  tr:      "transition-colors hover:bg-slate-50/60 last:border-b-0",
};

// ── Color palette for charts and categories ───────────────────────────────────

export const CHART_COLORS = {
  primary:   "#3b82f6",
  secondary: "#6366f1",
  income:    "#10b981",
  expense:   "#ef4444",
  warning:   "#f59e0b",
  purple:    "#8b5cf6",
  pink:      "#ec4899",
  cyan:      "#06b6d4",
  lime:      "#84cc16",
  orange:    "#f97316",
} as const;

export const CATEGORY_PALETTE = [
  "#3b82f6",  // blue
  "#ef4444",  // red
  "#10b981",  // emerald
  "#f59e0b",  // amber
  "#8b5cf6",  // violet
  "#06b6d4",  // cyan
  "#f97316",  // orange
  "#ec4899",  // pink
  "#84cc16",  // lime
  "#6366f1",  // indigo
] as const;

// ── Account card gradients ────────────────────────────────────────────────────

export const ACCOUNT_GRADIENTS = [
  "from-blue-600 via-blue-500 to-blue-400",
  "from-violet-600 via-violet-500 to-violet-400",
  "from-emerald-600 via-emerald-500 to-emerald-400",
  "from-rose-600 via-rose-500 to-rose-400",
  "from-amber-600 via-amber-500 to-amber-400",
  "from-cyan-600 via-cyan-500 to-cyan-400",
  "from-indigo-600 via-indigo-500 to-indigo-400",
] as const;

// ── Spacing constants ─────────────────────────────────────────────────────────

export const SPACING = {
  pageX:   "px-4 sm:px-6 lg:px-8 xl:px-10",
  pageY:   "py-6 lg:py-8",
  section: "mb-6 lg:mb-8",
  card:    "p-5 lg:p-6",
} as const;

// ── Animation delay helper ────────────────────────────────────────────────────

export function staggerDelay(index: number, base = 0.06): React.CSSProperties {
  return { animationDelay: `${index * base}s` };
}