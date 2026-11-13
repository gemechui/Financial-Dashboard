"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  ChevronRight,
  Download,
  FileSpreadsheet,
  FileText,
  Info,
  Landmark,
  Wallet,
  type LucideIcon,
  Minus,
  Receipt,
  Rocket,
  Scale,
  Settings2,
  ShieldAlert,
  Target,
  TrendingDown,
  TrendingUp,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  formatChange,
  formatCompact,
  formatNumber,
  formatPercent,
  formatPercentagePoints,
  formatRatio,
} from "@/lib/format";
import type {
  FinancialData,
  HeadlineFinding,
  Recommendation,
  Severity,
} from "@/lib/financial-types";

/* ------------------------------------------------------------------ */
/*  Small presentational helpers                                       */
/* ------------------------------------------------------------------ */

const NAV_LINKS: { label: string; href: string }[] = [
  { label: "Summary", href: "#summary" },
  { label: "Revenue", href: "#revenue" },
  { label: "Balance Sheet", href: "#balance-sheet" },
  { label: "Liquidity", href: "#liquidity" },
  { label: "Ratios", href: "#ratios" },
  { label: "Growth", href: "#growth" },
  { label: "Recommendations", href: "#recommendations" },
];

const SEVERITY_STYLES: Record<
  Severity,
  { card: string; icon: LucideIcon; iconWrap: string; chip: string }
> = {
  positive: {
    card: "border-l-4 border-l-fin-green bg-fin-green-light/60",
    icon: TrendingUp,
    iconWrap: "bg-fin-green/15 text-fin-green",
    chip: "bg-fin-green/15 text-fin-green border-fin-green/30",
  },
  warning: {
    card: "border-l-4 border-l-fin-amber bg-fin-amber-light/60",
    icon: AlertTriangle,
    iconWrap: "bg-fin-amber/15 text-fin-amber",
    chip: "bg-fin-amber/15 text-fin-amber border-fin-amber/30",
  },
  negative: {
    card: "border-l-4 border-l-fin-red bg-fin-red-light/60",
    icon: TrendingDown,
    iconWrap: "bg-fin-red/15 text-fin-red",
    chip: "bg-fin-red/15 text-fin-red border-fin-red/30",
  },
};

