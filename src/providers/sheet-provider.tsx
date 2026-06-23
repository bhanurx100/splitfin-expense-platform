"use client";

import { useMountedState } from "react-use";

import { EditAccountSheet } from "@/src/features/accounts/components/edit-account-sheet";
import { NewAccountSheet } from "@/src/features/accounts/components/new-account-sheet";

import { EditCategorySheet } from "@/src/features/categories/components/edit-category-sheet";
import { NewCategorySheet } from "@/src/features/categories/components/new-category-sheet";

import { EditTransactionSheet } from "@/src/features/transactions/components/edit-transaction-sheet";
import { NewTransactionSheet } from "@/src/features/transactions/components/new-transaction-sheet";

export const SheetProvider = () => {
  const isMounted = useMountedState();

  if (!isMounted) return null;

  return (
    <>
      <EditAccountSheet />
      <NewAccountSheet />

      <EditCategorySheet />
      <NewCategorySheet />

      <EditTransactionSheet />
      <NewTransactionSheet />
    </>
  );
};
