/**
 * Financial formatting utilities.
 * Used across the dashboard for consistent number, percent and ratio rendering.
 */

/**
 * Format a numeric value with thousands separators and a fixed number of decimals.
 * Returns an em-dash ("—") when the value is null, undefined or exactly zero
 * so that zero/empty cells in the audited statements render cleanly.
 */
export function formatNumber(
  value: number | null | undefined,
  decimals = 2,
): string {
  if (value === null || value === undefined) return "—";
  if (Number.isNaN(value)) return "—";
  if (value === 0) return "—";
  return value.toLocaleString("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Compact representation suitable for KPI cards. Values in the millions
 * are rendered as e.g. "21.20M", thousands as "945.00K".
 * Returns "—" for null/undefined/zero.
 */
export function formatCompact(
  value: number | null | undefined,
  decimals = 2,
): string {
  if (value === null || value === undefined) return "—";
  if (Number.isNaN(value)) return "—";
  if (value === 0) return "—";
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) {
    return `${sign}${(abs / 1_000_000).toFixed(decimals)}M`;
  }
  if (abs >= 1_000) {
    return `${sign}${(abs / 1_000).toFixed(decimals)}K`;
  }
  return value.toFixed(decimals);
}

/**
 * Format a fractional ratio (e.g. 0.5761) as a percentage string ("57.61%").
 * Returns "—" for null/undefined.
 */
export function formatPercent(
  value: number | null | undefined,
  decimals = 2,
): string {
  if (value === null || value === undefined) return "—";
  if (Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a multiplier ratio (e.g. 1.94) as "1.94x".
 * Returns "—" for null/undefined.
 */
export function formatRatio(
  value: number | null | undefined,
  decimals = 2,
): string {
  if (value === null || value === undefined) return "—";
  if (Number.isNaN(value)) return "—";
  return `${value.toFixed(decimals)}x`;
}

/**
 * Format a signed percentage change (e.g. 2.2547 → "+225.47%").
 * Returns "—" for null/undefined.
 */
export function formatChange(
  value: number | null | undefined,
  decimals = 2,
): string {
  if (value === null || value === undefined) return "—";
  if (Number.isNaN(value)) return "—";
  const sign = value > 0 ? "+" : "";
  return `${sign}${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a percentage-point delta. Accepts two fractional ratios
 * (e.g. 0.5761 and 0.2680) and returns "+30.81pp".
 */
export function formatPercentagePoints(
  current: number | null | undefined,
  base: number | null | undefined,
  decimals = 2,
): string {
  if (current === null || current === undefined) return "—";
  if (base === null || base === undefined) return "—";
  const delta = (current - base) * 100;
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(decimals)}pp`;
}
