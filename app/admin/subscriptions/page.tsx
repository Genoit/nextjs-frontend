'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Calendar,
  Download,
  Info,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Users,
  PieChart,
  Clock,
  ChevronDown,
  Search,
  Filter,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  ChevronRight as ArrowRightIcon,
  AlertCircle,
} from 'lucide-react';
import { fetchAdminSubscriptions } from '../../../lib/api/admin';
import { AdminSubscriptionsResponse } from '../../../lib/types/admin';

export default function AdminSubscriptionsPage() {
  const [data, setData] = useState<AdminSubscriptionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchAdminSubscriptions({
          tab: activeTab,
          search,
          page: currentPage,
        });
        setData(res);
      } catch (err) {
        console.error('Failed to load subscriptions', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [activeTab, search, currentPage]);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-[#EA580C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const kpis = data?.kpis;
  const distribution = data?.distribution || [];
  const alerts = data?.alerts || [];
  const subscriptions = data?.subscriptions || [];
  const counts = data?.counts_by_tab || {
    all: 2842,
    starter: 1152,
    growth: 1032,
    scale: 488,
    trial: 320,
    cancelled: 98,
    'past due': 74,
  };

  const tabs = [
    { id: 'all', label: 'All', count: counts.all },
    { id: 'starter', label: 'Starter', count: counts.starter },
    { id: 'growth', label: 'Growth', count: counts.growth },
    { id: 'scale', label: 'Scale', count: counts.scale },
    { id: 'trial', label: 'Trial', count: counts.trial },
    { id: 'cancelled', label: 'Cancelled', count: counts.cancelled },
    { id: 'past due', label: 'Past due', count: counts['past due'] },
  ];

  const toggleSelectAll = () => {
    if (selectedIds.length === subscriptions.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(subscriptions.map((s) => s.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-zinc-900">
            Subscriptions
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
            Manage and track all subscription plans, billing and cancellations.
          </p>
        </div>

        {/* Date Filter & Export */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            className="flex items-center gap-2 px-3.5 py-2 bg-white rounded-xl border border-zinc-200/90 shadow-2xs hover:bg-zinc-50 text-xs font-medium text-zinc-700 transition"
          >
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>May 12 - Jun 12, 2025</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-1" />
          </button>

          <button
            type="button"
            className="flex items-center gap-1.5 px-3.5 py-2 bg-white rounded-xl border border-zinc-200/90 shadow-2xs hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition"
          >
            <Download className="w-3.5 h-3.5 text-zinc-500" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5 KPI CARDS */}
      {/* ========================================================= */}
      {kpis && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {/* 1. MRR */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
                <span>MRR</span>
                <Info className="w-3 h-3 text-zinc-400" />
              </div>
              <div className="w-7 h-7 rounded-lg bg-orange-50 text-[#EA580C] flex items-center justify-center font-bold text-xs">
                $
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xl font-bold text-zinc-900">
                  ${kpis.mrr.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 inline" />
                  {kpis.mrr_change}%
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 truncate">{kpis.period_label}</p>
            </div>
          </div>

          {/* 2. ARR */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
                <span>ARR</span>
                <Info className="w-3 h-3 text-zinc-400" />
              </div>
              <div className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xl font-bold text-zinc-900">
                  ${kpis.arr.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 inline" />
                  {kpis.arr_change}%
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 truncate">{kpis.period_label}</p>
            </div>
          </div>

          {/* 3. Active Subscriptions */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
                <span>Active Subscriptions</span>
                <Info className="w-3 h-3 text-zinc-400" />
              </div>
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xs">
                <Users className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xl font-bold text-zinc-900">
                  {kpis.active_subscriptions.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 inline" />
                  {kpis.active_subscriptions_change}%
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 truncate">{kpis.period_label}</p>
            </div>
          </div>

          {/* 4. Churn Rate */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
                <span>Churn Rate</span>
                <Info className="w-3 h-3 text-zinc-400" />
              </div>
              <div className="w-7 h-7 rounded-lg bg-orange-500 text-white flex items-center justify-center font-bold text-xs">
                <PieChart className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xl font-bold text-zinc-900">{kpis.churn_rate}%</span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                  <ArrowDownRight className="w-3 h-3 inline" />
                  {kpis.churn_rate_change}pp
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 truncate">{kpis.period_label}</p>
            </div>
          </div>

          {/* 5. Trial Users */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-2xs flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
                <span>Trial Users</span>
                <Info className="w-3 h-3 text-zinc-400" />
              </div>
              <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
                <Clock className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-xl font-bold text-zinc-900">
                  {kpis.trial_users.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 inline" />
                  {kpis.trial_users_change}%
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 truncate">{kpis.period_label}</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MIDDLE ROW: DISTRIBUTION & ALERTS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Subscription Distribution Donut (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
            <div className="flex items-center gap-1.5">
              <h2 className="text-xs font-bold text-zinc-900">Subscription Distribution</h2>
              <Info className="w-3.5 h-3.5 text-zinc-400" />
            </div>
            <button
              type="button"
              className="flex items-center gap-1 text-[11px] text-zinc-500 bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-200/70"
            >
              <span>By Plan</span>
              <ChevronDown className="w-3 h-3" />
            </button>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 py-4">
            {/* SVG Donut */}
            <div className="relative w-40 h-40 shrink-0 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                {/* Starter (40.5%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#EA580C"
                  strokeWidth="14"
                  strokeDasharray="97 142"
                  strokeDashoffset="0"
                />
                {/* Growth (36.3%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#F59E0B"
                  strokeWidth="14"
                  strokeDasharray="87 152"
                  strokeDashoffset="-97"
                />
                {/* Scale (17.5%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#FCD34D"
                  strokeWidth="14"
                  strokeDasharray="42 197"
                  strokeDashoffset="-184"
                />
                {/* Trial (11.3%) */}
                <circle
                  cx="50"
                  cy="50"
                  r="38"
                  fill="transparent"
                  stroke="#93C5FD"
                  strokeWidth="14"
                  strokeDasharray="27 212"
                  strokeDashoffset="-226"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-base font-bold text-zinc-900">2,842</span>
                <span className="text-[10px] text-zinc-400 uppercase font-semibold">Total</span>
              </div>
            </div>

            {/* Legend List */}
            <div className="flex-1 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
              {distribution.map((item) => (
                <div key={item.plan} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-medium text-zinc-700">{item.plan}</span>
                  </div>
                  <span className="text-zinc-500 font-mono text-[11px]">
                    {item.count.toLocaleString()} ({item.percentage}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Alerts Card (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <h2 className="text-sm font-bold text-zinc-900">Alerts</h2>
            <Link
              href="/admin/subscriptions?tab=past+due"
              className="text-xs font-medium text-[#EA580C] hover:underline"
            >
              View all alerts
            </Link>
          </div>

          <div className="divide-y divide-zinc-100 mt-1">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                className="py-3 flex items-center justify-between hover:bg-zinc-50/70 px-2 rounded-xl transition cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      alt.severity === 'error'
                        ? 'bg-rose-50 text-rose-600'
                        : alt.severity === 'warning'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900 leading-tight">{alt.title}</p>
                    <p className="text-[11px] text-zinc-400 mt-0.5">{alt.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold ${
                      alt.severity === 'error'
                        ? 'text-rose-600'
                        : alt.severity === 'warning'
                          ? 'text-amber-600'
                          : 'text-blue-600'
                    }`}
                  >
                    {alt.count}
                  </span>
                  <ArrowRightIcon className="w-3.5 h-3.5 text-zinc-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SUBSCRIPTIONS TABLE SECTION WITH TABS */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-2xs overflow-hidden">
        {/* Filter Tabs & Search Controls */}
        <div className="p-4 border-b border-zinc-100 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                    isActive
                      ? 'bg-orange-50 text-[#EA580C] border border-orange-200'
                      : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                  }`}
                >
                  <span>{tab.label}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-[#EA580C] text-white' : 'bg-zinc-100 text-zinc-500'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by user, email or ID..."
                className="rounded-xl border border-zinc-200/90 bg-white py-1.5 pl-8 pr-3 text-xs text-zinc-900 placeholder-zinc-400 shadow-2xs focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition"
              />
            </div>
            <button
              type="button"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-600 hover:bg-zinc-50"
            >
              <Filter className="w-3 h-3 text-zinc-400" />
              <span>Filters</span>
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF9FB] border-b border-zinc-100 text-zinc-400 text-[11px] font-semibold uppercase tracking-wider select-none">
              <tr>
                <th className="py-3 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.length === subscriptions.length && subscriptions.length > 0
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-zinc-300 text-[#EA580C] focus:ring-[#EA580C]"
                  />
                </th>
                <th className="py-3 px-3">User</th>
                <th className="py-3 px-3">Plan</th>
                <th className="py-3 px-3">Billing Cycle</th>
                <th className="py-3 px-3">Amount</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Next Billing</th>
                <th className="py-3 px-3">Created</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {subscriptions.map((sub) => {
                const isChecked = selectedIds.includes(sub.id);
                return (
                  <tr
                    key={sub.id}
                    className={`hover:bg-zinc-50/70 transition ${isChecked ? 'bg-orange-50/30' : ''}`}
                  >
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSelect(sub.id)}
                        className="rounded border-zinc-300 text-[#EA580C] focus:ring-[#EA580C]"
                      />
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-orange-100 text-[#EA580C] font-bold text-xs flex items-center justify-center shrink-0">
                          {sub.initials}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 leading-tight">
                            {sub.user_name}
                          </p>
                          <p className="text-[11px] text-zinc-400">{sub.user_email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-orange-50 text-[#EA580C]">
                        {sub.plan}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-600">{sub.billing_cycle}</td>
                    <td className="py-3 px-3 font-semibold text-zinc-900">
                      ${sub.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                          sub.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : sub.status === 'Past due'
                              ? 'bg-rose-50 text-rose-700'
                              : sub.status === 'Trial'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-zinc-100 text-zinc-600'
                        }`}
                      >
                        {sub.status}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-zinc-800">{sub.next_billing}</p>
                      <p className="text-[10px] text-zinc-400">{sub.next_billing_relative}</p>
                    </td>
                    <td className="py-3 px-3 text-zinc-500 text-[11px]">{sub.created_at}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
                        aria-label="More actions"
                      >
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Table Pagination */}
        <div className="px-4 py-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-zinc-500">
          <div>Showing 1 to 10 of 2,842 results</div>

          <div className="flex items-center gap-1 self-center">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(1)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                currentPage === 1
                  ? 'bg-orange-50 text-[#EA580C] border border-orange-200'
                  : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              1
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(2)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                currentPage === 2
                  ? 'bg-orange-50 text-[#EA580C] border border-orange-200'
                  : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              2
            </button>
            <button
              type="button"
              onClick={() => setCurrentPage(3)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                currentPage === 3
                  ? 'bg-orange-50 text-[#EA580C] border border-orange-200'
                  : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              3
            </button>
            <span className="px-1 text-zinc-400">...</span>
            <button
              type="button"
              onClick={() => setCurrentPage(285)}
              className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                currentPage === 285
                  ? 'bg-orange-50 text-[#EA580C] border border-orange-200'
                  : 'text-zinc-600 hover:bg-zinc-50'
              }`}
            >
              285
            </button>
            <button
              type="button"
              disabled={currentPage >= 285}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="p-1.5 rounded-lg border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <select className="border border-zinc-200 rounded-lg px-2 py-1 text-xs bg-white">
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
