/**
 * useTransactions Hook
 * 
 * Central hook to fetch transactions from the API
 * and convert them to canonical Transaction format.
 * 
 * This is the single source of truth for transactions in the application.
 * All pages should use this hook instead of loading CSV directly.
 */

import { useQuery } from '@tanstack/react-query';
import { Transaction } from '@/src/types/transaction';
import { dbToCanonicalMany, type DbTransaction } from '@/src/lib/transaction-mapper';

/**
 * Fetch transactions from API and convert to canonical format
 */
async function fetchTransactions(): Promise<Transaction[]> {
  const response = await fetch('/api/transactions');
  if (!response.ok) {
    throw new Error('Failed to fetch transactions');
  }
  
  const result = await response.json();
  const dbTransactions = result.data as DbTransaction[];
  
  return dbToCanonicalMany(dbTransactions, 'manual');
}

/**
 * Hook to get canonical transactions
 */
export function useTransactions() {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: fetchTransactions,
  });
}
