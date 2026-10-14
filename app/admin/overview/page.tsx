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

export default function AdminOverviewPage() {
  const [data, setData] = useState<AdminOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange] = useState('May 11 - May 17, 2025');

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetchAdminOverview();
        setData(res);
      } catch (err) {
        console.error('Failed to load overview data', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-[#EA580C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { kpis, alerts, system_status } = data;

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* HEADER SECTION */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-zinc-900">
            Admin Overview
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            System performance and key metrics at a glance.
          </p>
        </div>

        {/* Date Filter Dropdown */}
        <div className="relative">
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-zinc-200/90 shadow-2xs hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition"
          >
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>{timeRange}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-1" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 6 TOP KPI CARDS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* 1. Total users */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="text-xs text-zinc-500 font-medium">Total users</div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl font-bold text-zinc-900">
                {kpis.total_users.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 inline" />
                {kpis.total_users_change}%
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 truncate">{kpis.comparison_period}</p>
          </div>
        </div>

        {/* 2. Active users */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <Users className="w-3.5 h-3.5 text-zinc-400" />
            <span>Active users</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl font-bold text-zinc-900">
                {kpis.active_users.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 inline" />
                {kpis.active_users_change}%
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 truncate">{kpis.comparison_period}</p>
          </div>
        </div>

        {/* 3. MRR */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="text-xs text-zinc-500 font-medium">MRR</div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl font-bold text-zinc-900">${kpis.mrr.toLocaleString()}</span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 inline" />
                {kpis.mrr_change}%
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 truncate">{kpis.comparison_period}</p>
          </div>
        </div>

        {/* 4. New subscriptions */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="text-xs text-zinc-500 font-medium">New subscriptions</div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl font-bold text-zinc-900">
                {kpis.new_subscriptions.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 inline" />
                {kpis.new_subscriptions_change}%
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 truncate">{kpis.comparison_period}</p>
          </div>
        </div>

        {/* 5. AI generations */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
            <span>AI generations</span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xl font-bold text-zinc-900">
                {kpis.ai_generations.toLocaleString()}
              </span>
              <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                <ArrowUpRight className="w-3 h-3 inline" />
                {kpis.ai_generations_change}%
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-1 truncate">{kpis.comparison_period}</p>
          </div>
        </div>

        {/* 6. System health */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-medium">
            <Activity className="w-3.5 h-3.5 text-emerald-500" />
            <span>System health</span>
          </div>
          <div className="mt-2">
            <span className="text-xl font-bold text-emerald-600">Healthy</span>
            <p className="text-[10px] text-zinc-400 mt-1 truncate">All systems operational</p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3 MIDDLE CARDS: USER GROWTH, MRR, SUBSCRIPTION DISTRIBUTION */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* CARD 1: User growth (5 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-bold text-zinc-900">User growth</h2>
                <Info className="w-3.5 h-3.5 text-zinc-400 cursor-pointer" />
              </div>
              <button
                type="button"
                className="flex items-center gap-1 text-[11px] text-zinc-500 bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-200/70"
              >
                <span>Daily</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3">
              <p className="text-2xl font-bold text-zinc-900 tracking-tight">18,752</p>
              <div className="flex items-center gap-4 mt-1 text-[11px] text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 bg-[#EA580C] inline-block rounded-full" />
                  Total users
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-0.5 border-t border-dashed border-[#F59E0B] inline-block" />
                  Active users
                </span>
              </div>
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="pt-4">
            <div className="flex">
              {/* Y Axis labels */}
              <div className="flex flex-col justify-between text-[9px] text-zinc-400 font-mono pr-2 h-36 select-none">
                <span>20K</span>
                <span>15K</span>
                <span>10K</span>
                <span>5K</span>
                <span>0</span>
              </div>

              {/* Chart canvas */}
              <div className="relative flex-1 h-36">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-zinc-100 w-full" />
                  <div className="border-b border-zinc-100 w-full" />
                  <div className="border-b border-zinc-100 w-full" />
                  <div className="border-b border-zinc-100 w-full" />
                  <div className="border-b border-zinc-100 w-full" />
                </div>

                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 260 120"
                  preserveAspectRatio="none"
                >
                  {/* Total users line */}
                  <path
                    d="M 10 75 L 50 68 L 90 60 L 130 52 L 170 45 L 210 38 L 250 25"
                    fill="none"
                    stroke="#EA580C"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                  />
                  <circle cx="250" cy="25" r="3.5" fill="#EA580C" />

                  {/* Active users dashed line */}
                  <path
                    d="M 10 95 L 50 90 L 90 85 L 130 80 L 170 75 L 210 70 L 250 65"
                    fill="none"
                    stroke="#F59E0B"
                    strokeWidth="2"
                    strokeDasharray="4 3"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
            </div>

            {/* X Axis dates */}
            <div className="flex justify-between pl-6 pt-2 text-[9px] text-zinc-400 font-mono">
              <span>May 11</span>
              <span>May 12</span>
              <span>May 13</span>
              <span>May 14</span>
              <span>May 15</span>
              <span>May 16</span>
              <span>May 17</span>
            </div>
          </div>
        </div>

        {/* CARD 2: MRR evolution (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <div className="flex items-center gap-1.5">
                <h2 className="text-xs font-bold text-zinc-900">MRR evolution</h2>
                <Info className="w-3.5 h-3.5 text-zinc-400 cursor-pointer" />
              </div>
              <button
                type="button"
                className="flex items-center gap-1 text-[11px] text-zinc-500 bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-200/70"
              >
                <span>Daily</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>

            <div className="mt-3">
              <p className="text-2xl font-bold text-zinc-900 tracking-tight">$162,540</p>
            </div>
          </div>

          {/* SVG Smooth Area Chart */}
          <div className="pt-4">
            <div className="flex">
              {/* Y Axis labels */}
              <div className="flex flex-col justify-between text-[9px] text-zinc-400 font-mono pr-2 h-36 select-none">
                <span>200K</span>
                <span>150K</span>
                <span>100K</span>
                <span>50K</span>
                <span>0</span>
              </div>

              {/* Chart canvas */}
              <div className="relative flex-1 h-36">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
                  <div className="border-b border-zinc-100 w-full" />
                  <div className="border-b border-zinc-100 w-full" />
                  <div className="border-b border-zinc-100 w-full" />
                  <div className="border-b border-zinc-100 w-full" />
                  <div className="border-b border-zinc-100 w-full" />
                </div>

                <svg
                  className="w-full h-full overflow-visible"
                  viewBox="0 0 260 120"
                  preserveAspectRatio="none"
                >
                  <defs>
                    <linearGradient id="mrrGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#EA580C" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#EA580C" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Gradient Area */}
                  <path
                    d="M 10 70 Q 50 65, 90 55 T 170 42 T 250 28 L 250 120 L 10 120 Z"
                    fill="url(#mrrGradient)"
                  />

                  {/* Top curve */}
                  <path
                    d="M 10 70 Q 50 65, 90 55 T 170 42 T 250 28"
                    fill="none"
                    stroke="#EA580C"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                  <circle cx="250" cy="28" r="3.5" fill="#EA580C" />
                </svg>
              </div>
            </div>

            {/* X Axis dates */}
            <div className="flex justify-between pl-7 pt-2 text-[9px] text-zinc-400 font-mono">
              <span>May 11</span>
              <span>May 12</span>
              <span>May 13</span>
              <span>May 14</span>
              <span>May 15</span>
              <span>May 16</span>
              <span>May 17</span>
            </div>
          </div>
        </div>

        {/* CARD 3: Subscription distribution (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-zinc-900">Subscription distribution</h2>
              <Info className="w-3.5 h-3.5 text-zinc-400 cursor-pointer" />
            </div>
            <button
              type="button"
              className="flex items-center gap-1 text-[11px] text-zinc-500 bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-200/70"
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
                {/* Pro (45.7%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#EA580C"
                  strokeWidth="16"
                  strokeDasharray="109 130"
                  strokeDashoffset="0"
                />
                {/* Starter (28.1%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="16"
                  strokeDasharray="67 172"
                  strokeDashoffset="-109"
                />
                {/* Enterprise (16.3%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#FED7AA"
                  strokeWidth="16"
                  strokeDasharray="39 200"
                  strokeDashoffset="-176"
                />
                {/* Free (9.9%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#64748B"
                  strokeWidth="16"
                  strokeDasharray="24 215"
                  strokeDashoffset="-215"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Total</span>
                <span className="text-sm font-bold text-zinc-900">12,517</span>
              </div>
            </div>

            {/* Legend & Percentages */}
            <div className="flex-1 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#EA580C]" />
                  <span className="font-medium text-zinc-800">Pro</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-zinc-900">45.7%</span>
                  <p className="text-[10px] text-zinc-400">5,721</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#F59E0B]" />
                  <span className="font-medium text-zinc-800">Starter</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-zinc-900">28.1%</span>
                  <p className="text-[10px] text-zinc-400">3,517</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#FED7AA]" />
                  <span className="font-medium text-zinc-800">Enterprise</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-zinc-900">16.3%</span>
                  <p className="text-[10px] text-zinc-400">2,039</p>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-sm bg-[#64748B]" />
                  <span className="font-medium text-zinc-800">Free</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-zinc-900">9.9%</span>
                  <p className="text-[10px] text-zinc-400">1,240</p>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 flex justify-between text-xs">
            <span className="font-semibold text-zinc-600">Total active subscribers</span>
            <span className="font-bold text-zinc-900">12,517</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2 BOTTOM CARDS: ALERTS & SYSTEM STATUS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5" id="alerts">
        {/* Left: Alerts Card (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-zinc-900">Alerts</h2>
                <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                  {alerts.length}
                </span>
              </div>
              <Link
                href="/admin/system-logs?severity=Error"
                className="text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition"
              >
                <span>View all alerts</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            <div className="divide-y divide-zinc-100 mt-1">
              {alerts.map((alert) => {
                const isError = alert.severity === 'error';
                return (
                  <div
                    key={alert.id}
                    className="py-3 flex items-center justify-between gap-3 text-xs hover:bg-zinc-50/70 px-2 rounded-xl transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                          isError ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <span
                          className={`inline-block px-2 py-0.5 rounded text-[10px] font-semibold mr-2 ${
                            isError
                              ? 'bg-red-100/70 text-red-700'
                              : 'bg-amber-100/70 text-amber-800'
                          }`}
                        >
                          {alert.type}
                        </span>
                        <span className="text-zinc-700 truncate">{alert.message}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[11px] text-zinc-400">{alert.time_ago}</span>
                      <button
                        type="button"
                        className="px-2.5 py-1 rounded-lg border border-zinc-200 text-[11px] font-medium text-zinc-700 hover:bg-zinc-100 transition"
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
        <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <h2 className="text-sm font-bold text-zinc-900">System status</h2>
              <Link
                href="/admin/system-logs"
                className="text-xs font-medium text-zinc-500 hover:text-zinc-900 flex items-center gap-1 transition"
              >
                <span>View all systems</span>
                <span aria-hidden="true">&rarr;</span>
              </Link>
            </div>

            <div className="divide-y divide-zinc-100 mt-1">
              {system_status.map((item) => (
                <div
                  key={item.name}
                  className="py-3 flex items-center justify-between text-xs hover:bg-zinc-50/70 px-2 rounded-xl transition"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-3 ring-emerald-100 shrink-0" />
                    <span className="font-medium text-zinc-800">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-[11px] text-zinc-500">{item.status}</span>
                    <span className="text-[11px] font-mono font-semibold text-emerald-600 w-12 text-right">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-[11px] text-zinc-400 pt-2 px-1 gap-2">
        <span>System time: {data.system_time}</span>
        <span>Version: {data.version}</span>
      </div>
    </div>
  );
}
