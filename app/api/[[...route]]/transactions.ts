/**
 * app/api/[[...route]]/transactions.ts
 *
 * PARTIALLY MIGRATED — GET "/" now delegates to transactionService.
 * All other routes are unchanged from the original.
 *
 * MIGRATION STATUS:
 *   ✅ GET /transactions         → uses transactionService
 *   ⬜ GET /transactions/:id     → still inline (safe to migrate next)
 *   ⬜ POST /transactions        → still inline
 *   ⬜ POST /transactions/bulk-create → still inline
 *   ⬜ POST /transactions/bulk-delete → still inline
 *   ⬜ PATCH /transactions/:id   → still inline
 *   ⬜ DELETE /transactions/:id  → still inline
 *
 * WHY ONLY ONE:
 *   Proof-of-concept to verify the service/repository layer works in the
 *   Vercel edge runtime before migrating higher-risk write routes.
 *
 * ROLLBACK:
 *   If service migration causes issues, restore the original inline query
 *   from git. The rest of the routes are unaffected.
 */

import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { createId } from "@paralleldrive/cuid2";
//import { parse, subDays } from "date-fns";
import { and, eq, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";

import { db } from "@/db/drizzle";
import {
  accounts,
  insertTransactionSchema,
  transactions,
} from "@/db/schema";

// ── Service import (used by migrated GET route only) ───────────────────────────
import { transactionService } from "@/server/services/transaction-service";

const app = new Hono()

  // ── GET / — MIGRATED to service layer ─────────────────────────────────────
  .get(
    "/",
    zValidator(
      "query",
      z.object({
        from:      z.string().optional(),
        to:        z.string().optional(),
        accountId: z.string().optional(),
      })
    ),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { from, to, accountId } = ctx.req.valid("query");

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      // CHANGED: was inline drizzle query, now delegates to service.
      // Response shape is identical — amount is still in plain decimals
      // because the service handles the milliunit conversion.
      const data = await transactionService.getTransactionsForUser({
        userId:    auth.userId,
        from,
        to,
        accountId,
      });

      return ctx.json({ data });
    }
  )

  // ── GET /:id — UNCHANGED ───────────────────────────────────────────────────
  // TODO(next): migrate to transactionService.getTransactionForUser()
  .get(
    "/:id",
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid("param");

      if (!id) {
        return ctx.json({ error: "Missing id." }, 400);
      }

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      const [data] = await db
        .select({
          id:         transactions.id,
          date:       transactions.date,
          categoryId: transactions.categoryId,
          payee:      transactions.payee,
          amount:     transactions.amount,
          notes:      transactions.notes,
          accountId:  transactions.accountId,
        })
        .from(transactions)
        .innerJoin(accounts, eq(transactions.accountId, accounts.id))
        .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)));

      if (!data) {
        return ctx.json({ error: "Not found." }, 404);
      }

      return ctx.json({ data });
    }
  )

  // ── POST / — UNCHANGED ────────────────────────────────────────────────────
  // TODO(next-safe): migrate to transactionService.createTransactionForUser()
  .post(
    "/",
    clerkMiddleware(),
    zValidator(
      "json",
      insertTransactionSchema.omit({
        id: true,
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const values = ctx.req.valid("json");

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      const [data] = await db
        .insert(transactions)
        .values({
          id: createId(),
          ...values,
        })
        .returning();

      return ctx.json({ data });
    }
  )

  // ── POST /bulk-create — UNCHANGED ─────────────────────────────────────────
  .post(
    "/bulk-create",
    clerkMiddleware(),
    zValidator("json", z.array(insertTransactionSchema.omit({ id: true }))),
    async (ctx) => {
      const auth = getAuth(ctx);
      const values = ctx.req.valid("json");

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      const data = await db
        .insert(transactions)
        .values(
          values.map((value) => ({
            id: createId(),
            ...value,
          }))
        )
        .returning();

      return ctx.json({ data });
    }
  )

  // ── POST /bulk-delete — UNCHANGED ─────────────────────────────────────────
  .post(
    "/bulk-delete",
    clerkMiddleware(),
    zValidator(
      "json",
      z.object({
        ids: z.array(z.string()),
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const values = ctx.req.valid("json");

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      const transactionsToDelete = db.$with("transactions_to_delete").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(
            and(
              inArray(transactions.id, values.ids),
              eq(accounts.userId, auth.userId)
            )
          )
      );

      const data = await db
        .with(transactionsToDelete)
        .delete(transactions)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionsToDelete})`
          )
        )
        .returning({
          id: transactions.id,
        });

      return ctx.json({ data });
    }
  )

  // ── PATCH /:id — UNCHANGED ────────────────────────────────────────────────
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    zValidator(
      "json",
      insertTransactionSchema.omit({
        id: true,
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid("param");
      const values = ctx.req.valid("json");

      if (!id) {
        return ctx.json({ error: "Missing id." }, 400);
      }

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      const transactionsToUpdate = db.$with("transactions_to_update").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)))
      );

      const [data] = await db
        .with(transactionsToUpdate)
        .update(transactions)
        .set(values)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionsToUpdate})`
          )
        )
        .returning();

      if (!data) {
        return ctx.json({ error: "Not found." }, 404);
      }

      return ctx.json({ data });
    }
  )

  // ── DELETE /:id — UNCHANGED ───────────────────────────────────────────────
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator(
      "param",
      z.object({
        id: z.string().optional(),
      })
    ),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid("param");

      if (!id) {
        return ctx.json({ error: "Missing id." }, 400);
      }

      if (!auth?.userId) {
        return ctx.json({ error: "Unauthorized." }, 401);
      }

      const transactionsToDelete = db.$with("transactions_to_delete").as(
        db
          .select({ id: transactions.id })
          .from(transactions)
          .innerJoin(accounts, eq(transactions.accountId, accounts.id))
          .where(and(eq(transactions.id, id), eq(accounts.userId, auth.userId)))
      );

      const [data] = await db
        .with(transactionsToDelete)
        .delete(transactions)
        .where(
          inArray(
            transactions.id,
            sql`(select id from ${transactionsToDelete})`
          )
        )
        .returning({
          id: transactions.id,
        });

      if (!data) {
        return ctx.json({ error: "Not found." }, 404);
      }

      return ctx.json({ data });
    }
  );

export default app;