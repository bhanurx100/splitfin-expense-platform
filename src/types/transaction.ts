/**
 * Canonical Transaction Model
 * 
 * This is the single source of truth for all transactions in the application.
 * All input sources (CSV, SMS, Email, Manual Entry, OCR, Bank Sync, UPI Sync)
 * must normalize to this format.
 * 
 * All selectors and UI components work with this canonical format.
 * 
 * Mapping to database schema is handled in the repository layer.
 */

export interface Transaction {
  id: string;
  date: Date;
  amount: number;
  type: 'income' | 'expense' | 'transfer';
  account: string;
  category: string;
  description: string;
  source: string;
}

/**
 * Transaction source types
 */
export type TransactionSource = 
  | 'csv'
  | 'sms'
  | 'email'
  | 'manual'
  | 'ocr'
  | 'bank_sync'
  | 'upi_sync';
