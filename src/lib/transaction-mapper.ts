/**
 * Transaction Mapper
 * 
 * Maps between different transaction formats:
 * - Database schema (from repository)
 * - Canonical Transaction model
 * - CSV format
 */

import { Transaction } from '@/src/types/transaction';

// Database transaction type (from repository)
export interface DbTransaction {
  id: string;
  date: Date;
  amount: number;
  payee: string;
  notes: string | null;
  account: string;
  accountId: string;
  category: string | null;
  categoryId: string | null;
}

/**
 * Convert database transaction to canonical Transaction
 */
export function dbToCanonical(dbTx: DbTransaction, source: Transaction['source'] = 'manual'): Transaction {
  // Determine type based on amount sign
  const type: Transaction['type'] = dbTx.amount >= 0 ? 'income' : 'expense';
  
  return {
    id: dbTx.id,
    date: dbTx.date,
    amount: Math.abs(dbTx.amount),
    type,
    account: dbTx.account,
    category: dbTx.category || 'Uncategorized',
    description: dbTx.payee,
    source,
  };
}

/**
 * Convert array of database transactions to canonical Transactions
 */
export function dbToCanonicalMany(dbTxs: DbTransaction[], source: Transaction['source'] = 'manual'): Transaction[] {
  return dbTxs.map(tx => dbToCanonical(tx, source));
}

/**
 * Convert canonical Transaction to database format
 * Note: This requires accountId and categoryId which may need to be resolved
 */
export function canonicalToDb(tx: Transaction, accountId: string, categoryId: string | null = null): Omit<DbTransaction, 'accountId' | 'categoryId'> {
  const amount = tx.type === 'expense' ? -tx.amount : tx.amount;
  
  return {
    id: tx.id,
    date: tx.date,
    amount,
    payee: tx.description,
    notes: null,
    account: tx.account,
    category: tx.category,
  };
}
