/**
 * server/repositories/category-repository.ts
 *
 * Raw database access for categories.
 * - No auth logic — callers pass verified userId.
 * - No orchestration — one DB responsibility per function.
 */

import { createId } from "@paralleldrive/cuid2";
import { and, eq, inArray } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { categories, insertCategorySchema } from "@/db/schema";
import type { z } from "zod";

// ── Types ─────────────────────────────────────────────────────────────────────

type NameValues = Pick<z.infer<typeof insertCategorySchema>, "name">;

// ── Read ──────────────────────────────────────────────────────────────────────

export async function listCategories(userId: string) {
  return db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(eq(categories.userId, userId));
}

export async function getCategoryById(id: string, userId: string) {
  const [row] = await db
    .select({ id: categories.id, name: categories.name })
    .from(categories)
    .where(and(eq(categories.userId, userId), eq(categories.id, id)));

  return row ?? null;
}

// ── Write ─────────────────────────────────────────────────────────────────────

export async function insertCategory(userId: string, values: NameValues) {
  const [row] = await db
    .insert(categories)
    .values({ id: createId(), userId, ...values })
    .returning();

  return row;
}

export async function updateCategory(
  id: string,
  userId: string,
  values: NameValues
) {
  const [row] = await db
    .update(categories)
    .set(values)
    .where(and(eq(categories.userId, userId), eq(categories.id, id)))
    .returning();

  return row ?? null;
}

export async function deleteCategory(id: string, userId: string) {
  const [row] = await db
    .delete(categories)
    .where(and(eq(categories.userId, userId), eq(categories.id, id)))
    .returning({ id: categories.id });

  return row ?? null;
}

export async function deleteManyCategories(ids: string[], userId: string) {
  return db
    .delete(categories)
    .where(and(eq(categories.userId, userId), inArray(categories.id, ids)))
    .returning({ id: categories.id });
}