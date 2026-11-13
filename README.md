# Financial Statement Deep Analysis — Deployable Next.js App

A single-page interactive financial dashboard built with **Next.js 16**, **React 19**, **TypeScript 5**, **Tailwind CSS 4**, and **shadcn/ui**.

It visualizes audited financial statement data spanning **FY2023 – FY2026** (four fiscal years ending 7 July) with 7 embedded charts, 9 dashboard sections, KPI cards, ratio tables, growth analysis, and recommendations.

---

## Quick Start

### Prerequisites

- **Node.js 18.18+** (or **Bun 1.1+**) installed on your machine.
- ~500 MB free disk space for `node_modules`.

### Option A — Using Bun (recommended, faster)

```bash
# 1. Unzip the package
unzip financial-dashboard.zip
cd financial-dashboard

# 2. Install dependencies
bun install

# 3. Start the dev server
bun run dev
```

Open <http://localhost:3000> in your browser.

### Option B — Using npm / pnpm / yarn

```bash
# 1. Unzip the package
unzip financial-dashboard.zip
cd financial-dashboard

# 2. Install dependencies (npm works, but Bun is recommended)
npm install
# or: pnpm install
# or: yarn install

# 3. Start the dev server
npm run dev
# or: pnpm dev
# or: yarn dev
```

Open <http://localhost:3000> in your browser.

---

## Production Build

### Using Bun

```bash
bun run build
bun run start
```

### Using npm

```bash
npm run build
npm run start
```

The production server starts on **port 3000** by default. Override with `PORT=8080 npm run start` if needed.

---

## Deploying to Hosting Platforms

### Vercel (easiest — Next.js native)

1. Create an account at <https://vercel.com> if you don't have one.
2. Install the Vercel CLI: `npm i -g vercel`.
3. From the project root, run:
   ```bash
   vercel
   ```
4. Accept the defaults. Vercel detects Next.js automatically and configures everything.
5. For production: `vercel --prod`.

Alternative: Push the project to a GitHub repo and import it via the Vercel dashboard — Vercel will build and deploy automatically on every push.

### Netlify

1. Create an account at <https://netlify.com>.
2. Install the Netlify CLI: `npm i -g netlify-cli`.
3. From the project root:
   ```bash
   netlify deploy
   ```
