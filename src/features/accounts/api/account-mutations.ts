/**
 * features/accounts/api/account-mutations.ts
 *
 * Centralized mutation option factories for accounts.
 * Single source of truth for cache invalidation after account writes.
 */

import type { QueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createAccount,
  updateAccount,
  deleteAccount,
  bulkDeleteAccounts,
  type CreateAccountInput,
  type UpdateAccountInput,
  type BulkDeleteAccountsInput,
} from "./accounts-api";
import { accountInvalidationTargets } from "./query-keys";

// ─── Shared invalidation ───────────────────────────────────────────────────────

export async function invalidateAfterAccountWrite(
  queryClient: QueryClient,
  id?: string
): Promise<void> {
  await Promise.all(
    accountInvalidationTargets(id).map((key) =>
      queryClient.invalidateQueries({ queryKey: key })
    )
  );
}

// ─── Mutation factories ────────────────────────────────────────────────────────

export function createAccountMutation(queryClient: QueryClient) {
  return {
    mutationFn: (input: CreateAccountInput) => createAccount(input),
    onSuccess: async () => {
      toast.success("Account created.");
      await invalidateAfterAccountWrite(queryClient);
    },
    onError: () => toast.error("Failed to create account."),
  } as const;
}

export function updateAccountMutation(
  queryClient: QueryClient,
  id: string | undefined
) {
  return {
    mutationFn: (input: UpdateAccountInput) => updateAccount(id!, input),
    onSuccess: async () => {
      toast.success("Account updated.");
      await invalidateAfterAccountWrite(queryClient, id);
    },
    onError: () => toast.error("Failed to edit account."),
  } as const;
}

export function deleteAccountMutation(
  queryClient: QueryClient,
  id: string | undefined
) {
  return {
    mutationFn: () => deleteAccount(id!),
    onSuccess: async () => {
      toast.success("Account deleted.");
      await invalidateAfterAccountWrite(queryClient, id);
    },
    onError: () => toast.error("Failed to delete account."),
  } as const;
}

export function bulkDeleteAccountsMutation(queryClient: QueryClient) {
  return {
    mutationFn: (input: BulkDeleteAccountsInput) => bulkDeleteAccounts(input),
    onSuccess: async () => {
      toast.success("Account(s) deleted.");
      await invalidateAfterAccountWrite(queryClient);
    },
    onError: () => toast.error("Failed to delete account(s)."),
  } as const;
}