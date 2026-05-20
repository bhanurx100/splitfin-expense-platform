/**
 * features/accounts/api/account-queries.ts
 *
 * Reusable TanStack Query option configs for accounts.
 * Hooks call useQuery(accountListQuery()) — zero inline logic.
 */

import type { UseQueryOptions } from "@tanstack/react-query";
import { accountKeys } from "./query-keys";
import {
  getAccounts,
  getAccount,
  type AccountListItem,
  type AccountDetail,
} from "./accounts-api";

export function accountListQuery(): UseQueryOptions<AccountListItem[], Error> {
  return {
    queryKey: accountKeys.list(),
    queryFn: getAccounts,
    staleTime: 60 * 1000,
  };
}

export function accountDetailQuery(
  id: string | undefined
): UseQueryOptions<AccountDetail, Error> {
  return {
    queryKey: accountKeys.detail(id ?? ""),
    queryFn: () => getAccount(id!),
    enabled: !!id,
    staleTime: 60 * 1000,
  };
}