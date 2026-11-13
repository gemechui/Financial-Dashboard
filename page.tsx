import fs from "node:fs";
import path from "node:path";

import { FinancialDashboard } from "@/components/financial-dashboard";
import type { FinancialData } from "@/lib/financial-types";

const DATA_PATH = path.join(
  process.cwd(),
  "data",
  "financial_data.json",
);

/**
 * Server component entry for the dashboard.
 *
 * Reads the audited financial dataset at build/request time and passes it
 * down to the client-side interactive dashboard. The data file lives outside
 * `public/` so we read it from disk via `fs.readFileSync` rather than fetching.
 */
export default function Home() {
  const raw = fs.readFileSync(DATA_PATH, "utf-8");
  const data = JSON.parse(raw) as FinancialData;

  return <FinancialDashboard data={data} />;
}
