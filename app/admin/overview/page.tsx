'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Sparkles,
  Activity,
  Calendar,
  ChevronDown,
  Info,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';
import { fetchAdminOverview } from '../../../lib/api/admin';
import { AdminOverviewResponse } from '../../../lib/types/admin';

// Charts draw in a 260x120 viewBox: x from 10 to 250, y from 110 (zero) to 10 (max).
const DONUT_CIRCUMFERENCE = 2 * Math.PI * 38;

function niceMax(value: number): number {
  if (value <= 0) return 4;
  const step = 10 ** Math.floor(Math.log10(value));
  return Math.ceil(value / step) * step;
}

function compact(n: number): string {
  return Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

function axisTicks(max: number): string[] {
  return [4, 3, 2, 1, 0].map((i) => compact((max * i) / 4));
}

function point(values: number[], i: number, max: number) {
  const x = values.length > 1 ? 10 + (240 * i) / (values.length - 1) : 250;
  return { x, y: 110 - (values[i] / max) * 100 };
}

function linePath(values: number[], max: number): string {
  return values
    .map((_, i) => {
      const { x, y } = point(values, i, max);
      return `${i ? 'L' : 'M'} ${x} ${y}`;
    })
    .join(' ');
}

function lastPoint(values: number[], max: number) {
  return point(values, values.length - 1, max);
}

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchAdminOverview();
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load overview data');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (!loading && !data) {
    return <p className="py-16 text-center text-sm text-ink-muted">{error}</p>;
  }

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-trend-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { kpis, alerts, system_status, user_growth, mrr_evolution, subscription_distribution } =
    data;
  const timeRange = `${user_growth.labels[0]} - ${user_growth.labels[user_growth.labels.length - 1]}`;
  const usersMax = niceMax(Math.max(...user_growth.total_users, ...user_growth.active_users));
  const mrrMax = niceMax(Math.max(...mrr_evolution.values));
  const mrrLine = linePath(mrr_evolution.values, mrrMax);
  const mrrLast = lastPoint(mrr_evolution.values, mrrMax);
  const usersLast = lastPoint(user_growth.total_users, usersMax);
  const distTotal = subscription_distribution.reduce((sum, d) => sum + d.count, 0);
  const donutLens = subscription_distribution.map((d) =>
    distTotal ? (d.count / distTotal) * DONUT_CIRCUMFERENCE : 0,
  );

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* HEADER SECTION */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-ink">
            Admin Overview
          </h1>
          <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
            System performance and key metrics at a glance.
          </p>
        </div>

        {/* Date Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 bg-studio-ground rounded-xl border border-line/90 shadow-2xs hover:bg-studio-surface text-xs font-medium text-ink-soft transition"
          >
            <Calendar className="w-3.5 h-3.5 text-ink-muted" />
            <span>{timeRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-ink-muted ml-1" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6 TOP KPI CARDS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Total users */}
        <div className="bg-studio-ground rounded-2xl border border-line/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="text-xs text-ink-muted font-medium">Total users</div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl font-bold text-ink">
                {kpis.total_users.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-success flex items-center">
                <ArrowUpRight className="w-3 h-3 inline" />
                {kpis.total_users_change}%
              </span>
            </div>
            <p className="text-[10px] text-ink-muted mt-1 truncate">{kpis.comparison_period}</p>
          </div>
        </div>

        {/* 2. Active users */}
        <div className="bg-studio-ground rounded-2xl border border-line/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted font-medium">
            <Users className="w-3.5 h-3.5 text-ink-muted" />
            <span>Active users</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl font-bold text-ink">
                {kpis.active_users.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-success flex items-center">
                <ArrowUpRight className="w-3 h-3 inline" />
                {kpis.active_users_change}%
              </span>
            </div>
            <p className="text-[10px] text-ink-muted mt-1 truncate">{kpis.comparison_period}</p>
          </div>
        </div>

        {/* 3. MRR */}
        <div className="bg-studio-ground rounded-2xl border border-line/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="text-xs text-ink-muted font-medium">MRR</div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl font-bold text-ink">${kpis.mrr.toLocaleString()}</span>
              <span className="text-[11px] font-semibold text-success flex items-center">
                <ArrowUpRight className="w-3 h-3 inline" />
                {kpis.mrr_change}%
              </span>
            </div>
            <p className="text-[10px] text-ink-muted mt-1 truncate">{kpis.comparison_period}</p>
          </div>
        </div>

        {/* 4. New subscriptions */}
        <div className="bg-studio-ground rounded-2xl border border-line/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="text-xs text-ink-muted font-medium">New subscriptions</div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl font-bold text-ink">
                {kpis.new_subscriptions.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-success flex items-center">
                <ArrowUpRight className="w-3 h-3 inline" />
                {kpis.new_subscriptions_change}%
              </span>
            </div>
            <p className="text-[10px] text-ink-muted mt-1 truncate">{kpis.comparison_period}</p>
          </div>
        </div>

        {/* 5. AI generations */}
        <div className="bg-studio-ground rounded-2xl border border-line/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted font-medium">
            <Sparkles className="w-3.5 h-3.5 text-ink-muted" />
            <span>AI generations</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl font-bold text-ink">
                {kpis.ai_generations.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-success flex items-center">
                <ArrowUpRight className="w-3 h-3 inline" />
                {kpis.ai_generations_change}%
              </span>
            </div>
            <p className="text-[10px] text-ink-muted mt-1 truncate">{kpis.comparison_period}</p>
          </div>
        </div>

        {/* 6. System health */}
        <div className="bg-studio-ground rounded-2xl border border-line/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-ink-muted font-medium">
            <Activity className="w-3.5 h-3.5 text-success" />
            <span>System health</span>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-success">Healthy</span>
            <p className="text-[10px] text-ink-muted mt-1 truncate">All systems operational</p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3 MIDDLE CARDS: USER GROWTH, MRR, SUBSCRIPTION DISTRIBUTION */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CARD 1: User growth (5 cols) */}
        <div className="lg:col-span-4 bg-studio-ground rounded-2xl border border-line/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-bold text-ink">User growth</h2>
                <Info className="w-3.5 h-3.5 text-ink-muted cursor-pointer" />
              </div>
              <button
                type="button"
                className="flex items-center gap-1 text-[11px] text-ink-muted bg-studio-surface px-2 py-1 rounded-lg border border-line/70"
              >
                <span>Daily</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3">
              <p className="text-2xl font-bold text-ink tracking-tight">
                {kpis.total_users.toLocaleString()}
              </p>
              <div className="flex items-center gap-4 mt-1 text-[11px] text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-trend-orange inline-block rounded-full" />
                  Total users
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t border-dashed border-trend-gold inline-block" />
                  Active users
                </span>
              </div>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="pt-4">
            <div className="flex">
              {/* Y Axis labels */}
              <div className="flex flex-col justify-between text-[9px] text-ink-muted font-mono pr-2 h-36 select-none">
                {axisTicks(usersMax).map((t, i) => (
                  <span key={i}>{t}</span>
                ))}
              </div>

              {/* Chart canvas */}
              <div className="relative flex-1 h-36">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-line w-full" />
                  <div className="border-b border-line w-full" />
                  <div className="border-b border-line w-full" />
                  <div className="border-b border-line w-full" />
                  <div className="border-b border-line w-full" />
                </div>

                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 260 120"
                  preserveAspectRatio="none"
                >
                  {/* Total users line */}
                  <path
                    d={linePath(user_growth.total_users, usersMax)}
                    fill="none"
                    stroke="var(--color-trend-orange)"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <circle
                    cx={usersLast.x}
                    cy={usersLast.y}
                    r="3.5"
                    fill="var(--color-trend-orange)"
                  />

                  {/* Active users dashed line */}
                  <path
                    d={linePath(user_growth.active_users, usersMax)}
                    fill="none"
                    stroke="var(--color-trend-gold)"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* X Axis dates */}
            <div className="flex justify-between pl-6 pt-2 text-[9px] text-ink-muted font-mono">
              {user_growth.labels.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 2: MRR evolution (4 cols) */}
        <div className="lg:col-span-4 bg-studio-ground rounded-2xl border border-line/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-line">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-bold text-ink">MRR evolution</h2>
                <Info className="w-3.5 h-3.5 text-ink-muted cursor-pointer" />
              </div>
              <button
                type="button"
                className="flex items-center gap-1 text-[11px] text-ink-muted bg-studio-surface px-2 py-1 rounded-lg border border-line/70"
              >
                <span>Monthly</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3">
              <p className="text-2xl font-bold text-ink tracking-tight">
                ${kpis.mrr.toLocaleString()}
              </p>
            </div>
          </div>

          {/* SVG Smooth Area Chart */}
          <div className="pt-4">
            <div className="flex">
              {/* Y Axis labels */}
              <div className="flex flex-col justify-between text-[9px] text-ink-muted font-mono pr-2 h-36 select-none">
                {axisTicks(mrrMax).map((t, i) => (
                  <span key={i}>{t}</span>
                ))}
              </div>

              {/* Chart canvas */}
              <div className="relative flex-1 h-36">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-line w-full" />
                  <div className="border-b border-line w-full" />
                  <div className="border-b border-line w-full" />
                  <div className="border-b border-line w-full" />
                  <div className="border-b border-line w-full" />
                </div>

                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 260 120"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="var(--color-trend-orange)" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="var(--color-trend-orange)" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area */}
                  <path d={`${mrrLine} L 250 110 L 10 110 Z`} fill="url(#mrrGradient)" />

                  {/* Top curve */}
                  <path
                    d={mrrLine}
                    fill="none"
                    stroke="var(--color-trend-orange)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx={mrrLast.x} cy={mrrLast.y} r="3.5" fill="var(--color-trend-orange)" />
                </svg>
              </div>
            </div>

            {/* X Axis dates */}
            <div className="flex justify-between pl-7 pt-2 text-[9px] text-ink-muted font-mono">
              {mrr_evolution.labels.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </div>
          </div>
        </div>

        {/* CARD 3: Subscription distribution (4 cols) */}
        <div className="lg:col-span-4 bg-studio-ground rounded-2xl border border-line/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-line">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-ink">Subscription distribution</h2>
              <Info className="w-3.5 h-3.5 text-ink-muted cursor-pointer" />
            </div>
            <button
              type="button"
              className="flex items-center gap-1 text-[11px] text-ink-muted bg-studio-surface px-2 py-1 rounded-lg border border-line/70"
            >
              <span>By plan</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          {/* Donut Chart & Breakdown */}
          <div className="flex items-center justify-between gap-4 py-4">
            {/* SVG Donut */}
            <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {subscription_distribution.map((d, i) => {
                  const len = donutLens[i];
                  return (
                    <circle
                      key={d.plan}
                      cx="50"
                      cy="50"
                      r="38"
                      fill="transparent"
                      stroke={d.color}
                      strokeWidth="16"
                      strokeDasharray={`${len} ${DONUT_CIRCUMFERENCE - len}`}
                      strokeDashoffset={-donutLens.slice(0, i).reduce((a, b) => a + b, 0)}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-ink-muted uppercase font-semibold">Total</span>
                <span className="text-sm font-bold text-ink">{distTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Legend & Percentages */}
            <div className="flex-1 space-y-2 text-xs">
              {subscription_distribution.map((d) => (
                <div key={d.plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: d.color }} />
                    <span className="font-medium text-ink">{d.plan}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-ink">{d.percentage}%</span>
                    <p className="text-[10px] text-ink-muted">{d.count.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-line flex justify-between text-xs">
            <span className="font-semibold text-ink-soft">Total accounts</span>
            <span className="font-bold text-ink">{distTotal.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2 BOTTOM CARDS: ALERTS & SYSTEM STATUS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="alerts">
        {/* Left: Alerts Card (7 cols) */}
        <div className="lg:col-span-7 bg-studio-ground rounded-2xl border border-line/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-ink">Alerts</h2>
                <span className="px-2 py-0.5 rounded-full bg-danger-soft text-danger text-xs font-bold">
                  {alerts.length}
                </span>
              </div>
              <Link
                href="/admin/system-logs?severity=Error"
                className="text-xs font-medium text-ink-muted hover:text-ink flex items-center gap-1 transition"
              >
                <span>View all alerts</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            <div className="divide-y divide-line mt-1">
              {alerts.length === 0 && (
                <p className="py-8 text-center text-xs text-ink-muted">
                  No alerts in the last 7 days.
                </p>
              )}
              {alerts.map((alert) => {
                const isError = alert.severity === 'error';
                return (
                  <div
                    key={alert.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-studio-surface/70 px-2 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                          isError ? 'bg-danger-soft text-danger' : 'bg-warning-soft text-warning'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mr-2 ${
                            isError
                              ? 'bg-danger-soft/70 text-danger'
                              : 'bg-warning-soft/70 text-warning'
                          }`}
                        >
                          {alert.type}
                        </span>
                        <span className="text-ink-soft truncate">{alert.message}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-ink-muted">{alert.time_ago}</span>
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-lg border border-line text-[11px] font-medium text-ink-soft hover:bg-studio-raised transition"
                      >
                        View
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right: System status (5 cols) */}
        <div className="lg:col-span-5 bg-studio-ground rounded-2xl border border-line/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-line">
              <h2 className="text-sm font-bold text-ink">System status</h2>
              <Link
                href="/admin/system-logs"
                className="text-xs font-medium text-ink-muted hover:text-ink flex items-center gap-1 transition"
              >
                <span>View all systems</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            <div className="divide-y divide-line mt-1">
              {system_status.map((item) => (
                <div
                  key={item.name}
                  className="py-3 flex items-center justify-between text-xs hover:bg-studio-surface/70 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-success ring-3 ring-success/30 shrink-0" />
                    <span className="font-medium text-ink">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-ink-muted">{item.status}</span>
                    <span className="text-[11px] font-mono font-semibold text-success w-12 text-right">
                      {item.uptime_percentage}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SYSTEM TIME & VERSION FOOTER (Matching Figma) */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-ink-muted pt-2 px-1 gap-2">
        <span>System time: {data.system_time}</span>
        <span>Version: {data.version}</span>
      </div>
    </div>
  );
}
