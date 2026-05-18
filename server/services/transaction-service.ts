/**
 * server/services/transaction-service.ts
 *
 * BUSINESS LOGIC LAYER — owns orchestration and domain rules for transactions.
 *
 * Rules for this file:
 *  ✅ Calls transactionRepository
 *  ✅ Unit conversion (milliunits ↔ decimals)
 *  ✅ Date defaulting / param normalization
 *  ✅ ID generation
 *  ✅ User-scoping enforcement
 *  ✅ Future: duplicate detection, auto-categorization, analytics
 *  ❌ NO direct drizzle/SQL
 *  ❌ NO Hono/HTTP concerns (status codes, ctx.json)
 *  ❌ NO frontend/React imports
 *  ❌ NO toast / UI side effects
 *
 * CURRENT STATE:
 *   Thin wrappers around the repository — enough to establish the layer.
 *   Business logic will grow here as features are added.
 *
 * FUTURE EXTENSION POINTS (marked with TODO):
 *   - Duplicate detection before insert
 *   - Auto-categorization via AI/rules
 *   - OCR import pipeline entry point
 *   - Analytics aggregation (replaces inline SQL in summary route)
 *   - Budget impact calculation
 */

import { createId } from "@paralleldrive/cuid2";
import { parse, subDays } from "date-fns";
import { convertAmountFromMilliunits } from "@/lib/utils";
import {
  transactionRepository,
  type TransactionRow,
  type TransactionDetailRow,
} from "@/server/repositories/transaction-repository";

// ─── Input types for the service layer ────────────────────────────────────────
// These are what Hono route handlers will eventually pass — higher-level than
// the raw repository params.

export type GetTransactionsInput = {
  userId: string;
  /** ISO date string "yyyy-MM-dd" — defaults to 30 days ago */
  from?: string;
  /** ISO date string "yyyy-MM-dd" — defaults to today */
  to?: string;
  accountId?: string;
};

export type CreateTransactionInput = {
  userId: string; // used for future validation / multi-tenancy checks
  accountId: string;
  categoryId?: string | null;
  payee: string;
  /** Amount in milliunits (matches DB schema). */
  amount: number;
  date: Date;
  notes?: string | null;
};

export type UpdateTransactionInput = {
  userId: string;
  id: string;
  patch: Partial<Omit<CreateTransactionInput, "userId">>;
};

export type DeleteTransactionInput = {
  userId: string;
  id: string;
};

export type BulkDeleteTransactionsInput = {
  userId: string;
  ids: string[];
};

export type BulkCreateTransactionsInput = {
  rows: Omit<CreateTransactionInput, "userId">[];
};

// ─── Output types ──────────────────────────────────────────────────────────────
// Service converts milliunits → decimals before returning.
// Routes only deal with human-readable amounts.

export type TransactionDTO = Omit<TransactionRow, "amount"> & {
  amount: number; // plain decimals
};

export type TransactionDetailDTO = Omit<TransactionDetailRow, "amount"> & {
  amount: number; // plain decimals
};

// ─── Date param helpers ────────────────────────────────────────────────────────

function parseOrDefault(
  raw: string | undefined,
  fallback: Date,
  fmt = "yyyy-MM-dd"
): Date {
  if (!raw) return fallback;
  return parse(raw, fmt, new Date());
}

function defaultDateRange(): { startDate: Date; endDate: Date } {
  const endDate   = new Date();
  const startDate = subDays(endDate, 30);
  return { startDate, endDate };
}

// ─── Service ───────────────────────────────────────────────────────────────────

export const transactionService = {

  /**
   * Get transactions for a user.
   * Normalizes date params, converts amounts from milliunits.
   *
   * FUTURE TODO: add cursor-based pagination here.
   * FUTURE TODO: cache result in Redis for dashboard summary reuse.
   */
  async getTransactionsForUser(
    input: GetTransactionsInput
  ): Promise<TransactionDTO[]> {
    const { startDate, endDate } = defaultDateRange();

    const rows = await transactionRepository.getTransactions({
      userId:    input.userId,
      accountId: input.accountId,
      startDate: parseOrDefault(input.from, startDate),
      endDate:   parseOrDefault(input.to,   endDate),
    });

    // Unit conversion: milliunits → plain decimals
    return rows.map((row) => ({
      ...row,
      amount: convertAmountFromMilliunits(row.amount),
    }));
  },

  /**
   * Get a single transaction for a user.
   * Returns null if not found or not owned by user.
   */
  async getTransactionForUser(
    id: string,
    userId: string
  ): Promise<TransactionDetailDTO | null> {
    const row = await transactionRepository.getTransactionById(id, userId);
    if (!row) return null;

    return {
      ...row,
      amount: convertAmountFromMilliunits(row.amount),
    };
  },

  /**
   * Create a transaction for a user.
   * Generates the ID here so callers don't need to.
   *
   * FUTURE TODO: duplicate detection (same payee+amount+date within 24h).
   * FUTURE TODO: auto-categorization hook.
   */
  async createTransactionForUser(
    input: CreateTransactionInput
  ): Promise<TransactionDetailDTO> {
    const row = await transactionRepository.createTransaction({
      id:         createId(),
      accountId:  input.accountId,
      categoryId: input.categoryId ?? null,
      payee:      input.payee,
      amount:     input.amount, // caller passes milliunits (matches existing route behavior)
      date:       input.date,
      notes:      input.notes ?? null,
    });

    return {
      ...row,
      amount: convertAmountFromMilliunits(row.amount),
    };
  },

  /**
   * Bulk-create transactions (CSV import).
   *
   * FUTURE TODO: run duplicate detection across the batch.
   * FUTURE TODO: emit import analytics event.
   */
  async bulkCreateTransactions(
    input: BulkCreateTransactionsInput
  ): Promise<TransactionDetailDTO[]> {
    const rows = await transactionRepository.bulkCreateTransactions({
      rows: input.rows.map((r) => ({
        id:         createId(),
        accountId:  r.accountId,
        categoryId: r.categoryId ?? null,
        payee:      r.payee,
        amount:     r.amount,
        date:       r.date,
        notes:      r.notes ?? null,
      })),
    });

    return rows.map((row) => ({
      ...row,
      amount: convertAmountFromMilliunits(row.amount),
    }));
  },

  /**
   * Update a transaction for a user.
   * Returns null if not found / not owned by user.
   */
  async updateTransactionForUser(
    input: UpdateTransactionInput
  ): Promise<TransactionDetailDTO | null> {
    const row = await transactionRepository.updateTransaction(
      input.id,
      input.userId,
      input.patch
    );

    if (!row) return null;

    return {
      ...row,
      amount: convertAmountFromMilliunits(row.amount),
    };
  },

  /**
   * Delete a transaction for a user.
   * Returns null if not found / not owned by user.
   */
  async deleteTransactionForUser(
    input: DeleteTransactionInput
  ): Promise<{ id: string } | null> {
    return transactionRepository.deleteTransaction(input.id, input.userId);
  },

  /**
   * Bulk-delete transactions for a user.
   */
  async bulkDeleteTransactionsForUser(
    input: BulkDeleteTransactionsInput
  ): Promise<{ id: string }[]> {
    return transactionRepository.bulkDeleteTransactions({
      userId: input.userId,
      ids:    input.ids,
    });
  },
};