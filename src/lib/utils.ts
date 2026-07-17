/**
 * lib/utils.ts
 *
 * App-wide utility helpers shared by UI and the kept API layer.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge }               from "tailwind-merge";
import { eachDayOfInterval, isSameDay } from "date-fns";

// ── Class name helper ──────────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ── Milliunit conversion ───────────────────────────────────────────────────────

export function convertAmountFromMilliunits(amount: number) {
  return Math.round(amount / 1000);
}

export function convertAmountToMilliunits(amount: number) {
  return Math.round(amount * 1000);
}

// ── Financial math ─────────────────────────────────────────────────────────────

export function calculatePercentageChange(current: number, previous: number) {
  if (previous === 0) return previous === current ? 0 : 100;
  return ((current - previous) / previous) * 100;
}

// ── Date gap-filling (used by summary API route) ───────────────────────────────

export function fillMissingDays(
  activeDays: { date: Date; income: number; expenses: number }[],
  startDate:  Date,
  endDate:    Date,
) {
  if (activeDays.length === 0) return [];

  return eachDayOfInterval({ start: startDate, end: endDate }).map((day) => {
    const found = activeDays.find((d) => isSameDay(d.date, day));
    return found ?? { date: day, income: 0, expenses: 0 };
  });
}
