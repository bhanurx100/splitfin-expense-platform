/**
 * features/accounts/dev/accounts-demo-data.ts
 *
 * TEMPORARY — delete this file when real API data is wired.
 * All demo accounts for the Accounts Home Screen live here.
 * UI components import from here, never hardcode inline.
 */

export type DemoAccount = {
  id: string;
  name: string;
  /** "Bank Account" | "Wallet" | "Cash" */
  type: "Bank Account" | "Wallet" | "Cash";
  balance: number;
  /** hex color for the icon background */
  iconColor: string;
};

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    id: "demo-hdfc",
    name: "HDFC Bank",
    type: "Bank Account",
    balance: 125000,
    iconColor: "#6C5CE7",
  },
  {
    id: "demo-icici",
    name: "ICICI Bank",
    type: "Bank Account",
    balance: 65000,
    iconColor: "#e84393",
  },
  {
    id: "demo-paytm",
    name: "Paytm Wallet",
    type: "Wallet",
    balance: 12500,
    iconColor: "#0984e3",
  },
  {
    id: "demo-cash",
    name: "Cash in Hand",
    type: "Cash",
    balance: 8000,
    iconColor: "#00b894",
  },
  {
    id: "demo-sbi",
    name: "SBI Bank",
    type: "Bank Account",
    balance: 35360,
    iconColor: "#fd79a8",
  },
  {
    id: "demo-kotak",
    name: "Kotak Bank",
    type: "Bank Account",
    balance: 0,
    iconColor: "#fdcb6e",
  },
];

/** Pre-computed total shown in the hero card */
export const DEMO_TOTAL_BALANCE: number = DEMO_ACCOUNTS.reduce(
  (sum, a) => sum + a.balance,
  0
);
// => 2,45,860