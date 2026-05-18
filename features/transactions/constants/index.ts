/**
 * features/transactions/constants/index.ts
 *
 * Shared constants for the transactions feature.
 * Import from here instead of defining magic numbers inline.
 */

/** Number of rows per page on the desktop activity table. */
export const TX_PAGE_SIZE = 20;

/** Initial import state — reset to this after a successful import. */
export const INITIAL_IMPORT = { data: [] as string[][], errors: [], meta: [] } as const;

/** CSV date format expected from bank exports. */
export const CSV_DATE_FORMAT = "yyyy-MM-dd HH:mm:ss";

/** Output date format for the database. */
export const DB_DATE_FORMAT = "yyyy-MM-dd";

/** Required CSV columns that must be mapped before import can proceed. */
export const REQUIRED_IMPORT_COLUMNS = ["amount", "date", "payee"] as const;
export type RequiredImportColumn = (typeof REQUIRED_IMPORT_COLUMNS)[number];