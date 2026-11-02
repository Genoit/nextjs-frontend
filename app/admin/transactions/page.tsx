'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  Filter,
  ArrowUpRight,
  Info,
  X,
  CreditCard,
  User as UserIcon,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
} from 'lucide-react';
import { fetchAdminTransactions, fetchAdminTransactionDetail } from '../../../lib/api/admin';
import {
  AdminTransactionItem,
  AdminTransactionDetail,
  AdminTransactionsResponse,
} from '../../../lib/types/admin';

export default function AdminTransactionsPage() {
  const [data, setData] = useState<AdminTransactionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [providerFilter, setProviderFilter] = useState('All Providers');
  const [typeFilter, setTypeFilter] = useState('All Transaction Types');
  const [selectedTrxId, setSelectedTrxId] = useState<string | null>('TRX-2025-0616-00123');
  const [trxDetail, setTrxDetail] = useState<AdminTransactionDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<string[]>(['trx-1']);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const res = await fetchAdminTransactions({
          status: statusFilter,
          provider: providerFilter,
          type: typeFilter,
          page: currentPage,
        });
        setData(res);
      } catch (err) {
        console.error('Failed to load transactions', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [statusFilter, providerFilter, typeFilter, currentPage]);

  useEffect(() => {
    let isMounted = true;
    async function loadDetail() {
      if (!selectedTrxId) {
        if (isMounted) setTrxDetail(null);
        return;
      }
      try {
        const res = await fetchAdminTransactionDetail(selectedTrxId);
        if (isMounted) setTrxDetail(res);
      } catch (err) {
        console.error('Failed to load transaction detail', err);
      }
    }
    loadDetail();
    return () => {
      isMounted = false;
    };
  }, [selectedTrxId]);

  const kpis = data?.kpis;
  const transactions = data?.transactions || [];

  const handleRowClick = (trx: AdminTransactionItem) => {
    setSelectedTrxId(trx.transaction_id);
    setDrawerOpen(true);
  };

  const toggleSelectRow = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedRows((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================= */}
      <div>
        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-ink">Transactions</h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
          Monitor and manage all financial transactions across the platform.
        </p>
      </div>

      {/* ========================================================= */}
      {/* 4 KPI CARDS */}
      {/* ========================================================= */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Revenue */}
          <div className="bg-white rounded-2xl border border-line/80 p-4 shadow-2xs">
            <div className="flex items-center gap-1 text-xs text-ink-muted font-medium">
              <span>Total Revenue</span>
              <Info className="w-3 h-3 text-ink-muted" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-2xl font-bold text-ink">
                  ${kpis.total_revenue.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold text-success flex items-center">
                  <ArrowUpRight className="w-3 h-3 inline" />
                  {kpis.total_revenue_change}%
                </span>
              </div>
              <p className="text-[10px] text-ink-muted mt-1 truncate">{kpis.period_label}</p>
            </div>
          </div>

          {/* 2. Successful Payments */}
          <div className="bg-white rounded-2xl border border-line/80 p-4 shadow-2xs">
            <div className="flex items-center gap-1 text-xs text-ink-muted font-medium">
              <span>Successful Payments</span>
              <Info className="w-3 h-3 text-ink-muted" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-2xl font-bold text-ink">
                  {kpis.successful_payments.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold text-success flex items-center">
                  <ArrowUpRight className="w-3 h-3 inline" />
                  {kpis.successful_payments_change}%
                </span>
              </div>
              <p className="text-[10px] text-ink-muted mt-1 truncate">{kpis.period_label}</p>
            </div>
          </div>

          {/* 3. Failed Payments */}
          <div className="bg-white rounded-2xl border border-line/80 p-4 shadow-2xs">
            <div className="flex items-center gap-1 text-xs text-ink-muted font-medium">
              <span>Failed Payments</span>
              <Info className="w-3 h-3 text-ink-muted" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-2xl font-bold text-ink">
                  {kpis.failed_payments.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold text-danger flex items-center">
                  <ArrowUpRight className="w-3 h-3 inline" />
                  {kpis.failed_payments_change}%
                </span>
              </div>
              <p className="text-[10px] text-ink-muted mt-1 truncate">{kpis.period_label}</p>
            </div>
          </div>

          {/* 4. Refunds */}
          <div className="bg-white rounded-2xl border border-line/80 p-4 shadow-2xs">
            <div className="flex items-center gap-1 text-xs text-ink-muted font-medium">
              <span>Refunds</span>
              <Info className="w-3 h-3 text-ink-muted" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-2xl font-bold text-ink">{kpis.refunds.toLocaleString()}</span>
                <span className="text-[11px] font-semibold text-success flex items-center">
                  <ArrowUpRight className="w-3 h-3 inline" />
                  {kpis.refunds_change}%
                </span>
              </div>
              <p className="text-[10px] text-ink-muted mt-1 truncate">{kpis.period_label}</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FILTER CONTROLS BAR */}
      {/* ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-line/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date range picker */}
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-line text-xs font-medium text-ink-soft hover:bg-studio-surface"
          >
            <Calendar className="w-3.5 h-3.5 text-ink-muted" />
            <span>May 18, 2025 - Jun 16, 2025</span>
            <ChevronDown className="w-3.5 h-3.5 text-ink-muted" />
          </button>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-line rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-ink-soft cursor-pointer hover:bg-studio-surface"
            >
              <option value="All Status">All Status</option>
              <option value="Succeeded">Succeeded</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
          </div>

          {/* Providers filter */}
          <div className="relative">
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="appearance-none bg-white border border-line rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-ink-soft cursor-pointer hover:bg-studio-surface"
            >
              <option value="All Providers">All Providers</option>
              <option value="Stripe">Stripe</option>
              <option value="PayPal">PayPal</option>
              <option value="Checkout.com">Checkout.com</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
          </div>

          {/* Types filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-white border border-line rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-ink-soft cursor-pointer hover:bg-studio-surface"
            >
              <option value="All Transaction Types">All Transaction Types</option>
              <option value="Subscription Payment">Subscription Payment</option>
              <option value="One-time Top-up">One-time Top-up</option>
              <option value="Plan Upgrade">Plan Upgrade</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-line text-xs font-medium text-ink-soft hover:bg-studio-surface"
          >
            <Filter className="w-3.5 h-3.5 text-ink-muted" />
            <span>More filters</span>
          </button>
          <button
            type="button"
            className="p-2 rounded-xl border border-line text-ink-muted hover:bg-studio-surface"
            aria-label="Toggle filter layout"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN CONTENT: TABLE & DRAWER */}
      {/* ========================================================= */}
      <div className="flex gap-6 items-start">
        {/* TRANSACTIONS TABLE */}
        <div
          className={`bg-white rounded-2xl border border-line/80 shadow-2xs overflow-hidden transition-all duration-300 ${
            drawerOpen && trxDetail ? 'w-full lg:w-3/5' : 'w-full'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9FB] border-b border-line text-ink-muted text-[11px] font-semibold uppercase tracking-wider select-none">
                <tr>
                  <th className="py-3 px-3 w-8" />
                  <th className="py-3 px-3">Transaction ID</th>
                  <th className="py-3 px-3">User Type</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Payment Provider</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-ink-muted">
                      Loading transactions...
                    </td>
                  </tr>
                ) : (
                  transactions.map((trx) => {
                    const isSelected = selectedTrxId === trx.transaction_id && drawerOpen;
                    const isChecked = selectedRows.includes(trx.id);

                    let providerBadge = <span className="font-semibold text-ink-soft">stripe</span>;
                    if (trx.payment_provider.toLowerCase() === 'paypal') {
                      providerBadge = <span className="font-bold text-ink-soft">PayPal</span>;
                    } else if (trx.payment_provider.toLowerCase().includes('checkout')) {
                      providerBadge = <span className="font-medium text-ink">checkout.com</span>;
                    }

                    return (
                      <tr
                        key={trx.id}
                        onClick={() => handleRowClick(trx)}
                        className={`hover:bg-studio-surface/70 cursor-pointer transition ${
                          isSelected ? 'bg-cream/40' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onClick={(e) => toggleSelectRow(trx.id, e)}
                            onChange={() => {}}
                            className="rounded border-line text-trend-orange focus:ring-trend-orange"
                          />
                        </td>

                        {/* Transaction ID */}
                        <td className="py-3 px-3 font-mono text-ink font-medium">
                          {trx.transaction_id}
                        </td>

                        {/* User Type */}
                        <td className="py-3 px-3">
                          <span className="flex items-center gap-1.5 text-ink-soft font-medium">
                            <UserIcon className="w-3.5 h-3.5 text-ink-muted" />
                            {trx.user_type}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-3 font-bold text-ink">${trx.amount.toFixed(2)}</td>

                        {/* Payment Provider */}
                        <td className="py-3 px-3">{providerBadge}</td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              trx.status === 'Succeeded'
                                ? 'bg-success-soft text-success'
                                : trx.status === 'Pending'
                                  ? 'bg-warning-soft text-warning'
                                  : trx.status === 'Refunded'
                                    ? 'bg-danger-soft text-danger'
                                    : 'bg-danger-soft text-danger'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                trx.status === 'Succeeded'
                                  ? 'bg-success'
                                  : trx.status === 'Pending'
                                    ? 'bg-warning'
                                    : 'bg-danger'
                              }`}
                            />
                            {trx.status}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 text-ink-muted text-[11px]">{trx.date_display}</td>

                        {/* Arrow */}
                        <td className="py-3 px-3 text-right">
                          <ChevronRight className="w-4 h-4 text-ink-muted" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-ink-muted">
            <div>Showing 1 to 10 of 5,231 results</div>

            <div className="flex items-center gap-1 self-center">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-line disabled:opacity-40 hover:bg-studio-surface"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(1)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                  currentPage === 1
                    ? 'bg-cream text-trend-orange border border-trend-orange/20'
                    : 'text-ink-soft hover:bg-studio-surface'
                }`}
              >
                1
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(2)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                  currentPage === 2
                    ? 'bg-cream text-trend-orange border border-trend-orange/20'
                    : 'text-ink-soft hover:bg-studio-surface'
                }`}
              >
                2
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage(3)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                  currentPage === 3
                    ? 'bg-cream text-trend-orange border border-trend-orange/20'
                    : 'text-ink-soft hover:bg-studio-surface'
                }`}
              >
                3
              </button>
              <span className="px-1 text-ink-muted">...</span>
              <button
                type="button"
                onClick={() => setCurrentPage(524)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                  currentPage === 524
                    ? 'bg-cream text-trend-orange border border-trend-orange/20'
                    : 'text-ink-soft hover:bg-studio-surface'
                }`}
              >
                524
              </button>
              <button
                type="button"
                disabled={currentPage >= 524}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-line disabled:opacity-40 hover:bg-studio-surface"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT SIDE DRAWER: TRANSACTION DETAILS */}
        {/* ========================================================= */}
        {drawerOpen && trxDetail && (
          <aside className="w-full lg:w-2/5 bg-white rounded-2xl border border-line/80 shadow-2xs p-5 space-y-5 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-line">
              <div>
                <h2 className="text-sm font-bold text-ink">Transaction Details</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-success-soft text-success">
                    <span className="w-1.5 h-1.5 rounded-full bg-success" />
                    {trxDetail.status}
                  </span>
                </div>
                <p className="text-2xl font-bold text-ink mt-2 tracking-tight">
                  ${trxDetail.amount.toFixed(2)} <span className="text-sm font-medium">USD</span>
                </p>
                <p className="text-[11px] font-mono text-ink-muted mt-0.5">
                  {trxDetail.transaction_id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1 text-ink-muted hover:text-ink-soft rounded-lg hover:bg-studio-raised"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Transaction Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-ink">Transaction Information</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-ink-muted">Transaction Type</span>
                  <span className="font-medium text-ink">{trxDetail.transaction_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Payment Provider</span>
                  <span className="font-medium text-ink">{trxDetail.payment_provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Payment Method</span>
                  <span className="font-medium text-ink flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-ink-muted" />
                    {trxDetail.payment_method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Date</span>
                  <span className="font-medium text-ink">{trxDetail.date_display}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Amount</span>
                  <span className="font-bold text-ink">${trxDetail.amount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Status</span>
                  <span className="font-semibold text-success flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                    {trxDetail.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Description</span>
                  <span className="font-medium text-ink">{trxDetail.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Receipt ID</span>
                  <span className="font-mono text-[11px] text-ink-soft">
                    {trxDetail.receipt_id}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Customer Information */}
            <div className="pt-3 border-t border-line space-y-3">
              <h3 className="text-xs font-bold text-ink">Customer Information</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-ink-muted">User Type</span>
                  <span className="font-medium text-ink flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5 text-ink-muted" />
                    {trxDetail.user_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Customer Name</span>
                  <span className="font-medium text-ink">{trxDetail.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Email</span>
                  <span className="font-medium text-ink">{trxDetail.customer_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">Customer ID</span>
                  <span className="font-mono text-[11px] text-ink-soft">
                    {trxDetail.customer_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-ink-muted">IP Address</span>
                  <span className="font-mono text-[11px] text-ink-soft">
                    {trxDetail.ip_address}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Timeline Card */}
            <div className="pt-3 border-t border-line space-y-3">
              <h3 className="text-xs font-bold text-ink">Timeline</h3>
              <div className="p-3.5 rounded-xl bg-[#FFF9F3] border border-trend-orange/30 space-y-3">
                {trxDetail.timeline.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <span
                      className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                        idx === 0 ? 'bg-success' : 'bg-zinc-400'
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-ink">{event.status}</p>
                      <p className="text-[10px] text-ink-muted">{event.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
