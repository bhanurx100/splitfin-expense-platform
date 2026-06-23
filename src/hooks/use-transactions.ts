/**
 * useTransactions Hook
 * 
 * Central hook to fetch transactions from the repository
 * and convert them to canonical Transaction format.
 * 
 * This is the single source of truth for transactions in the application.
 * All pages should use this hook instead of loading CSV directly.
 */

import { useQuery } from '@tanstack/react-query';
import { Transaction } from '@/src/types/transaction';
import { dbToCanonicalMany, type DbTransaction } from '@/src/lib/transaction-mapper';
import { listTransactions } from '@/src/server/repositories/transaction-repository';

// Mock user ID - in production this would come from auth
const MOCK_USER_ID = 'mock-user-id';

/**
 * Fetch transactions from repository and convert to canonical format
 */
async function fetchTransactions(): Promise<Transaction[]> {
  const now = new Date();
  const startDate = new Date(now.getFullYear() - 1, 0, 1); // Last 1 year
  
  const dbTransactions = await listTransactions({
    userId: MOCK_USER_ID,
    startDate,
    endDate: now,
  }) as DbTransaction[];
  
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
