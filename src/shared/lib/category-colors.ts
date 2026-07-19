/**
 * Category color palette — presentation-layer concern.
 *
 * `lib/data.ts` carries content only; distinct visual colors are assigned
 * here, by display position. Categories added or removed later are colored
 * automatically — no data change required.
 */
export const CATEGORY_PALETTE = [
  '#ff2d78', // vivid pink
  '#ffaa2b', // amber
  '#14d9ff', // cyan
  '#16e6a1', // emerald
  '#a855f7', // violet
  '#fb7185', // rose
  '#2dd4bf', // teal
  '#60a5fa', // sky
  '#f472b6', // pink
  '#facc15', // gold
  '#34d399', // mint
  '#94a3b8', // slate
] as const

export function categoryPaletteColor(index: number): string {
  return CATEGORY_PALETTE[((index % CATEGORY_PALETTE.length) + CATEGORY_PALETTE.length) % CATEGORY_PALETTE.length]
}

/**
 * Return the categories with palette colors applied by display position.
 * Pass the array in the exact order it will be rendered.
 */
export function withCategoryPalette<T extends { color: string }>(categories: T[]): T[] {
  return categories.map((c, i) => ({ ...c, color: categoryPaletteColor(i) }))
}
