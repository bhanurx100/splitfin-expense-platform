/**
 * app/api/[[...route]]/categories.ts
 *
 * Route handlers only — auth, input validation, ctx.json().
 * All DB access delegated to the service layer.
 * All response shapes preserved exactly.
 */

import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { z } from "zod";

import { insertCategorySchema } from "@/src/db/schema";
import {
  getCategories,
  getCategory,
  createCategory,
  editCategory,
  removeCategory,
  removeManyCategories,
} from "@/src/server/services/category-service";

const app = new Hono()

  // ── GET / ──────────────────────────────────────────────────────────────────
  .get("/", clerkMiddleware(), async (ctx) => {
    const auth = getAuth(ctx);
    if (!auth?.userId) return ctx.json({ error: "Unauthorized." }, 401);

    const data = await getCategories(auth.userId);
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

      const data = await getCategory(id, auth.userId);
      if (!data) return ctx.json({ error: "Not found." }, 404);

      return ctx.json({ data });
    }
  )

  // ── POST / ─────────────────────────────────────────────────────────────────
  .post(
    "/",
    clerkMiddleware(),
    zValidator("json", insertCategorySchema.pick({ name: true })),
    async (ctx) => {
      const auth   = getAuth(ctx);
      const values = ctx.req.valid("json");

      if (!auth?.userId) return ctx.json({ error: "Unauthorized." }, 401);

      const data = await createCategory(auth.userId, values);
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

      const data = await removeManyCategories(values.ids, auth.userId);
      return ctx.json({ data });
    }
  )

  // ── PATCH /:id ─────────────────────────────────────────────────────────────
  .patch(
    "/:id",
    clerkMiddleware(),
    zValidator("param", z.object({ id: z.string().optional() })),
    zValidator("json", insertCategorySchema.pick({ name: true })),
    async (ctx) => {
      const auth   = getAuth(ctx);
      const { id } = ctx.req.valid("param");
      const values = ctx.req.valid("json");

      if (!id)           return ctx.json({ error: "Missing id." }, 400);
      if (!auth?.userId) return ctx.json({ error: "Unauthorized." }, 401);

      const data = await editCategory(id, auth.userId, values);
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

      const data = await removeCategory(id, auth.userId);
      if (!data) return ctx.json({ error: "Not found." }, 404);

      return ctx.json({ data });
    }
  );

export default app;