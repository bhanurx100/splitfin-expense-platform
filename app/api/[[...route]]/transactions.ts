/**
 * app/api/[[...route]]/transactions.ts
 *
 * Route handlers only — auth, input validation, and ctx.json().
 * All DB access is delegated to the service layer.
 *
 * Response shapes are preserved exactly to avoid breaking clients.
 */

import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { insertTransactionSchema } from "@/db/schema";
import {
  getTransactions,
  getTransaction,
  createTransaction,
  createManyTransactions,
  editTransaction,
  removeTransaction,
  removeManyTransactions,
} from "@/server/services/transaction-service";

const app = new Hono()

  // ── GET / ─────────────────────────────────────────────────────────────────
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
      if (!auth?.userId) return ctx.json({ error: "Unauthorized." }, 401);

      const { from, to, accountId } = ctx.req.valid("query");

      const data = await getTransactions(auth.userId, { from, to, accountId });
      return ctx.json({ data });
    }
  )

  // ── GET /:id ──────────────────────────────────────────────────────────────
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid("param");

      if (!id)           return ctx.json({ error: "Missing id." }, 400);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized." }, 401);

      const data = await getTransaction(id, auth.userId);
      if (!data) return ctx.json({ error: "Not found." }, 404);

      return ctx.json({ data });
    }
  )

  // ── POST / ────────────────────────────────────────────────────────────────
  .post(
    "/",
    clerkMiddleware(),
    zValidator("json", insertTransactionSchema.omit({ id: true })),
    async (ctx) => {
      const auth   = getAuth(ctx);
      const values = ctx.req.valid("json");

      if (!auth?.userId) return ctx.json({ error: "Unauthorized." }, 401);

      const data = await createTransaction(values);
      return ctx.json({ data });
    }
  )

  // ── POST /bulk-create ─────────────────────────────────────────────────────
  .post(
    "/bulk-create",
    clerkMiddleware(),
    zValidator("json", z.array(insertTransactionSchema.omit({ id: true }))),
    async (ctx) => {
      const auth   = getAuth(ctx);
      const values = ctx.req.valid("json");

      if (!auth?.userId) return ctx.json({ error: "Unauthorized." }, 401);

      const data = await createManyTransactions(values);
      return ctx.json({ data });
    }
  )

  // ── POST /bulk-delete ─────────────────────────────────────────────────────
  .post(
    "/bulk-delete",
    clerkMiddleware(),
    zValidator("json", z.object({ ids: z.array(z.string()) })),
    async (ctx) => {
      const auth   = getAuth(ctx);
      const values = ctx.req.valid("json");

      if (!auth?.userId) return ctx.json({ error: "Unauthorized." }, 401);

      const data = await removeManyTransactions(values.ids, auth.userId);
      return ctx.json({ data });
    }
  )

  // ── PATCH /:id ────────────────────────────────────────────────────────────
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string().optional() })),
    zValidator("json", insertTransactionSchema.omit({ id: true })),
    async (ctx) => {
      const auth   = getAuth(ctx);
      const { id } = ctx.req.valid("param");
      const values = ctx.req.valid("json");

      if (!id)           return ctx.json({ error: "Missing id." }, 400);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized." }, 401);

      const data = await editTransaction(id, auth.userId, values);
      if (!data) return ctx.json({ error: "Not found." }, 404);

      return ctx.json({ data });
    }
  )

  // ── DELETE /:id ───────────────────────────────────────────────────────────
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string().optional() })),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid("param");

      if (!id)           return ctx.json({ error: "Missing id." }, 400);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized." }, 401);

      const data = await removeTransaction(id, auth.userId);
      if (!data) return ctx.json({ error: "Not found." }, 404);

      return ctx.json({ data });
    }
  );

export default app;