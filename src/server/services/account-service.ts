/**
 * server/services/account-service.ts
 *
 * Orchestration between route handlers and the account repository.
 * - Accepts verified userId from route layer.
 * - No direct DB access — all persistence via repository.
 * - No Hono / ctx references.
 */

import {
  listAccounts,
  getAccountById,
  insertAccount,
  updateAccount,
  deleteAccount,
  deleteManyAccounts,
} from "@/src/server/repositories/account-repository";

import type { insertAccountSchema } from "@/src/db/schema";
import type { z } from "zod";

type NameValues = Pick<z.infer<typeof insertAccountSchema>, "name">;

export const getAccounts  = (userId: string)                          => listAccounts(userId);
export const getAccount   = (id: string, userId: string)              => getAccountById(id, userId);
export const createAccount = (userId: string, values: NameValues)     => insertAccount(userId, values);
export const editAccount   = (id: string, userId: string, v: NameValues) => updateAccount(id, userId, v);
export const removeAccount = (id: string, userId: string)             => deleteAccount(id, userId);
export const removeManyAccounts = (ids: string[], userId: string)     => deleteManyAccounts(ids, userId);