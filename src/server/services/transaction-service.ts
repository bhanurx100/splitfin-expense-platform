/**
 * server/services/transaction-service.ts
 *
 * Orchestration layer between route handlers and the repository.
 * - Accepts already-verified userId from the route handler.
 * - Owns date-defaulting logic (kept out of both route and repository).
 * - Returns plain objects; routes are responsible for ctx.json().
 */

import { parse, subDays } from "date-fns";

import {
  listTransactions,
  getTransactionById,
  insertTransaction,
  insertManyTransactions,
  updateTransaction,
  deleteTransaction,
  deleteManyTransactions,
} from "@/src/server/repositories/transaction-repository";

import type { z } from "zod";
import type { insertTransactionSchema } from "@/src/db/schema";

type InsertPayload = z.infer<typeof insertTransactionSchema>;

// ── Date helpers ──────────────────────────────────────────────────────────────

const DATE_FMT = "yyyy-MM-dd";

function resolveDateRange(from?: string, to?: string) {
  const endDate   = to   ? parse(to,   DATE_FMT, new Date()) : new Date();
  const startDate = from ? parse(from, DATE_FMT, new Date()) : subDays(endDate, 30);
  return { startDate, endDate };
}

// ── Read ──────────────────────────────────────────────────────────────────────

export async function getTransactions(
  userId: string,
  filters: { from?: string; to?: string; accountId?: string }
) {
  const { startDate, endDate } = resolveDateRange(filters.from, filters.to);

  return listTransactions({
    userId,
    accountId: filters.accountId,
    startDate,
    endDate,
  });
}

export async function getTransaction(id: string, userId: string) {
  return getTransactionById(id, userId);
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function createTransaction(values: Omit<InsertPayload, "id">) {
  return insertTransaction(values);
}

export async function createManyTransactions(
  rows: Omit<InsertPayload, "id">[]
) {
  return insertManyTransactions(rows);
}

export async function editTransaction(
  id: string,
  userId: string,
  values: Omit<InsertPayload, "id">
) {
  return updateTransaction(id, userId, values);
}

export async function removeTransaction(id: string, userId: string) {
  return deleteTransaction(id, userId);
}

export async function removeManyTransactions(ids: string[], userId: string) {
  return deleteManyTransactions(ids, userId);
}