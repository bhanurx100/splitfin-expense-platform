/**
 * Design constants for SplitPay feature.
 * Centralized colors, gradients, and styling tokens.
 * All hardcoded styling values should be moved here.
 */

// ─── Brand Colors ───────────────────────────────────────────────────────────────

export const BRAND = {
  primary: "#8B5CF6",
  secondary: "#FF0A7A",
  accent: "#00E5C3",
  success: "#00D67A",
  warning: "#F7B500",
  danger: "#FF5470",
} as const;

// ─── Text Colors ───────────────────────────────────────────────────────────────

export const TEXT = {
  primary: "#F9FAFB",
  secondary: "rgba(255,255,255,0.65)",
  muted: "rgba(255,255,255,0.40)",
  disabled: "rgba(255,255,255,0.25)",
} as const;

// ─── Background Colors ─────────────────────────────────────────────────────────

export const BACKGROUND = {
  card: "rgba(255,255,255,0.07)",
  cardHover: "rgba(255,255,255,0.10)",
  divider: "rgba(255,255,255,0.07)",
  border: "rgba(255,255,255,0.10)",
} as const;

// ─── Gradients ─────────────────────────────────────────────────────────────────

export const GRADIENTS = {
  primary: "linear-gradient(135deg, #8B5CF6, #FF0A7A)",
  success: "linear-gradient(90deg, #00D4AE, #00FFD0)",
  danger: "linear-gradient(90deg, #FF008C, #FF4472)",
  brand: "linear-gradient(135deg, rgba(255,0,140,0.5) 0%, rgba(124,58,237,0.6) 50%, rgba(0,255,208,0.4) 100%)",
  brandSubtle: "linear-gradient(135deg, rgba(255,0,140,0.4) 0%, rgba(124,58,237,0.5) 50%, rgba(0,255,208,0.35) 100%)",
  card: "linear-gradient(135deg,rgba(255,10,122,0.45),rgba(139,92,246,0.55),rgba(0,229,195,0.35))",
  connector: "linear-gradient(to bottom, rgba(255,255,255,0.10), rgba(255,255,255,0.02))",
} as const;

// ─── Timeline Card Type Config ─────────────────────────────────────────────────

export const TIMELINE_CARD_CONFIG = {
  expense_created: {
    accent: "#FF0A7A",
    bgMuted: "rgba(255,10,122,0.06)",
    border: "rgba(255,10,122,0.18)",
  },
  expense_edited: {
    accent: "#8B5CF6",
    bgMuted: "rgba(139,92,246,0.07)",
    border: "rgba(139,92,246,0.20)",
  },
  expense_deleted: {
    accent: "#FF5470",
    bgMuted: "rgba(255,84,112,0.07)",
    border: "rgba(255,84,112,0.20)",
  },
  settlement: {
    accent: "#00D67A",
    bgMuted: "rgba(0,214,122,0.07)",
    border: "rgba(0,214,122,0.22)",
  },
  payment_detected: {
    accent: "#00E5C3",
    bgMuted: "rgba(0,229,195,0.07)",
    border: "rgba(0,229,195,0.22)",
  },
  payment_manual: {
    accent: "#00D67A",
    bgMuted: "rgba(0,214,122,0.06)",
    border: "rgba(0,214,122,0.18)",
  },
  payment_pending: {
    accent: "#F7B500",
    bgMuted: "rgba(247,181,0,0.07)",
    border: "rgba(247,181,0,0.20)",
  },
} as const;

// ─── Avatar Colors ─────────────────────────────────────────────────────────────

export const AVATAR_COLORS = [
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#84cc16",
  "#f97316",
  "#6366f1",
] as const;

// ─── Shadow Values ───────────────────────────────────────────────────────────

export const SHADOWS = {
  primary: "0 4px 20px rgba(139,92,246,0.35), 0 2px 8px rgba(0,0,0,0.3)",
  danger: "0 4px 20px rgba(255,10,122,0.35), 0 2px 8px rgba(0,0,0,0.4)",
  glow: "0 0 24px rgba(124,58,237,0.25), 0 12px 48px rgba(0,0,0,0.5)",
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────

export const RADIUS = {
  sm: "8px",
  md: "12px",
  lg: "16px",
  xl: "18px",
  "2xl": "22px",
  "3xl": "26px",
  full: "9999px",
} as const;

// ─── Font Sizes ───────────────────────────────────────────────────────────────

export const FONT_SIZES = {
  xs: "10px",
  sm: "11px",
  base: "12px",
  md: "13px",
  lg: "14px",
  xl: "15px",
  "2xl": "16px",
  "3xl": "22px",
} as const;
