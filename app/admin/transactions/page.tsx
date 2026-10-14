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
        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-zinc-900">
          Transactions
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          Monitor and manage all financial transactions across the platform.
        </p>
      </div>

      {/* ========================================================= */}
      {/* 4 KPI CARDS */}
      {/* ========================================================= */}
      {kpis && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Total Revenue */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-2xs">
            <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
              <span>Total Revenue</span>
              <Info className="w-3 h-3 text-zinc-400" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-2xl font-bold text-zinc-900">
                  ${kpis.total_revenue.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 inline" />
                  {kpis.total_revenue_change}%
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 truncate">{kpis.period_label}</p>
            </div>
          </div>

          {/* 2. Successful Payments */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-2xs">
            <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
              <span>Successful Payments</span>
              <Info className="w-3 h-3 text-zinc-400" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-2xl font-bold text-zinc-900">
                  {kpis.successful_payments.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 inline" />
                  {kpis.successful_payments_change}%
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 truncate">{kpis.period_label}</p>
            </div>
          </div>

          {/* 3. Failed Payments */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-2xs">
            <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
              <span>Failed Payments</span>
              <Info className="w-3 h-3 text-zinc-400" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-2xl font-bold text-zinc-900">
                  {kpis.failed_payments.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold text-rose-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 inline" />
                  {kpis.failed_payments_change}%
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 truncate">{kpis.period_label}</p>
            </div>
          </div>

          {/* 4. Refunds */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-2xs">
            <div className="flex items-center gap-1 text-xs text-zinc-500 font-medium">
              <span>Refunds</span>
              <Info className="w-3 h-3 text-zinc-400" />
            </div>
            <div className="mt-2">
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-2xl font-bold text-zinc-900">
                  {kpis.refunds.toLocaleString()}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 flex items-center">
                  <ArrowUpRight className="w-3 h-3 inline" />
                  {kpis.refunds_change}%
                </span>
              </div>
              <p className="text-[10px] text-zinc-400 mt-1 truncate">{kpis.period_label}</p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* FILTER CONTROLS BAR */}
      {/* ========================================================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-zinc-200/80 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Date range picker */}
          <button
            type="button"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <Calendar className="w-3.5 h-3.5 text-zinc-400" />
            <span>May 18, 2025 - Jun 16, 2025</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          {/* Status filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-zinc-700 cursor-pointer hover:bg-zinc-50"
            >
              <option value="All Status">All Status</option>
              <option value="Succeeded">Succeeded</option>
              <option value="Pending">Pending</option>
              <option value="Failed">Failed</option>
              <option value="Refunded">Refunded</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          </div>

          {/* Providers filter */}
          <div className="relative">
            <select
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
              className="appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-zinc-700 cursor-pointer hover:bg-zinc-50"
            >
              <option value="All Providers">All Providers</option>
              <option value="Stripe">Stripe</option>
              <option value="PayPal">PayPal</option>
              <option value="Checkout.com">Checkout.com</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          </div>

          {/* Types filter */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-1.5 pr-8 text-xs font-medium text-zinc-700 cursor-pointer hover:bg-zinc-50"
            >
              <option value="All Transaction Types">All Transaction Types</option>
              <option value="Subscription Payment">Subscription Payment</option>
              <option value="One-time Top-up">One-time Top-up</option>
              <option value="Plan Upgrade">Plan Upgrade</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
          >
            <Filter className="w-3.5 h-3.5 text-zinc-500" />
            <span>More filters</span>
          </button>
          <button
            type="button"
            className="p-2 rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
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
          className={`bg-white rounded-2xl border border-zinc-200/80 shadow-2xs overflow-hidden transition-all duration-300 ${
            drawerOpen && trxDetail ? 'w-full lg:w-3/5' : 'w-full'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9FB] border-b border-zinc-100 text-zinc-400 text-[11px] font-semibold uppercase tracking-wider select-none">
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
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-zinc-400">
                      Loading transactions...
                    </td>
                  </tr>
                ) : (
                  transactions.map((trx) => {
                    const isSelected = selectedTrxId === trx.transaction_id && drawerOpen;
                    const isChecked = selectedRows.includes(trx.id);

                    let providerBadge = (
                      <span className="font-semibold text-indigo-600">stripe</span>
                    );
                    if (trx.payment_provider.toLowerCase() === 'paypal') {
                      providerBadge = <span className="font-bold text-sky-700">PayPal</span>;
                    } else if (trx.payment_provider.toLowerCase().includes('checkout')) {
                      providerBadge = (
                        <span className="font-medium text-zinc-800">checkout.com</span>
                      );
                    }

                    return (
                      <tr
                        key={trx.id}
                        onClick={() => handleRowClick(trx)}
                        className={`hover:bg-zinc-50/70 cursor-pointer transition ${
                          isSelected ? 'bg-orange-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-3">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onClick={(e) => toggleSelectRow(trx.id, e)}
                            onChange={() => {}}
                            className="rounded border-zinc-300 text-[#EA580C] focus:ring-[#EA580C]"
                          />
                        </td>

                        {/* Transaction ID */}
                        <td className="py-3 px-3 font-mono text-zinc-800 font-medium">
                          {trx.transaction_id}
                        </td>

                        {/* User Type */}
                        <td className="py-3 px-3">
                          <span className="flex items-center gap-1.5 text-zinc-700 font-medium">
                            <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                            {trx.user_type}
                          </span>
                        </td>

                        {/* Amount */}
                        <td className="py-3 px-3 font-bold text-zinc-900">
                          ${trx.amount.toFixed(2)}
                        </td>

                        {/* Payment Provider */}
                        <td className="py-3 px-3">{providerBadge}</td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              trx.status === 'Succeeded'
                                ? 'bg-emerald-50 text-emerald-700'
                                : trx.status === 'Pending'
                                  ? 'bg-amber-50 text-amber-700'
                                  : trx.status === 'Refunded'
                                    ? 'bg-rose-50 text-rose-700'
                                    : 'bg-red-50 text-red-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                trx.status === 'Succeeded'
                                  ? 'bg-emerald-500'
                                  : trx.status === 'Pending'
                                    ? 'bg-amber-500'
                                    : 'bg-rose-500'
                              }`}
                            />
                            {trx.status}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3 px-3 text-zinc-500 text-[11px]">{trx.date_display}</td>

                        {/* Arrow */}
                        <td className="py-3 px-3 text-right">
                          <ChevronRight className="w-4 h-4 text-zinc-400" />
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-4 py-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-zinc-500">
            <div>Showing 1 to 10 of 5,231 results</div>

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
                onClick={() => setCurrentPage(524)}
                className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                  currentPage === 524
                    ? 'bg-orange-50 text-[#EA580C] border border-orange-200'
                    : 'text-zinc-600 hover:bg-zinc-50'
                }`}
              >
                524
              </button>
              <button
                type="button"
                disabled={currentPage >= 524}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50"
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
          <aside className="w-full lg:w-2/5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs p-5 space-y-5 animate-in slide-in-from-right duration-200">
            {/* Header */}
            <div className="flex items-start justify-between pb-3 border-b border-zinc-100">
              <div>
                <h2 className="text-sm font-bold text-zinc-900">Transaction Details</h2>
                <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    {trxDetail.status}
                  </span>
                </div>
                <p className="text-2xl font-bold text-zinc-900 mt-2 tracking-tight">
                  ${trxDetail.amount.toFixed(2)} <span className="text-sm font-medium">USD</span>
                </p>
                <p className="text-[11px] font-mono text-zinc-400 mt-0.5">
                  {trxDetail.transaction_id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
                aria-label="Close details"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* 1. Transaction Information */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-900">Transaction Information</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">Transaction Type</span>
                  <span className="font-medium text-zinc-900">{trxDetail.transaction_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Payment Provider</span>
                  <span className="font-medium text-zinc-900">{trxDetail.payment_provider}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Payment Method</span>
                  <span className="font-medium text-zinc-900 flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-zinc-400" />
                    {trxDetail.payment_method}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Date</span>
                  <span className="font-medium text-zinc-900">{trxDetail.date_display}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Amount</span>
                  <span className="font-bold text-zinc-900">
                    ${trxDetail.amount.toFixed(2)} USD
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Status</span>
                  <span className="font-semibold text-emerald-600 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    {trxDetail.status}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Description</span>
                  <span className="font-medium text-zinc-800">{trxDetail.description}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Receipt ID</span>
                  <span className="font-mono text-[11px] text-zinc-700">
                    {trxDetail.receipt_id}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Customer Information */}
            <div className="pt-3 border-t border-zinc-100 space-y-3">
              <h3 className="text-xs font-bold text-zinc-900">Customer Information</h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-zinc-400">User Type</span>
                  <span className="font-medium text-zinc-900 flex items-center gap-1">
                    <UserIcon className="w-3.5 h-3.5 text-zinc-400" />
                    {trxDetail.user_type}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Customer Name</span>
                  <span className="font-medium text-zinc-900">{trxDetail.customer_name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Email</span>
                  <span className="font-medium text-zinc-900">{trxDetail.customer_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">Customer ID</span>
                  <span className="font-mono text-[11px] text-zinc-700">
                    {trxDetail.customer_id}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-400">IP Address</span>
                  <span className="font-mono text-[11px] text-zinc-700">
                    {trxDetail.ip_address}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Timeline Card */}
            <div className="pt-3 border-t border-zinc-100 space-y-3">
              <h3 className="text-xs font-bold text-zinc-900">Timeline</h3>
              <div className="p-3.5 rounded-xl bg-[#FFF9F3] border border-[#FED7AA]/60 space-y-3">
                {trxDetail.timeline.map((event, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-xs">
                    <span
                      className={`w-2 h-2 rounded-full mt-1 shrink-0 ${
                        idx === 0 ? 'bg-emerald-500' : 'bg-zinc-400'
                      }`}
                    />
                    <div>
                      <p className="font-semibold text-zinc-900">{event.status}</p>
                      <p className="text-[10px] text-zinc-400">{event.timestamp}</p>
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
