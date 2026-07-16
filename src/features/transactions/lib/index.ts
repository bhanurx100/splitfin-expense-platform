/**

 * features/transactions/lib/index.ts

 *

 * Convenience barrel — import any transaction utility from this single path:

 *

 *   import { formatINR, categoryColor, filterTransactions } from "@/features/transactions/lib"

 *

 * For tree-shaking in large bundles, import directly from the sub-module instead.

 */



export * from "./formatters";

export * from "./categories";

export * from "./filters";