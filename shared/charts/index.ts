/**
 * shared/charts/index.ts
 *
 * Barrel for all shared chart components.
 * Import from "@/shared/charts" for any generic chart primitive.
 *
 * ChartContainer, AreaTrendChart, CategoryRingChart already exist in this folder.
 * This file makes them importable as a single entry point.
 *
 * Feature-level chart cards (CashFlowChart, CategoryPieCard, TopSpendingCard)
 * live in features/dashboard/sections/dashboard-charts.tsx — import them
 * directly from there, not from this barrel.
 */

// ── Layout wrapper ─────────────────────────────────────────────────────────────
export { ChartContainer } from "./ChartContainer";

// ── Chart primitives ───────────────────────────────────────────────────────────
export { AreaTrendChart }    from "./AreaTrendChart";
export { CategoryRingChart } from "./CategoryRingChart";