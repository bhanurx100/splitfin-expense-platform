/**
 * Transaction Mapper
 *
 * Maps between different transaction formats:
 * - Database schema (from repository)
 * - Canonical Transaction model (src/types/transaction.ts — Premium UI shape)
 * - CSV format
 */

import { Transaction, TransactionType } from '@/src/types/transaction';

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

const timeFormatter = new Intl.DateTimeFormat('en-IN', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: true,
});

const dateFormatter = new Intl.DateTimeFormat('en-IN', {
  day: 'numeric',
  month: 'short',
});

/**
 * Convert database transaction to canonical Transaction
 */
export function dbToCanonical(dbTx: DbTransaction): Transaction {
  // Determine type based on amount sign
  const type: TransactionType = dbTx.amount >= 0 ? 'income' : 'expense';
  const date = dbTx.date instanceof Date ? dbTx.date : new Date(dbTx.date);

  return {
    id: dbTx.id,
    merchant: dbTx.payee,
    subtitle: dbTx.notes ?? dbTx.payee,
    category: dbTx.category || 'Uncategorized',
    icon: 'more-horizontal',
    account: dbTx.account,
    type,
    amount: Math.abs(dbTx.amount),
    currency: 'INR',
    time: timeFormatter.format(date),
    date: dateFormatter.format(date),
    isoDate: date.toISOString().slice(0, 10),
    status: 'completed',
  };
}

/**
 * Convert array of database transactions to canonical Transactions
 */
export function dbToCanonicalMany(dbTxs: DbTransaction[]): Transaction[] {
  return dbTxs.map(tx => dbToCanonical(tx));
}

/**
 * Convert canonical Transaction to database format
 * Note: This requires accountId and categoryId which may need to be resolved
 */
export function canonicalToDb(tx: Transaction, accountId: string, categoryId: string | null = null): Omit<DbTransaction, 'accountId' | 'categoryId'> {
  const amount = tx.type === 'expense' ? -tx.amount : tx.amount;

  return {
    id: tx.id,
    date: new Date(`${tx.isoDate}T00:00:00Z`),
    amount,
    payee: tx.merchant,
    notes: null,
    account: tx.account,
    category: tx.category,
  };
}
