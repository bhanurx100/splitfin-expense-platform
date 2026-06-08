import { Transaction } from '@/types/transaction';
import { createId } from '@paralleldrive/cuid2';

function normalizeTransactionType(type: string): Transaction['type'] {
  const normalized = type.trim().toLowerCase();
  
  // Normalize to income/expense/transfer
  if (normalized === 'credit' || normalized === 'income') {
    return 'income';
  }
  if (normalized === 'debit' || normalized === 'expense') {
    return 'expense';
  }
  return 'transfer';
}

/**
 * Parse CSV content and return canonical Transaction[]
 * 
 * CSV format expected:
 * Type,Date,Description,Category,Amount,Account
 * 
 * This function ONLY parses CSV to Transaction[].
 * It does NOT fetch data, does NOT calculate anything else.
 */
export function parseCSV(csvContent: string): Transaction[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  const transactions: Transaction[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length === headers.length) {
      const transaction: Transaction = {
        id: createId(),
        type: normalizeTransactionType(values[0]),
        date: new Date(values[1].trim()),
        description: values[2].trim(),
        category: values[3].trim(),
        amount: parseFloat(values[4]),
        account: values[5].trim(),
        source: 'csv',
      };
      transactions.push(transaction);
    }
  }
  
  return transactions;
}