4. Build command: `npm run build` (or `bun run build`).
5. Publish directory: `.next/standalone` (the project's `next.config.ts` already sets `output: "standalone"`).

### Docker

Create a `Dockerfile` in the project root:

```dockerfile
FROM oven/bun:1.1 AS base
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "start"]
```

Build & run:

```bash
docker build -t financial-dashboard .
docker run -p 3000:3000 financial-dashboard
```

### Self-hosted (VPS / dedicated server)

1. Clone/copy the project to your server.
2. Install dependencies: `bun install` (or `npm install`).
3. Build: `bun run build` (or `npm run build`).
4. Start the production server: `bun run start` (or `npm run start`).
5. Put a reverse proxy (Nginx, Caddy) in front of port 3000 to handle TLS and serve on port 80/443.

Example Caddyfile:

```caddy
example.com {
    reverse_proxy localhost:3000
}
```

Example Nginx config:

```nginx
server {
    listen 80;
    server_name example.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## Project Structure

```
financial-dashboard/
├── data/
│   └── financial_data.json         # Source data (consumed at build time)
├── public/
│   ├── charts/                     # 7 pre-generated PNG charts
│   │   ├── chart1_revenue_profitability.png
│   │   ├── chart2_margins_trend.png
│   │   ├── chart3_asset_composition.png
│   │   ├── chart4_capital_structure.png
│   │   ├── chart5_liquidity.png
│   │   ├── chart6_ratios_heatmap.png
│   │   └── chart7_yoy_growth.png
│   └── downloads/                  # Excel & PDF deliverables
│       ├── Financial_Analysis_FY2023-FY2026.xlsx
│       └── Financial_Analysis_Report_FY2023-FY2026.pdf
├── src/
│   ├── app/
│   │   ├── globals.css             # Tailwind + theme palette
│   │   ├── layout.tsx              # Root layout & metadata
│   │   └── page.tsx                # Server component: reads JSON, renders dashboard
│   ├── components/
│   │   ├── ui/                     # shadcn/ui components
│   │   └── financial-dashboard.tsx  # Main client dashboard (~1,700 lines)
│   └── lib/
│       ├── financial-types.ts      # TypeScript types for the data
│       ├── format.ts               # Number/percent/ratio formatters
│       ├── utils.ts                # cn() helper
│       └── db.ts                   # Prisma client (unused by dashboard)
├── prisma/
│   └── schema.prisma                # SQLite schema (unused by dashboard, kept for compatibility)
├── package.json
├── bun.lock
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.mjs
├── components.json
├── eslint.config.mjs
├── .env.example
└── README.md                       # This file
```

---

## Dashboard Sections

1. **Hero** — Report title, 4 KPI cards (Revenue, Net Income, Gross Margin, ROE) with hover tooltips
2. **Executive Summary** — 5 headline findings color-coded by severity (positive/warning/negative)
3. **Revenue & Profitability** — Charts 1 & 2 + Income Statement table with year selector
4. **Balance Sheet & Capital Structure** — Charts 3 & 4 + Tabs (charts/statement) + balance identity check
5. **Liquidity & Solvency** — Chart 5 + 3 ratio mini-cards with health bands
6. **Financial Ratios Dashboard** — Chart 6 heatmap + 5 ratio category cards
7. **Trend & Growth Analysis** — Chart 7 + 3 CAGR cards + indexed series table + methodology callout
8. **Recommendations** — 4 timeline cards (Immediate / Short-term / Medium-term / Long-term)
9. **Footer** — Disclaimer + Excel/PDF download buttons

---

## Environment Variables

The app reads one environment variable:

```
DATABASE_URL=file:./db/custom.db
```

This is **only used by Prisma**, which the dashboard itself does not invoke. You can:
- Leave it as-is (a SQLite file will be created on first `prisma db push` — harmless if you never run it).
- Remove the `prisma` and `@prisma/client` dependencies from `package.json` if you want a leaner deployment.

To customize, copy `.env.example` to `.env` and edit:

```bash
cp .env.example .env
```

---

## Customizing the Data

To visualize your own financial data, edit `data/financial_data.json`. The schema is:

```jsonc
{
  "meta": { "title": "...", "fiscal_years": ["FY2023", ...], ... },
  "balance_sheet": { "Line item": [4 yearly values], ... },
  "balance_sheet_subtotals": { ... },
  "income_statement": { ... },
  "income_statement_subtotals": { ... },
  "methodology_notes": ["...", ...],
  "ratios": {
    "profitability": { "Ratio name": [4 values], ... },
    "liquidity": { ... }, "leverage": { ... },
    "efficiency": { ... }, "returns": { ... }
  },
  "growth": {
    "yoy": { "Metric": [null, rate, rate, rate], ... },
    "cagr_3yr": { "Metric": rate, ... },
    "total_change_pct": { "Metric": rate, ... },
    "indexed_base_100": { "Metric": [100, idx, idx, idx], ... }
  },
  "headline_findings": [
    { "id": 1, "title": "...", "detail": "...", "severity": "positive|warning|negative" }
  ],
  "recommendations": [
    { "horizon": "Immediate (0-3 months)", "action": "..." }
  ]
}
```

After editing, restart the dev server (or rebuild for production) — the dashboard reads the JSON fresh on every server-side render.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19 + shadcn/ui (New York) |
| Styling | Tailwind CSS 4 |
| Icons | Lucide React |
| Charts | Pre-generated PNG (no client chart library — keeps bundle small) |
| Database | Prisma ORM with SQLite (unused by dashboard, kept for compatibility) |

---

## Troubleshooting

**`bun install` fails**: try `npm install` instead. Bun is faster but npm is more universally compatible.

**Port 3000 already in use**: change the port with `bun run dev -- -p 3001` (or `npm run dev -- -p 3001`).

**`fs.readFileSync` error in production**: ensure the `data/financial_data.json` file is included in your deployment. Some platforms (Vercel, Netlify) include everything by default; if you use Docker, make sure the `COPY . .` step grabs the `data/` folder.

**Lint errors**: run `bun run lint` (or `npm run lint`) — the project currently passes lint with 0 errors.

---

## License & Attribution

- Data source: User-provided audited financial statement image (FY2023 – FY2026).
- Charts and Excel workbook generated with Python (matplotlib + openpyxl).
- PDF report generated with ReportLab.
- Dashboard built by **Z.ai Analytics** on 13 November 2026.

For questions about the analysis methodology, see the embedded PDF report in `public/downloads/`.
