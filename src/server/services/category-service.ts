/**
 * server/services/category-service.ts
 *
 * Orchestration between route handlers and the category repository.
 * - Accepts verified userId from route layer.
 * - No direct DB access — all persistence via repository.
 * - No Hono / ctx references.
 */

import {
  listCategories,
  getCategoryById,
  insertCategory,
  updateCategory,
  deleteCategory,
  deleteManyCategories,
} from "@/src/server/repositories/category-repository";

import type { insertCategorySchema } from "@/src/db/schema";
import type { z } from "zod";

type NameValues = Pick<z.infer<typeof insertCategorySchema>, "name">;

export const getCategories      = (userId: string)                           => listCategories(userId);
export const getCategory        = (id: string, userId: string)               => getCategoryById(id, userId);
export const createCategory     = (userId: string, values: NameValues)       => insertCategory(userId, values);
export const editCategory       = (id: string, userId: string, v: NameValues) => updateCategory(id, userId, v);
export const removeCategory     = (id: string, userId: string)               => deleteCategory(id, userId);
export const removeManyCategories = (ids: string[], userId: string)          => deleteManyCategories(ids, userId);