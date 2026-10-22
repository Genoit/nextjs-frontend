'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  ChevronDown,
  Download,
  RotateCw,
  X,
  Copy,
  Check,
  Sparkles,
  TrendingUp,
  Share2,
  Lock,
  CreditCard,
  Bell,
  Layers,
  FileCode,
  Code2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { fetchAdminSystemLogs, fetchAdminLogDetail } from '../../../lib/api/admin';
import { AdminLogItem, AdminLogDetail, AdminLogsResponse } from '../../../lib/types/admin';

export default function AdminSystemLogsPage() {
  const [data, setData] = useState<AdminLogsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('All Severities');
  const [serviceFilter, setServiceFilter] = useState('All Services');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [selectedLogId, setSelectedLogId] = useState<string | null>('log-1');
  const [logDetail, setLogDetail] = useState<AdminLogDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    async function loadLogs() {
      setLoading(true);
      try {
        const res = await fetchAdminSystemLogs({
          severity: severityFilter,
          service: serviceFilter,
          status: statusFilter,
          page: currentPage,
        });
        setData(res);
      } catch (err) {
        console.error('Failed to load system logs', err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, [severityFilter, serviceFilter, statusFilter, currentPage]);

  useEffect(() => {
    let isMounted = true;
    async function loadDetail() {
      if (!selectedLogId) {
        if (isMounted) setLogDetail(null);
        return;
      }
      try {
        const res = await fetchAdminLogDetail(selectedLogId);
        if (isMounted) setLogDetail(res);
      } catch (err) {
        console.error('Failed to load log detail', err);
      }
    }
    loadDetail();
    return () => {
      isMounted = false;
    };
  }, [selectedLogId]);

  const handleRowClick = (log: AdminLogItem) => {
    setSelectedLogId(log.id);
    setDrawerOpen(true);
  };

  const handleResetFilters = () => {
    setSeverityFilter('All Severities');
    setServiceFilter('All Services');
    setStatusFilter('All Statuses');
    setCurrentPage(1);
  };

  const copyJsonPayload = () => {
    if (!logDetail?.technical_details) return;
    navigator.clipboard.writeText(JSON.stringify(logDetail.technical_details, null, 2));
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const logs = data?.logs || [];
  const total = data?.total || 1248;

  const getServiceIcon = (service: string) => {
    switch (service) {
      case 'AI Generation':
        return <Sparkles className="w-3.5 h-3.5 text-purple-600" />;
      case 'Product Intelligence':
        return <TrendingUp className="w-3.5 h-3.5 text-orange-600" />;
      case 'Store Integration':
        return <Share2 className="w-3.5 h-3.5 text-emerald-600" />;
      case 'Authentication':
        return <Lock className="w-3.5 h-3.5 text-sky-600" />;
      case 'Payments':
        return <CreditCard className="w-3.5 h-3.5 text-teal-600" />;
      case 'Notifications':
        return <Bell className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <Layers className="w-3.5 h-3.5 text-zinc-600" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Info':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">
            Info
          </span>
        );
      case 'Warning':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-700">
            Warning
          </span>
        );
      case 'Error':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-rose-50 text-rose-700">
            Error
          </span>
        );
      case 'Critical':
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-red-100 text-red-800">
            Critical
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-100 text-zinc-700">
            {severity}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* ========================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================= */}
      <div>
        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-zinc-900">
          System Logs
        </h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          Monitor technical activity and track events across the TrendED platform.
        </p>
      </div>

      {/* ========================================================= */}
      {/* FILTER BAR (Faithful to Figma) */}
      {/* ========================================================= */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-2xs space-y-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 items-end">
          {/* 1. Severity */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Severity</label>
            <div className="relative">
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer"
              >
                <option value="All Severities">All Severities</option>
                <option value="Info">Info</option>
                <option value="Warning">Warning</option>
                <option value="Error">Error</option>
                <option value="Critical">Critical</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            </div>
          </div>

          {/* 2. Service */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Service</label>
            <div className="relative">
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer"
              >
                <option value="All Services">All Services</option>
                <option value="AI Generation">AI Generation</option>
                <option value="Product Intelligence">Product Intelligence</option>
                <option value="Store Integration">Store Integration</option>
                <option value="Authentication">Authentication</option>
                <option value="Payments">Payments</option>
                <option value="Notifications">Notifications</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            </div>
          </div>

          {/* 3. Date */}
          <div className="sm:col-span-2">
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Date</label>
            <button
              type="button"
              className="w-full flex items-center justify-between px-3 py-2 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
            >
              <div className="flex items-center gap-2">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <span>May 16, 2025 - May 23, 2025</span>
              </div>
            </button>
          </div>

          {/* 4. Status */}
          <div>
            <label className="block text-[11px] font-medium text-zinc-400 mb-1">Status</label>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full appearance-none bg-white border border-zinc-200 rounded-xl px-3 py-2 pr-8 text-xs font-medium text-zinc-700 hover:bg-zinc-50 cursor-pointer"
              >
                <option value="All Statuses">All Statuses</option>
                <option value="Success">Success</option>
                <option value="Failed">Failed</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
            </div>
          </div>

          {/* 5. Buttons: Reset & Apply Filters */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetFilters}
              className="flex-1 py-2 px-3 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
            >
              Reset
            </button>
            <button
              type="button"
              className="flex-1 py-2 px-3 rounded-xl bg-[#EA580C] text-white text-xs font-semibold hover:bg-[#C2410C] shadow-2xs transition"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAIN CONTENT: TABLE & DRAWER */}
      {/* ========================================================= */}
      <div className="flex gap-6 items-start">
        {/* LOGS TABLE */}
        <div
          className={`bg-white rounded-2xl border border-zinc-200/80 shadow-2xs overflow-hidden transition-all duration-300 ${
            drawerOpen && logDetail ? 'w-full lg:w-3/5' : 'w-full'
          }`}
        >
          {/* Table Header controls */}
          <div className="p-4 border-b border-zinc-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-zinc-900">Logs ({total.toLocaleString()})</h2>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 text-xs font-medium text-zinc-700 hover:bg-zinc-50"
              >
                <Download className="w-3.5 h-3.5 text-zinc-500" />
                <span>Export</span>
              </button>
              <button
                type="button"
                className="p-1.5 rounded-xl border border-zinc-200 text-zinc-500 hover:bg-zinc-50"
                aria-label="Refresh logs"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9FB] border-b border-zinc-100 text-zinc-400 text-[11px] font-semibold uppercase tracking-wider select-none">
                <tr>
                  <th className="py-3 px-4">Timestamp &darr;</th>
                  <th className="py-3 px-3">Service</th>
                  <th className="py-3 px-3">Event</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">User</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-zinc-400">
                      Loading logs...
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => {
                    const isSelected = selectedLogId === log.id && drawerOpen;
                    const isSuccess = log.status === 'Success';

                    return (
                      <tr
                        key={log.id}
                        onClick={() => handleRowClick(log)}
                        className={`hover:bg-zinc-50/70 cursor-pointer transition ${
                          isSelected ? 'bg-orange-50/40' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono text-[11px] text-zinc-600 whitespace-nowrap">
                          {log.timestamp}
                        </td>

                        <td className="py-3 px-3">
                          <div className="flex items-center gap-1.5 whitespace-nowrap">
                            {getServiceIcon(log.service)}
                            <span className="font-medium text-zinc-800">{log.service}</span>
                          </div>
                        </td>

                        <td className="py-3 px-3 font-medium text-zinc-900">{log.event}</td>

                        <td className="py-3 px-3">{getSeverityBadge(log.severity)}</td>

                        <td className="py-3 px-3 font-mono text-[11px] text-zinc-500">
                          {log.user}
                        </td>

                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 font-medium ${
                              isSuccess ? 'text-emerald-600' : 'text-rose-600'
                            }`}
                          >
                            {isSuccess ? (
                              <CheckCircle2 className="w-3.5 h-3.5 inline" />
                            ) : (
                              <XCircle className="w-3.5 h-3.5 inline" />
                            )}
                            <span>{log.status}</span>
                          </span>
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
            <div>Showing 1 to 10 of 1,248 logs</div>

            <div className="flex items-center gap-1 self-center">
              <button
                type="button"
                className="p-1.5 rounded-lg border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg text-xs font-semibold bg-orange-50 text-[#EA580C] border border-orange-200"
              >
                1
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
              >
                2
              </button>
              <button
                type="button"
                className="w-7 h-7 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
              >
                3
              </button>
              <span className="px-1 text-zinc-400">...</span>
              <button
                type="button"
                className="w-7 h-7 rounded-lg text-xs font-semibold text-zinc-600 hover:bg-zinc-50"
              >
                125
              </button>
              <button
                type="button"
                className="p-1.5 rounded-lg border border-zinc-200 hover:bg-zinc-50"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT SIDE DRAWER: LOG DETAILS (Faithful to Figma) */}
        {/* ========================================================= */}
        {drawerOpen && logDetail && (
          <aside className="w-full lg:w-2/5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs p-5 space-y-4 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-3 border-b border-zinc-100">
              <div>
                <div className="mb-2">{getSeverityBadge(logDetail.severity)}</div>
                <h2 className="text-base font-bold text-zinc-900">{logDetail.event}</h2>
                <p className="text-xs text-zinc-500 mt-1">{logDetail.description}</p>
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

            {/* Key-Value Metadata */}
            <div className="space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Timestamp</span>
                </span>
                <span className="font-medium text-zinc-900">{logDetail.timestamp}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Request ID</span>
                </span>
                <span className="font-mono text-zinc-700 text-[11px]">{logDetail.request_id}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Service</span>
                </span>
                <span className="font-medium text-zinc-900">{logDetail.service}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Event</span>
                </span>
                <span className="font-medium text-zinc-900">{logDetail.event}</span>
              </div>
            </div>

            {/* Technical Details JSON Code Viewer */}
            <div className="pt-3 border-t border-zinc-100 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-900">Technical Details</h3>
                <button
                  type="button"
                  onClick={copyJsonPayload}
                  className="flex items-center gap-1 text-[11px] text-zinc-500 hover:text-zinc-900 font-medium"
                >
                  {copiedCode ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              {/* Dark Code block matching Figma design */}
              <div className="bg-[#18181B] rounded-xl p-3.5 overflow-x-auto text-[11px] font-mono text-zinc-300 leading-relaxed shadow-inner">
                <pre className="text-zinc-300">
                  <code>
                    {`1  {
2    "timestamp": "2025-05-23T10:42:31.123Z",
3    "request_id": "req_7f3a9c2e1b8d4f91",
4    "service": "ai_generation",
5    "event": "image_generation_completed",
6    "user": "system",
7    "status": "success",
8    "duration_ms": 2847,
9    "product_id": "87241",
10   "prompt_id": "prm_9d1b2f7c",
11   "model": "dall-e-3",
12   "resolution": "1024x1024",
13   "file_url": "https://cdn.trended.io/ai/87241/3f2a9c1d-7b8e-4c1f-93d2.jpg",
14   "size_kb": 512,
15   "metadata": {
16     "seed": 123456789,
17     "steps": 30,
18     "guidance_scale": 7.5
19   }
20 }`}
                  </code>
                </pre>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
