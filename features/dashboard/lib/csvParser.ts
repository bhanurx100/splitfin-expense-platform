export interface Transaction {
  type: 'Credit' | 'Debit' | 'Transfer';
  date: string;
  description: string;
  category: string;
  amount: number;
  account: string;
}

export function parseCSV(csvContent: string): Transaction[] {
  const lines = csvContent.trim().split('\n');
  const headers = lines[0].split(',');
  
  const transactions: Transaction[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(',');
    if (values.length === headers.length) {
      const transaction: Transaction = {
        type: values[0] as Transaction['type'],
        date: values[1],
        description: values[2],
        category: values[3],
        amount: parseFloat(values[4]),
        account: values[5],
      };
      transactions.push(transaction);
    }
  }
  
  return transactions;
}

export async function loadTransactions(): Promise<Transaction[]> {
  try {
    const response = await fetch('/data.csv');
    const csvContent = await response.text();
    return parseCSV(csvContent);
  } catch (error) {
    console.error('Error loading CSV:', error);
    return [];
  }
}
