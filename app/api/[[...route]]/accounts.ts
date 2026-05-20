/**
 * app/api/[[...route]]/accounts.ts
 *
 * Migration status:
 *   GET /          ✅ delegated to account-service
 *   GET /:id       ✅ delegated to account-service
 *   POST /         ✅ delegated to account-service
 *   POST /bulk-delete ✅ delegated to account-service
 *   PATCH /:id     ✅ delegated to account-service
 *   DELETE /:id    ✅ delegated to account-service
 *
 * All response shapes preserved exactly.
 */

import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { insertAccountSchema } from "@/db/schema";
import {
  getAccounts,
  getAccount,
  createAccount,
  editAccount,
  removeAccount,
  removeManyAccounts,
} from "@/server/services/account-service";

const app = new Hono()

  // ── GET / ──────────────────────────────────────────────────────────────────
  .get("/", clerkMiddleware(), async (ctx) => {
    const auth = getAuth(ctx);
    if (!auth?.userId) return ctx.json({ error: "Unauthorized." }, 401);

    const data = await getAccounts(auth.userId);
    return ctx.json({ data });
  })

  // ── GET /:id ───────────────────────────────────────────────────────────────
  .get(
    "/:id",
    zValidator("param", z.object({ id: z.string().optional() })),
    clerkMiddleware(),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid("param");

      if (!id)           return ctx.json({ error: "Missing id." }, 400);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized." }, 401);

      const data = await getAccount(id, auth.userId);
      if (!data) return ctx.json({ error: "Not found." }, 404);

      return ctx.json({ data });
    }
  )

  // ── POST / ─────────────────────────────────────────────────────────────────
  .post(
    "/",
    clerkMiddleware(),
    zValidator("json", insertAccountSchema.pick({ name: true })),
    async (ctx) => {
      const auth   = getAuth(ctx);
      const values = ctx.req.valid("json");

      if (!auth?.userId) return ctx.json({ error: "Unauthorized." }, 401);

      const data = await createAccount(auth.userId, values);
      return ctx.json({ data });
    }
  )

  // ── POST /bulk-delete ──────────────────────────────────────────────────────
  .post(
    "/bulk-delete",
    clerkMiddleware(),
    zValidator("json", z.object({ ids: z.array(z.string()) })),
    async (ctx) => {
      const auth   = getAuth(ctx);
      const values = ctx.req.valid("json");

      if (!auth?.userId) return ctx.json({ error: "Unauthorized." }, 401);

      const data = await removeManyAccounts(values.ids, auth.userId);
      return ctx.json({ data });
    }
  )

  // ── PATCH /:id ─────────────────────────────────────────────────────────────
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string().optional() })),
    zValidator("json", insertAccountSchema.pick({ name: true })),
    async (ctx) => {
      const auth   = getAuth(ctx);
      const { id } = ctx.req.valid("param");
      const values = ctx.req.valid("json");

      if (!id)           return ctx.json({ error: "Missing id." }, 400);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized." }, 401);

      const data = await editAccount(id, auth.userId, values);
      if (!data) return ctx.json({ error: "Not found." }, 404);

      return ctx.json({ data });
    }
  )

  // ── DELETE /:id ────────────────────────────────────────────────────────────
  .delete(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string().optional() })),
    async (ctx) => {
      const auth = getAuth(ctx);
      const { id } = ctx.req.valid("param");

      if (!id)           return ctx.json({ error: "Missing id." }, 400);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized." }, 401);

      const data = await removeAccount(id, auth.userId);
      if (!data) return ctx.json({ error: "Not found." }, 404);

      return ctx.json({ data });
    }
  );

export default app;