function SectionHeader({
  eyebrow,
  title,
  description,
  icon: Icon,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  icon: LucideIcon;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-navy text-white shadow-sm">
        <Icon className="size-5" />
      </div>
      <div className="space-y-1">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold">
          {eyebrow}
        </p>
        <h2 className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">
            {description}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function ChartCard({
  src,
  alt,
  title,
  caption,
}: {
  src: string;
  alt: string;
  title: string;
  caption?: string;
}) {
  return (
    <Card className="overflow-hidden border-navy/15 shadow-sm">
      <CardHeader className="bg-navy/5 pb-3">
        <CardTitle className="text-base font-semibold text-navy">
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-4">
        <div className="relative w-full overflow-hidden rounded-md bg-white">
          <Image
            src={src}
            alt={alt}
            width={2374}
            height={1297}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="h-auto w-full object-contain"
            priority={false}
          />
        </div>
        {caption ? (
          <p className="mt-2 text-xs text-muted-foreground">{caption}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Severity helpers for ratios                                       */
/* ------------------------------------------------------------------ */

type HealthLevel = "good" | "warn" | "bad" | "neutral";

function cellClass(level: HealthLevel): string {
  switch (level) {
    case "good":
      return "bg-fin-green-light text-fin-green font-semibold";
    case "warn":
      return "bg-fin-amber-light text-fin-amber font-semibold";
    case "bad":
      return "bg-fin-red-light text-fin-red font-semibold";
    default:
      return "";
  }
}

/* ------------------------------------------------------------------ */
/*  KPI Cards in the hero                                             */
/* ------------------------------------------------------------------ */

interface KpiCardProps {
  label: string;
  value: string;
  badge: string;
  badgeTone: "positive" | "negative" | "neutral";
  icon: LucideIcon;
  tooltip: string;
}

function KpiCard({
  label,
  value,
  badge,
  badgeTone,
  icon: Icon,
  tooltip,
}: KpiCardProps) {
  const badgeClass =
    badgeTone === "positive"
      ? "bg-fin-green/15 text-fin-green border-fin-green/30"
      : badgeTone === "negative"
        ? "bg-fin-red/15 text-fin-red border-fin-red/30"
        : "bg-navy/10 text-navy border-navy/20";

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Card className="group relative overflow-hidden border-navy/15 bg-white shadow-sm transition-shadow hover:shadow-md">
          <div className="absolute inset-x-0 top-0 h-1 bg-navy" />
          <CardHeader className="flex flex-row items-start justify-between gap-2 pb-2">
            <div className="space-y-1">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                {label}
              </p>
              <p className="text-2xl font-bold tracking-tight text-navy sm:text-3xl">
                {value}
              </p>
            </div>
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-navy/10 text-navy">
              <Icon className="size-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className={cn("gap-1 px-2 py-0.5 text-xs", badgeClass)}
              >
                {badgeTone === "positive" ? (
                  <ArrowUpRight className="size-3" />
                ) : badgeTone === "negative" ? (
                  <ArrowDownRight className="size-3" />
                ) : (
                  <Minus className="size-3" />
                )}
                {badge}
              </Badge>
              <span className="text-[10px] text-muted-foreground">vs FY23</span>
            </div>
          </CardContent>
        </Card>
      </TooltipTrigger>
      <TooltipContent
        side="bottom"
        className="max-w-xs border-navy/30 bg-white text-foreground shadow-md"
      >
        <p className="text-xs leading-relaxed">{tooltip}</p>
      </TooltipContent>
    </Tooltip>
  );
}

/* ------------------------------------------------------------------ */
/*  Income Statement Table                                            */
/* ------------------------------------------------------------------ */

interface StatementTableProps {
  title: string;
  lineItems: Record<string, number[]>;
  subtotals: Record<string, number[]>;
  fiscalYears: string[];
  periodEnds: string[];
  selectedYearIndex: number;
  subtotalKeys?: string[];
}

function StatementTable({
  title,
  lineItems,
  subtotals,
  fiscalYears,
  periodEnds,
  selectedYearIndex,
  subtotalKeys,
}: StatementTableProps) {
  const subtotalSet = new Set(subtotalKeys ?? Object.keys(subtotals));
  return (
    <Card className="border-navy/15 shadow-sm">
      <CardHeader className="bg-navy/5 pb-2">
        <CardTitle className="text-base font-semibold text-navy">
          {title}
        </CardTitle>
        <CardDescription className="text-xs">
          Period ending {periodEnds.join(" • ")}
        </CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <div className="fin-scroll max-h-[28rem] overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white shadow-[0_1px_0_0_rgba(31,56,100,0.15)]">
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[14rem] text-xs uppercase tracking-wide text-navy">
                  Line item
                </TableHead>
                {fiscalYears.map((fy, i) => (
                  <TableHead
                    key={fy}
                    className={cn(
                      "text-right text-xs uppercase tracking-wide",
                      i === selectedYearIndex
                        ? "bg-gold-light text-navy"
                        : "text-navy",
                    )}
                  >
                    {fy}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(lineItems).map(([name, values]) => (
                <TableRow key={name}>
                  <TableCell className="font-medium text-navy">
                    {name}
                  </TableCell>
                  {values.map((v, i) => (
                    <TableCell
                      key={i}
                      className={cn(
                        "text-right tabular-nums",
                        i === selectedYearIndex
                          ? "bg-gold-light/60 font-semibold text-navy"
                          : "",
                      )}
                    >
                      {formatNumber(v)}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
              {Object.entries(subtotals).map(([name, values]) => {
                const isSubtotal = subtotalSet.has(name);
                return (
                  <TableRow
                    key={name}
                    className={cn(
                      "border-t-2 border-navy/20",
                      isSubtotal ? "bg-fin-green-light/50 font-semibold" : "",
                    )}
                  >
                    <TableCell
                      className={cn(
                        "font-semibold",
                        isSubtotal ? "text-fin-green" : "text-navy",
                      )}
                    >
                      {name}
                    </TableCell>
                    {values.map((v, i) => (
                      <TableCell
                        key={i}
                        className={cn(
                          "text-right tabular-nums",
                          i === selectedYearIndex
                            ? "bg-gold-light font-bold text-navy"
                            : "",
                          isSubtotal ? "font-semibold" : "",
                        )}
                      >
                        {formatNumber(v)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Balance Sheet identity check                                      */
/* ------------------------------------------------------------------ */

function BalanceSheetIdentity({
  totals,
  liabilities,
  equity,
  fiscalYears,
}: {
  totals: number[];
  liabilities: number[];
  equity: number[];
  fiscalYears: string[];
}) {
  return (
    <Card className="border-fin-green/30 bg-fin-green-light/40 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-fin-green">
          <Scale className="size-4" />
          Balance sheet identity check
        </CardTitle>
        <CardDescription className="text-xs">
          Total Assets = Total Liabilities + Total Equity for every fiscal year
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-2">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {fiscalYears.map((fy, i) => {
            const lhs = totals[i];
            const rhs = liabilities[i] + equity[i];
            const matches = Math.abs(lhs - rhs) < 0.01;
            return (
              <div
                key={fy}
                className="flex items-center justify-between rounded-md border border-fin-green/30 bg-white px-3 py-2"
              >
                <div>
                  <p className="text-xs font-semibold text-navy">{fy}</p>
                  <p className="text-[10px] text-muted-foreground">
                    A: {formatCompact(lhs, 2)} • L+E: {formatCompact(rhs, 2)}
                  </p>
                </div>
                {matches ? (
                  <Badge
                    variant="outline"
                    className="border-fin-green/40 bg-fin-green-light text-fin-green"
                  >
                    <CheckCircle2 className="size-3" /> Balanced
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-fin-red/40 bg-fin-red-light text-fin-red"
                  >
                    <AlertTriangle className="size-3" /> Variance
                  </Badge>
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Liquidity KPI mini cards                                          */
/* ------------------------------------------------------------------ */

interface LiquidityKpiProps {
  label: string;
  value: string;
  fy23Value: string;
  trendUp: boolean;
  level: HealthLevel;
  healthyRange: string;
  formula: string;
}

function LiquidityKpi({
  label,
  value,
  fy23Value,
  trendUp,
  level,
  healthyRange,
  formula,
}: LiquidityKpiProps) {
  const levelClass =
    level === "good"
      ? "border-fin-green/40 bg-fin-green-light/50"
      : level === "warn"
        ? "border-fin-amber/40 bg-fin-amber-light/60"
        : "border-fin-red/40 bg-fin-red-light/60";
  const accentClass =
    level === "good"
      ? "text-fin-green"
      : level === "warn"
        ? "text-fin-amber"
        : "text-fin-red";
  return (
    <Card className={cn("border shadow-sm", levelClass)}>
      <CardHeader className="pb-1">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-navy">
            {label}
          </CardTitle>
          <Badge
            variant="outline"
            className={cn(
              "border-current/30 text-[10px]",
              accentClass,
            )}
          >
            Healthy: {healthyRange}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-end justify-between gap-2">
          <div>
            <p className={cn("text-2xl font-bold", accentClass)}>{value}</p>
            <p className="text-[11px] text-muted-foreground">FY2026</p>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {trendUp ? (
              <ArrowUpRight className="size-3 text-fin-green" />
            ) : (
              <ArrowDownRight className="size-3 text-fin-red" />
            )}
            <span>
              FY23: {fy23Value} (
              {trendUp ? "improving" : "deteriorating"})
            </span>
          </div>
        </div>
        <p className="mt-2 text-[10px] italic text-muted-foreground">
          {formula}
        </p>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Ratio category card                                               */
/* ------------------------------------------------------------------ */

interface RatioCategoryCardProps {
  title: string;
  icon: LucideIcon;
  description: string;
  ratios: Record<string, (number | null)[]>;
  fiscalYears: string[];
  /** Per-ratio evaluation rule returning a HealthLevel for the FY26 value. */
  evaluate: (ratioName: string, values: (number | null)[]) => HealthLevel[];
  /** Format override (default: ratio x). */
  format?: (v: number | null | undefined) => string;
}

function RatioCategoryCard({
  title,
  icon: Icon,
  description,
  ratios,
  fiscalYears,
  evaluate,
  format = (v) => formatRatio(v),
}: RatioCategoryCardProps) {
  return (
    <Card className="flex flex-col border-navy/15 shadow-sm">
      <CardHeader className="bg-navy/5 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-navy/10 text-navy">
            <Icon className="size-4" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold text-navy">
              {title}
            </CardTitle>
            <CardDescription className="text-[11px]">
              {description}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="fin-scroll max-h-72 overflow-auto">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-white">
              <TableRow className="hover:bg-transparent">
                <TableHead className="min-w-[10rem] text-[11px] uppercase tracking-wide text-navy">
                  Ratio
                </TableHead>
                {fiscalYears.map((fy) => (
                  <TableHead
                    key={fy}
                    className="text-right text-[11px] uppercase tracking-wide text-navy"
                  >
                    {fy.replace("FY", "’")}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(ratios).map(([name, values]) => {
                const levels = evaluate(name, values);
                return (
                  <TableRow key={name}>
                    <TableCell className="text-xs font-medium text-navy">
                      {name}
                    </TableCell>
                    {values.map((v, i) => (
                      <TableCell
                        key={i}
                        className={cn(
                          "text-right text-xs tabular-nums",
                          cellClass(levels[i]),
                        )}
                      >
                        {v === null || v === undefined
                          ? "—"
                          : format(v)}
                      </TableCell>
                    ))}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Headline finding card                                             */
/* ------------------------------------------------------------------ */

function HeadlineFindingCard({ finding }: { finding: HeadlineFinding }) {
  const style = SEVERITY_STYLES[finding.severity];
  const Icon = style.icon;
  return (
    <Card className={cn("flex flex-col gap-2 shadow-sm", style.card)}>
      <CardHeader className="pb-1">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex size-9 shrink-0 items-center justify-center rounded-lg",
              style.iconWrap,
            )}
          >
            <Icon className="size-4" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Finding {String(finding.id).padStart(2, "0")}
              </span>
              <Badge
                variant="outline"
                className={cn(
                  "px-1.5 py-0 text-[10px] capitalize",
                  style.chip,
                )}
              >
                {finding.severity}
              </Badge>
            </div>
            <CardTitle className="mt-1 text-base font-bold leading-snug text-navy">
              {finding.title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm leading-relaxed text-muted-foreground">
          {finding.detail}
        </p>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Recommendation timeline card                                     */
/* ------------------------------------------------------------------ */

const RECOMMENDATION_ICONS: LucideIcon[] = [
  Wrench, // Immediate
  Settings2, // Short-term
  Target, // Medium-term
  Rocket, // Long-term
];

function RecommendationCard({
  recommendation,
  index,
}: {
  recommendation: Recommendation;
  index: number;
}) {
  const Icon = RECOMMENDATION_ICONS[index % RECOMMENDATION_ICONS.length];
  return (
    <Card className="relative flex h-full flex-col gap-2 border-navy/15 bg-white shadow-sm transition-shadow hover:shadow-md">
      <div className="absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-gold to-navy" />
      <CardHeader className="pl-6 pb-1">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-navy text-white">
            <Icon className="size-4" />
          </div>
          <Badge
            variant="outline"
            className="border-gold/40 bg-gold-light text-gold"
          >
            {recommendation.horizon}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pl-6 pt-1">
        <p className="text-sm leading-relaxed text-foreground">
          {recommendation.action}
        </p>
      </CardContent>
    </Card>
  );
}

/* ------------------------------------------------------------------ */
/*  Sticky top navigation                                            */
/* ------------------------------------------------------------------ */

function StickyNav() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-navy/15 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <div className="flex items-center gap-2">
          <div className="flex size-8 items-center justify-center rounded-md bg-navy text-white">
            <Landmark className="size-4" />
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold uppercase tracking-wider text-navy">
              Financial Statement Deep Analysis
            </p>
            <p className="text-[10px] text-muted-foreground">
              FY2023 – FY2026 (Audited)
            </p>
          </div>
        </div>
        <nav className="flex flex-wrap items-center gap-x-1 gap-y-1">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-2.5 py-1 text-xs font-medium text-navy transition-colors hover:bg-navy-light"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  Hero                                                              */
/* ------------------------------------------------------------------ */

function Hero({ data }: { data: FinancialData }) {
  const revenue = data.income_statement["Total Revenue"];
  const netIncome = data.income_statement_subtotals["Profit after tax (net income)"];
  const grossMargin = data.ratios.profitability["Gross profit margin"];
  const roe = data.ratios.returns["Return on equity (ROE)"];

  const revenueGrowth = (revenue[3] - revenue[0]) / revenue[0];
  const netIncomeGrowth = (netIncome[3] - netIncome[0]) / netIncome[0];
  const grossMarginDeltaPp = (grossMargin[3] - grossMargin[0]) * 100;
  const roeDeltaPp = (roe[3] - roe[0]) * 100;

  return (
    <section
      id="hero"
      className="relative overflow-hidden border-b border-navy/15 bg-gradient-to-br from-navy via-navy to-navy-dark text-white"
    >
      {/* Decorative background pattern */}
      <div className="pointer-events-none absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 size-96 rounded-full bg-gold blur-3xl" />
        <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-fin-green blur-3xl" />
      </div>
      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-4">
            <Badge
              variant="outline"
              className="border-gold/40 bg-gold/10 text-gold-light"
            >
              <Info className="size-3" />
              {data.meta.subtitle}
            </Badge>
            <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
              {data.meta.title}
            </h1>
            <p className="text-sm text-navy-light sm:text-base">
              Prepared by {data.meta.prepared_by} • Report date{" "}
              {data.meta.report_date}
            </p>
            <p className="max-w-2xl text-xs italic text-navy-light/80">
              {data.meta.currency_note}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 text-xs text-navy-light">
            <span className="rounded-full bg-white/10 px-3 py-1">
              Period ends: {data.meta.period_ends.join(" • ")}
            </span>
          </div>
        </div>

        <TooltipProvider delayDuration={150}>
          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Revenue (FY26)"
              value={formatCompact(revenue[3], 1)}
              badge={formatChange(revenueGrowth, 0)}
              badgeTone="positive"
              icon={Receipt}
              tooltip={`Total Revenue = sum of all sales. FY26 ${formatCompact(revenue[3])} vs FY23 ${formatCompact(revenue[0])} → ${(revenueGrowth * 100).toFixed(1)}% absolute increase. 3-year CAGR: ${formatPercent(data.growth.cagr_3yr["Total Revenue"], 1)}.`}
            />
            <KpiCard
              label="Net Income (FY26)"
              value={formatCompact(netIncome[3], 1)}
              badge={formatChange(netIncomeGrowth, 0)}
              badgeTone="positive"
              icon={TrendingUp}
              tooltip={`Net Income = PBT − Provision for Tax. FY26 ${formatCompact(netIncome[3])} vs FY23 ${formatCompact(netIncome[0])} → a 15.4× increase. 3-year CAGR: ${formatPercent(data.growth.cagr_3yr["Net income"], 1)}.`}
            />
            <KpiCard
              label="Gross Margin (FY26)"
              value={formatPercent(grossMargin[3], 1)}
              badge={formatPercentagePoints(grossMargin[3], grossMargin[0], 1)}
              badgeTone="positive"
              icon={TrendingUp}
              tooltip={`Gross Margin = Gross Profit ÷ Revenue. Expanded from ${formatPercent(grossMargin[0], 1)} in FY23 to ${formatPercent(grossMargin[3], 1)} in FY26 — driven by cost-of-sales ratio falling from 68.7% to 42.4%.`}
            />
            <KpiCard
              label="ROE (FY26)"
              value={formatPercent(roe[3], 1)}
              badge={formatPercentagePoints(roe[3], roe[0], 0)}
              badgeTone="positive"
              icon={Target}
              tooltip={`ROE = Net Income ÷ Total Equity. Magnified by equity contraction (owners' drawdown from 29.6M to 14.4M) and new debt. FY23 ${formatPercent(roe[0], 1)} → FY26 ${formatPercent(roe[3], 1)}.`}
            />
          </div>
        </TooltipProvider>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Executive summary section                                         */
/* ------------------------------------------------------------------ */

function ExecutiveSummary({ data }: { data: FinancialData }) {
  return (
    <section id="summary" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <SectionHeader
        eyebrow="Executive Summary"
        title="Headline Findings"
        description="Five takeaways distilled from four years of audited statements, ranked from growth and profitability to capital structure and liquidity."
        icon={Info}
      />
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {data.headline_findings.map((f) => (
          <HeadlineFindingCard key={f.id} finding={f} />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Revenue & profitability section                                  */
/* ------------------------------------------------------------------ */

function RevenueProfitabilitySection({
  data,
  selectedYearIndex,
  onSelectYear,
}: {
  data: FinancialData;
  selectedYearIndex: number;
  onSelectYear: (i: number) => void;
}) {
  const fy = data.meta.fiscal_years;
  return (
    <section
      id="revenue"
      className="border-y border-navy/10 bg-navy-light/30 py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeader
            eyebrow="Section 03"
            title="Revenue & Profitability"
            description="Top-line trajectory, margin progression and the full income statement for the four reporting years."
            icon={Receipt}
          />
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">Highlight year</span>
            <Select
              value={String(selectedYearIndex)}
              onValueChange={(v) => onSelectYear(Number(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {fy.map((label, i) => (
                  <SelectItem key={label} value={String(i)}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard
            title="Revenue, Gross Profit, EBITDA & Net Income"
            src="/charts/chart1_revenue_profitability.png"
            alt="Grouped bar chart of revenue, gross profit, EBITDA and net income across FY23-FY26"
            caption="Source: audited financial statement, FY23–FY26."
          />
          <ChartCard
            title="Margins Trend (Gross / EBITDA / Net)"
            src="/charts/chart2_margins_trend.png"
            alt="Line chart showing gross, EBITDA and net margins trending upward over four years"
            caption="Margins computed against total revenue for each fiscal year."
          />
        </div>

        <div className="mt-6">
          <StatementTable
            title="Income Statement"
            lineItems={data.income_statement}
            subtotals={data.income_statement_subtotals}
            fiscalYears={fy}
            periodEnds={data.meta.period_ends}
            selectedYearIndex={selectedYearIndex}
            subtotalKeys={[
              "Gross profit",
              "EBITDA (source-reported)",
              "Profit before tax (source-reported)",
              "Profit after tax (net income)",
            ]}
          />
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Balance sheet section                                            */
/* ------------------------------------------------------------------ */

function BalanceSheetSection({
  data,
  selectedYearIndex,
}: {
  data: FinancialData;
  selectedYearIndex: number;
}) {
  const fy = data.meta.fiscal_years;
  const subtotals = data.balance_sheet_subtotals;
  return (
    <section id="balance-sheet" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <SectionHeader
        eyebrow="Section 04"
        title="Balance Sheet & Capital Structure"
        description="Asset composition, capital stack, and the full balance sheet with identity verification across all four years."
        icon={Landmark}
      />

      <Tabs defaultValue="chart" className="mt-8">
        <TabsList className="bg-navy/5">
          <TabsTrigger value="chart">Charts</TabsTrigger>
          <TabsTrigger value="table">Statement table</TabsTrigger>
        </TabsList>
        <TabsContent value="chart" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <ChartCard
              title="Asset Composition"
              src="/charts/chart3_asset_composition.png"
              alt="Stacked bar chart showing composition of assets across four fiscal years"
              caption="PP&E + Inventory + Receivables + Cash, by year."
            />
            <ChartCard
              title="Capital Structure (Liabilities vs Equity)"
              src="/charts/chart4_capital_structure.png"
              alt="Stacked bar chart showing liabilities and equity composition across four years"
              caption="FY26 introduces a 21.96M non-current liability."
            />
          </div>
        </TabsContent>
        <TabsContent value="table" className="mt-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <StatementTable
              title="Balance Sheet"
              lineItems={data.balance_sheet}
              subtotals={data.balance_sheet_subtotals}
              fiscalYears={fy}
              periodEnds={data.meta.period_ends}
              selectedYearIndex={selectedYearIndex}
            />
            <div className="space-y-4">
              <StatementTable
                title="Balance Sheet Subtotals"
                lineItems={{}}
                subtotals={subtotals}
                fiscalYears={fy}
                periodEnds={data.meta.period_ends}
                selectedYearIndex={selectedYearIndex}
              />
              <BalanceSheetIdentity
                totals={subtotals["Total assets"]}
                liabilities={subtotals["Total liabilities"]}
                equity={subtotals["Total equity"]}
                fiscalYears={fy}
              />
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="mt-4">
        <BalanceSheetIdentity
          totals={subtotals["Total assets"]}
          liabilities={subtotals["Total liabilities"]}
          equity={subtotals["Total equity"]}
          fiscalYears={fy}
        />
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Liquidity section                                                */
/* ------------------------------------------------------------------ */

function LiquiditySection({ data }: { data: FinancialData }) {
  const liq = data.ratios.liquidity;
  const current = liq["Current ratio (x)"];
  const quick = liq["Quick ratio (x)"];
  const cash = liq["Cash ratio (x)"];

  const liquidityCards: LiquidityKpiProps[] = [
    {
      label: "Current Ratio",
      value: formatRatio(current[3], 2),
      fy23Value: formatRatio(current[0], 2),
      trendUp: false,
      level: "warn",
      healthyRange: "1.5–2.0x",
      formula: "Current Assets ÷ Current Liabilities",
    },
    {
      label: "Quick Ratio",
      value: formatRatio(quick[3], 2),
      fy23Value: formatRatio(quick[0], 2),
      trendUp: false,
      level: "bad",
      healthyRange: "≥ 1.0x",
      formula: "(Current Assets − Inventory) ÷ Current Liabilities",
    },
    {
      label: "Cash Ratio",
      value: formatRatio(cash[3], 2),
      fy23Value: formatRatio(cash[0], 2),
      trendUp: false,
      level: "bad",
      healthyRange: "≥ 0.5x",
      formula: "Cash & Bank Balances ÷ Current Liabilities",
    },
  ];

  return (
    <section
      id="liquidity"
      className="border-y border-navy/10 bg-navy-light/30 py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Section 05"
          title="Liquidity & Solvency"
          description="Short-term obligations coverage and the cash position relative to current liabilities."
          icon={Wallet}
        />

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard
            title="Cash vs Current Liabilities with Current Ratio Overlay"
            src="/charts/chart5_liquidity.png"
            alt="Bar and line combo chart showing cash and current liabilities with current ratio overlay"
            caption="FY26 cash ratio falls to 0.33x — adequate but deteriorating."
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            {liquidityCards.map((c) => (
              <LiquidityKpi key={c.label} {...c} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Ratios section                                                   */
/* ------------------------------------------------------------------ */

function RatiosSection({ data }: { data: FinancialData }) {
  const fy = data.meta.fiscal_years;
  const r = data.ratios;

  /* Per-ratio health evaluation helpers (based on FY26 cell) */
  const profitabilityEval = (_: string, values: (number | null)[]): HealthLevel[] =>
    values.map((v, i) => {
      if (v === null) return "neutral";
      if (i < 3) return "neutral";
      if (v >= 0.3) return "good";
      if (v >= 0.15) return "warn";
      return "bad";
    });
  const profitabilityEvalTax = (_: string, values: (number | null)[]): HealthLevel[] =>
    values.map((v, i) => {
      if (v === null) return "neutral";
      if (i < 3) return "neutral";
      if (v <= 0.25) return "good";
      if (v <= 0.35) return "warn";
      return "neutral";
    });

  const liquidityEval = (_: string, values: (number | null)[]): HealthLevel[] => {
    return values.map((v, i) => {
      if (v === null) return "neutral";
      const factor = i + 1;
      if (factor < 4) return "neutral";
      if (v >= 1.5) return "good";
      if (v >= 1.0) return "warn";
      return "bad";
    });
  };
  const liquidityWorkingCapitalEval = (
    _: string,
    values: (number | null)[],
  ): HealthLevel[] =>
    values.map((v, i) => {
      if (v === null) return "neutral";
      if (i < 3) return "neutral";
      if (v > 0) return "good";
      return "bad";
    });

  const leverageEval = (_: string, values: (number | null)[]): HealthLevel[] =>
    values.map((v, i) => {
      if (v === null) return "neutral";
      if (i < 3) return "neutral";
      if (v <= 1.0) return "good";
      if (v <= 2.0) return "warn";
      return "bad";
    });
  const interestCoverageEval = (
    _: string,
    values: (number | null)[],
  ): HealthLevel[] =>
    values.map((v, i) => {
      if (v === null) return "neutral";
      if (i < 3) return "neutral";
      if (v >= 3) return "good";
      if (v >= 1.5) return "warn";
      return "bad";
    });

  const efficiencyEval = (_: string, values: (number | null)[]): HealthLevel[] =>
    values.map((v, i) => {
      if (v === null) return "neutral";
      if (i < 3) return "neutral";
      return "neutral";
    });

  const returnsEval = (_: string, values: (number | null)[]): HealthLevel[] =>
    values.map((v, i) => {
      if (v === null) return "neutral";
      if (i < 3) return "neutral";
      if (v >= 0.15) return "good";
      if (v >= 0.05) return "warn";
      return "bad";
    });

  // Build per-category evaluation dispatchers
  const profitabilityDispatcher = (name: string, values: (number | null)[]) => {
    if (name === "Effective tax rate") return profitabilityEvalTax(name, values);
    return profitabilityEval(name, values);
  };
  const liquidityDispatcher = (name: string, values: (number | null)[]) => {
    if (name === "Working capital")
      return liquidityWorkingCapitalEval(name, values);
    return liquidityEval(name, values);
  };
  const leverageDispatcher = (name: string, values: (number | null)[]) => {
    if (name.startsWith("Interest coverage"))
      return interestCoverageEval(name, values);
    return leverageEval(name, values);
  };
  const efficiencyDispatcher = (name: string, values: (number | null)[]) => {
    if (name.startsWith("Days")) {
      return values.map((v, i) => {
        if (v === null) return "neutral";
        if (i < 3) return "neutral";
        if (v <= 30) return "good";
        if (v <= 60) return "warn";
        return "bad";
      });
    }
    return efficiencyEval(name, values);
  };

  return (
    <section id="ratios" className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <SectionHeader
        eyebrow="Section 06"
        title="Financial Ratios Dashboard"
        description="Twenty-plus ratios across profitability, liquidity, leverage, efficiency and returns. Heatmap cells are coloured by health band based on FY26 values."
        icon={Scale}
      />

      <div className="mt-8">
        <ChartCard
          title="Ratios Heatmap (10 ratios × 4 years)"
          src="/charts/chart6_ratios_heatmap.png"
          alt="Heatmap matrix of financial ratios across four years"
          caption="Greener = healthier, redder = concern. Use as a quick visual scan of trends."
        />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        <RatioCategoryCard
          title="Profitability"
          description="Margin generation across the income statement"
          icon={TrendingUp}
          ratios={r.profitability}
          fiscalYears={fy}
          evaluate={profitabilityDispatcher}
          format={(v) => formatPercent(v, 2)}
        />
        <RatioCategoryCard
          title="Liquidity"
          description="Short-term obligations coverage"
          icon={Wallet}
          ratios={r.liquidity}
          fiscalYears={fy}
          evaluate={liquidityDispatcher}
          format={(v) => {
            // Working capital is a money figure, others are ratios
            if (v === null || v === undefined) return "—";
            if (Math.abs(v) >= 1000) return formatCompact(v, 1);
            return formatRatio(v, 2);
          }}
        />
        <RatioCategoryCard
          title="Leverage"
          description="Capital structure and debt service capacity"
          icon={ShieldAlert}
          ratios={r.leverage}
          fiscalYears={fy}
          evaluate={leverageDispatcher}
          format={(v) => formatRatio(v, 2)}
        />
        <RatioCategoryCard
          title="Efficiency"
          description="Operational asset utilisation"
          icon={Settings2}
          ratios={r.efficiency}
          fiscalYears={fy}
          evaluate={efficiencyDispatcher}
          format={(v) => {
            if (v === null || v === undefined) return "—";
            if (Math.abs(v) >= 100) return formatNumber(v, 1) + "x";
            return formatRatio(v, 2);
          }}
        />
        <RatioCategoryCard
          title="Returns"
          description="Profitability relative to capital employed"
          icon={Target}
          ratios={r.returns}
          fiscalYears={fy}
          evaluate={returnsEval}
          format={(v) => formatPercent(v, 2)}
        />
        <Card className="flex flex-col justify-between border-navy/15 bg-navy p-5 text-white shadow-sm">
          <div className="flex items-center gap-2">
            <Info className="size-5 text-gold" />
            <p className="text-sm font-semibold">Colour legend</p>
          </div>
          <ul className="mt-3 space-y-1.5 text-xs">
            <li className="flex items-center gap-2">
              <span className="inline-block size-3 rounded-sm bg-fin-green-light" />
              Healthy band
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block size-3 rounded-sm bg-fin-amber-light" />
              Caution / monitor
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block size-3 rounded-sm bg-fin-red-light" />
              Concern / action
            </li>
            <li className="flex items-center gap-2">
              <span className="inline-block size-3 rounded-sm bg-white/20" />
              Historic year (not scored)
            </li>
          </ul>
          <p className="mt-3 text-[10px] italic text-navy-light">
            Thresholds calibrated to standard corporate finance benchmarks.
          </p>
        </Card>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Trend & Growth section                                           */
/* ------------------------------------------------------------------ */

function GrowthSection({ data }: { data: FinancialData }) {
  const fy = data.meta.fiscal_years;
  const indexed = data.growth.indexed_base_100;
  const cagr = data.growth.cagr_3yr;

  const cagrCards = [
    { label: "Revenue", value: cagr["Total Revenue"], icon: Receipt },
    { label: "Net Income", value: cagr["Net income"], icon: TrendingUp },
    { label: "Total Assets", value: cagr["Total assets"], icon: Landmark },
  ];

  return (
    <section
      id="growth"
      className="border-y border-navy/10 bg-navy-light/30 py-12"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHeader
          eyebrow="Section 07"
          title="Trend & Growth Analysis"
          description="Year-on-year growth rates, indexed series (FY23 = 100), 3-year CAGRs and methodology notes."
          icon={TrendingUp}
        />

        <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard
            title="YoY Growth Rates (4 metrics)"
            src="/charts/chart7_yoy_growth.png"
            alt="Bar chart of year-on-year growth rates for revenue, gross profit, EBITDA and net income"
            caption="FY24-FY26 YoY growth percentages."
          />
          <Card className="border-navy/15 shadow-sm">
            <CardHeader className="bg-navy/5 pb-2">
              <CardTitle className="text-base font-semibold text-navy">
                3-Year CAGR Summary
              </CardTitle>
              <CardDescription className="text-xs">
                Compounded annual growth rate FY23 → FY26
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {cagrCards.map((c) => (
                  <div
                    key={c.label}
                    className="rounded-lg border border-navy/15 bg-white p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {c.label}
                      </p>
                      <c.icon className="size-4 text-navy" />
                    </div>
                    <p
                      className={cn(
                        "mt-1 text-2xl font-bold",
                        c.value >= 0 ? "text-fin-green" : "text-fin-red",
                      )}
                    >
                      {formatPercent(c.value, 1)}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      per annum
                    </p>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <ul className="space-y-1 text-xs text-muted-foreground">
                <li>
                  <strong className="text-navy">Net income</strong> grew fastest
                  (CAGR {formatPercent(cagr["Net income"], 1)}) — driven by the
                  FY26 margin breakthrough.
                </li>
                <li>
                  <strong className="text-navy">Equity</strong> shrank at{" "}
                  {formatPercent(cagr["Total equity"], 1)} CAGR due to owners'
                  account drawdowns.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6 border-navy/15 shadow-sm">
          <CardHeader className="bg-navy/5 pb-2">
            <CardTitle className="text-base font-semibold text-navy">
              Indexed Series (FY23 = 100)
            </CardTitle>
            <CardDescription className="text-xs">
              Relative growth trajectory of each metric
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="fin-scroll max-h-96 overflow-auto">
              <Table>
                <TableHeader className="sticky top-0 z-10 bg-white">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="min-w-[12rem] text-xs uppercase tracking-wide text-navy">
                      Metric
                    </TableHead>
                    {fy.map((y) => (
                      <TableHead
                        key={y}
                        className="text-right text-xs uppercase tracking-wide text-navy"
                      >
                        {y}
                      </TableHead>
                    ))}
                    <TableHead className="text-right text-xs uppercase tracking-wide text-navy">
                      3yr total Δ
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Object.entries(indexed).map(([metric, values]) => {
                    const totalChangeKey =
                      metric === "Revenue" ? "Total Revenue" : metric;
                    const totalChange = data.growth.total_change_pct[totalChangeKey];
                    return (
                      <TableRow key={metric}>
                        <TableCell className="font-medium text-navy">
                          {metric}
                        </TableCell>
                        {values.map((v, i) => (
                          <TableCell
                            key={i}
                            className={cn(
                              "text-right tabular-nums",
                              i === 0
                                ? "bg-navy-light/50 font-semibold text-navy"
                                : v >= 200
                                  ? "bg-fin-green-light/40 font-medium"
                                  : v < 100
                                    ? "bg-fin-red-light/30 font-medium"
                                    : "",
                            )}
                          >
                            {v.toFixed(1)}
                          </TableCell>
                        ))}
                        <TableCell
                          className={cn(
                            "text-right font-semibold tabular-nums",
                            totalChange >= 0
                              ? "text-fin-green"
                              : "text-fin-red",
                          )}
                        >
                          {totalChange >= 0 ? "+" : ""}
                          {(totalChange * 100).toFixed(1)}%
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="mt-6 border-gold/30 bg-gold-light/40 shadow-sm">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Info className="size-4 text-gold" />
              <CardTitle className="text-base font-semibold text-navy">
                Methodology Notes
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <ol className="space-y-2 text-sm text-foreground">
              {data.methodology_notes.map((note, i) => (
                <li key={i} className="flex gap-2">
                  <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-gold/20 text-[11px] font-bold text-gold">
                    {i + 1}
                  </span>
                  <span className="leading-relaxed text-foreground/90">
                    {note}
                  </span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Recommendations section                                          */
/* ------------------------------------------------------------------ */

function RecommendationsSection({ data }: { data: FinancialData }) {
  return (
    <section
      id="recommendations"
      className="mx-auto max-w-7xl px-4 py-12 sm:px-6"
    >
      <SectionHeader
        eyebrow="Section 08"
        title="Recommendations"
        description="Time-phased action plan from immediate validation to long-term capital strategy."
        icon={Target}
      />
      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {data.recommendations.map((rec, i) => (
          <RecommendationCard
            key={rec.horizon}
            recommendation={rec}
            index={i}
          />
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/*  Footer                                                           */
/* ------------------------------------------------------------------ */

function Footer() {
  return (
    <footer className="mt-auto border-t border-navy/15 bg-navy text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Landmark className="size-5 text-gold" />
              <p className="text-sm font-semibold">
                Financial Statement Deep Analysis
              </p>
            </div>
            <p className="text-xs text-navy-light">
              Prepared by Z.ai Analytics • Report date 13 November 2026
            </p>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-light">
              Download
            </p>
            <div className="flex flex-wrap gap-2">
              <a
                href="/downloads/Financial_Analysis_FY2023-FY2026.xlsx"
                className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
              >
                <FileSpreadsheet className="size-3.5" />
                Excel workbook
                <ChevronRight className="size-3 opacity-60" />
              </a>
              <a
                href="/downloads/Financial_Analysis_Report_FY2023-FY2026.pdf"
                className="inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-white/20"
              >
                <FileText className="size-3.5" />
                PDF report
                <ChevronRight className="size-3 opacity-60" />
              </a>
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-gold-light">
              Disclaimer
            </p>
            <p className="text-xs leading-relaxed text-navy-light">
              This dashboard is for analytical purposes only. All figures
              sourced from audited financial statement. Currency unit
              unspecified. See PDF report for full methodology and disclaimer.
            </p>
          </div>
        </div>
        <Separator className="my-6 bg-white/10" />
        <div className="flex flex-col items-start justify-between gap-2 sm:flex-row sm:items-center">
          <p className="text-[11px] text-navy-light">
            © {new Date().getFullYear()} Z.ai Analytics. All rights reserved.
          </p>
          <p className="inline-flex items-center gap-1 text-[11px] text-navy-light">
            <Download className="size-3" />
            Source: audited financial statement image (user-uploaded)
          </p>
        </div>
      </div>
    </footer>
  );
}

/* ------------------------------------------------------------------ */
/*  Main dashboard                                                   */
/* ------------------------------------------------------------------ */

export function FinancialDashboard({ data }: { data: FinancialData }) {
  const [selectedYearIndex, setSelectedYearIndex] = useState(3); // default FY26
  const memoizedData = useMemo(() => data, [data]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <StickyNav />
      <main className="flex-1">
        <Hero data={memoizedData} />
        <ExecutiveSummary data={memoizedData} />
        <RevenueProfitabilitySection
          data={memoizedData}
          selectedYearIndex={selectedYearIndex}
          onSelectYear={setSelectedYearIndex}
        />
        <BalanceSheetSection
          data={memoizedData}
          selectedYearIndex={selectedYearIndex}
        />
        <LiquiditySection data={memoizedData} />
        <RatiosSection data={memoizedData} />
        <GrowthSection data={memoizedData} />
        <RecommendationsSection data={memoizedData} />
      </main>
      <Footer />
    </div>
  );
}
