/**
 * Type definitions for the audited financial dataset that powers the dashboard.
 * Mirrors the structure of /download/financial_data.json.
 */

export type Severity = "positive" | "warning" | "negative";

export interface FinancialMeta {
  title: string;
  subtitle: string;
  period_ends: string[];
  fiscal_years: string[];
  currency_note: string;
  source: string;
  report_date: string;
  prepared_by: string;
}

export interface HeadlineFinding {
  id: number;
  title: string;
  detail: string;
  severity: Severity;
}

export interface Recommendation {
  horizon: string;
  action: string;
}

/** A ratio category contains an ordered map of ratio name → yearly values. */
export type RatioCategory = Record<string, (number | null)[]>;

export interface Ratios {
  profitability: RatioCategory;
  liquidity: RatioCategory;
  leverage: RatioCategory;
  efficiency: RatioCategory;
  returns: RatioCategory;
}

export interface Growth {
  yoy: Record<string, (number | null)[]>;
  cagr_3yr: Record<string, number>;
  total_change_pct: Record<string, number>;
  indexed_base_100: Record<string, number[]>;
}

export interface FinancialData {
  meta: FinancialMeta;
  balance_sheet: Record<string, number[]>;
  balance_sheet_subtotals: Record<string, number[]>;
  income_statement: Record<string, number[]>;
  income_statement_subtotals: Record<string, number[]>;
  methodology_notes: string[];
  ratios: Ratios;
  growth: Growth;
  headline_findings: HeadlineFinding[];
  recommendations: Recommendation[];
}
