/**
 * features/accounts/api/accounts-api.ts
 *
 * Pure API communication layer for accounts.
 * NO React, NO hooks, NO business logic.
 * Only: hono client calls + response unwrapping.
 */

import { client } from "@/src/lib/hono";
import type { InferRequestType, InferResponseType } from "hono";

// ─── Response types ────────────────────────────────────────────────────────────

export type AccountListItem = InferResponseType<
  typeof client.api.accounts.$get,
  200
>["data"][0];

export type AccountDetail = InferResponseType<
  (typeof client.api.accounts)[":id"]["$get"],
  200
>["data"];

export type CreateAccountInput = InferRequestType<
  typeof client.api.accounts.$post
>["json"];

export type UpdateAccountInput = InferRequestType<
  (typeof client.api.accounts)[":id"]["$patch"]
>["json"];

export type BulkDeleteAccountsInput = InferRequestType<
  (typeof client.api.accounts)["bulk-delete"]["$post"]
>["json"];

// ─── API functions ─────────────────────────────────────────────────────────────

export async function getAccounts(): Promise<AccountListItem[]> {
  const response = await client.api.accounts.$get();
  if (!response.ok) throw new Error("Failed to fetch accounts.");
  const { data } = await response.json();
  return data;
}

export async function getAccount(id: string): Promise<AccountDetail> {
  const response = await client.api.accounts[":id"].$get({ param: { id } });
  if (!response.ok) throw new Error("Failed to fetch account.");
  const { data } = await response.json();
  return data;
}

export async function createAccount(input: CreateAccountInput) {
  const response = await client.api.accounts.$post({ json: input });
  return response.json();
}

export async function updateAccount(id: string, input: UpdateAccountInput) {
  const response = await client.api.accounts[":id"]["$patch"]({
    json: input,
    param: { id },
  });
  return response.json();
}

export async function deleteAccount(id: string) {
  const response = await client.api.accounts[":id"]["$delete"]({ param: { id } });
  return response.json();
}

export async function bulkDeleteAccounts(input: BulkDeleteAccountsInput) {
  const response = await client.api.accounts["bulk-delete"]["$post"]({ json: input });
  return response.json();
}