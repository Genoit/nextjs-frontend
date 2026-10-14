'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Search,
  ChevronDown,
  Download,
  MoreHorizontal,
  X,
  Edit2,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  KeyRound,
  Check,
} from 'lucide-react';
import {
  fetchAdminUsers,
  fetchAdminUserDetail,
  updateAdminUserStatus,
  resetAdminUserAccess,
} from '../../../lib/api/admin';
import { AdminUserItem, AdminUserDetail } from '../../../lib/types/admin';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUserItem[]>([]);
  const [totalUsers, setTotalUsers] = useState(42);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All status');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Selected user for drawer
  const [selectedUserId, setSelectedUserId] = useState<string | null>('usr_7hK2mL9q8Pz');
  const [selectedUserDetail, setSelectedUserDetail] = useState<AdminUserDetail | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [drawerTab, setDrawerTab] = useState<'overview' | 'activity' | 'security'>('overview');
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadUsers() {
      setLoading(true);
      try {
        const res = await fetchAdminUsers({
          search,
          status: statusFilter === 'All status' ? undefined : statusFilter,
          page: currentPage,
          pageSize,
        });
        setUsers(res.users);
        setTotalUsers(res.total);
      } catch (err) {
        console.error('Failed to load users', err);
      } finally {
        setLoading(false);
      }
    }
    loadUsers();
  }, [search, statusFilter, currentPage, pageSize]);

  useEffect(() => {
    let isMounted = true;
    async function loadDetail() {
      if (!selectedUserId) {
        if (isMounted) setSelectedUserDetail(null);
        return;
      }
      try {
        const detail = await fetchAdminUserDetail(selectedUserId);
        if (isMounted) setSelectedUserDetail(detail);
      } catch (err) {
        console.error('Failed to load user detail', err);
      }
    }
    loadDetail();
    return () => {
      isMounted = false;
    };
  }, [selectedUserId]);

  const handleRowClick = (user: AdminUserItem) => {
    setSelectedUserId(user.id);
    setDrawerOpen(true);
  };

  const handleStatusToggle = async (userId: string, newStatus: string) => {
    try {
      await updateAdminUserStatus(userId, newStatus);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, status: newStatus as AdminUserItem['status'] } : u,
        ),
      );
      if (selectedUserDetail && selectedUserDetail.id === userId) {
        setSelectedUserDetail({ ...selectedUserDetail, status: newStatus });
      }
      setActionSuccessMsg(`Status updated to ${newStatus}`);
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch {
      // ignore
    }
  };

  const handleResetAccess = async (userId: string) => {
    try {
      await resetAdminUserAccess(userId);
      setActionSuccessMsg('Password reset link sent to user email');
      setTimeout(() => setActionSuccessMsg(null), 3000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-5 relative">
      {/* Toast Alert */}
      {actionSuccessMsg && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================= */}
      <div>
        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-zinc-900">Users</h1>
        <p className="text-xs sm:text-sm text-zinc-500 mt-0.5">
          Manage user accounts, permissions and access across your TrendED organization.
        </p>
      </div>

      {/* ========================================================= */}
      {/* CONTROLS BAR: SEARCH, FILTER, EXPORT */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5 flex-1 max-w-md">
          {/* Search input */}
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full rounded-xl border border-zinc-200/90 bg-white py-2 pl-9 pr-3 text-xs text-zinc-900 placeholder-zinc-400 shadow-2xs focus:border-[#EA580C] focus:ring-1 focus:ring-[#EA580C] transition"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white border border-zinc-200/90 rounded-xl px-3.5 py-2 pr-8 text-xs font-medium text-zinc-700 shadow-2xs cursor-pointer hover:bg-zinc-50 focus:border-[#EA580C] transition"
            >
              <option value="All status">All status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Pending">Pending</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400" />
          </div>
        </div>

        {/* Export Button */}
        <button
          type="button"
          onClick={() => alert('Exporting users to CSV...')}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-white rounded-xl border border-zinc-200/90 shadow-2xs hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition"
        >
          <Download className="w-3.5 h-3.5 text-zinc-500" />
          <span>Export</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* MAIN LAYOUT: TABLE (LEFT) + DRAWER (RIGHT) */}
      {/* ========================================================= */}
      <div className="flex gap-6 items-start">
        {/* USERS TABLE */}
        <div
          className={`bg-white rounded-2xl border border-zinc-200/80 shadow-2xs overflow-hidden transition-all duration-300 ${
            drawerOpen && selectedUserDetail ? 'w-full lg:w-3/5' : 'w-full'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FAF9FB] border-b border-zinc-100 text-zinc-400 text-[11px] font-semibold uppercase tracking-wider select-none">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-3">Plan</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 hidden sm:table-cell">Store</th>
                  <th className="py-3 px-3 hidden md:table-cell">Last activity</th>
                  <th className="py-3 px-3 hidden lg:table-cell">Created</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 font-normal">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-zinc-400">
                      No users match your criteria.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    const isSelected = selectedUserId === user.id && drawerOpen;
                    return (
                      <tr
                        key={user.id}
                        onClick={() => handleRowClick(user)}
                        className={`hover:bg-zinc-50/80 cursor-pointer transition ${
                          isSelected ? 'bg-orange-50/40' : ''
                        }`}
                      >
                        {/* User info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-zinc-100 text-zinc-700 font-bold text-xs flex items-center justify-center shrink-0 border border-zinc-200/60">
                              {user.initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-zinc-900 truncate">{user.name}</p>
                              <p className="text-[11px] text-zinc-400 truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="py-3 px-3">
                          <span className="font-medium text-zinc-700">{user.plan}</span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              user.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : user.status === 'Suspended'
                                  ? 'bg-rose-50 text-rose-700'
                                  : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.status === 'Active'
                                  ? 'bg-emerald-500'
                                  : user.status === 'Suspended'
                                    ? 'bg-rose-500'
                                    : 'bg-amber-500'
                              }`}
                            />
                            {user.status}
                          </span>
                        </td>

                        {/* Store */}
                        <td className="py-3 px-3 hidden sm:table-cell">
                          <span className="text-zinc-600 font-medium">{user.store}</span>
                        </td>

                        {/* Last activity */}
                        <td className="py-3 px-3 hidden md:table-cell text-zinc-500 text-[11px]">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                            {user.last_activity}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="py-3 px-3 hidden lg:table-cell text-zinc-500 text-[11px]">
                          {user.created_at}
                        </td>

                        {/* Action ... */}
                        <td
                          className="py-3 px-4 text-right relative"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setActiveMenuId(activeMenuId === user.id ? null : user.id)
                            }
                            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                            aria-label="Actions"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {activeMenuId === user.id && (
                            <div className="absolute right-4 top-8 w-44 bg-white rounded-xl shadow-xl border border-zinc-200/90 py-1 z-30 animate-in fade-in">
                              <Link
                                href={`/admin/users/${user.id}`}
                                className="block px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 text-left"
                              >
                                View full details
                              </Link>
                              <button
                                type="button"
                                onClick={() => {
                                  handleStatusToggle(
                                    user.id,
                                    user.status === 'Active' ? 'Suspended' : 'Active',
                                  );
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 text-left"
                              >
                                {user.status === 'Active' ? 'Suspend account' : 'Activate account'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleResetAccess(user.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-zinc-700 hover:bg-zinc-50 text-left"
                              >
                                Reset access
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination */}
          <div className="px-4 py-3 border-t border-zinc-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-zinc-500">
            <div>
              Showing 1 to {Math.min(pageSize, users.length)} of {totalUsers} users
            </div>

            <div className="flex items-center gap-1 self-center">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              {[1, 2, 3, 4, 5].map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-lg text-xs font-semibold ${
                    currentPage === pageNum
                      ? 'bg-orange-50 text-[#EA580C] border border-orange-200'
                      : 'text-zinc-600 hover:bg-zinc-50'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage >= 5}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-zinc-200 disabled:opacity-40 hover:bg-zinc-50"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span>Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-zinc-200 rounded-lg px-2 py-1 text-xs bg-white"
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT SIDE DRAWER (Sarah Johnson / Selected User) */}
        {/* ========================================================= */}
        {drawerOpen && selectedUserDetail && (
          <aside className="w-full lg:w-2/5 bg-white rounded-2xl border border-zinc-200/80 shadow-2xs p-5 space-y-5 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-100 text-zinc-800 font-bold text-sm flex items-center justify-center border border-zinc-200">
                  {selectedUserDetail.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-zinc-900">{selectedUserDetail.name}</h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      {selectedUserDetail.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">{selectedUserDetail.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-zinc-100 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDrawerTab('overview')}
                className={`pb-2.5 px-3 border-b-2 transition ${
                  drawerTab === 'overview'
                    ? 'border-[#EA580C] text-[#EA580C]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('activity')}
                className={`pb-2.5 px-3 border-b-2 transition ${
                  drawerTab === 'activity'
                    ? 'border-[#EA580C] text-[#EA580C]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Activity
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('security')}
                className={`pb-2.5 px-3 border-b-2 transition ${
                  drawerTab === 'security'
                    ? 'border-[#EA580C] text-[#EA580C]'
                    : 'border-transparent text-zinc-500 hover:text-zinc-800'
                }`}
              >
                Security
              </button>
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {drawerTab === 'overview' && (
              <div className="space-y-4 text-xs">
                {/* 1. Account information */}
                <div className="p-3.5 bg-zinc-50/70 rounded-xl space-y-2 border border-zinc-100">
                  <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/60">
                    <span className="font-bold text-zinc-900 text-xs">Account information</span>
                    <button
                      type="button"
                      className="text-[11px] text-zinc-600 hover:text-zinc-900 flex items-center gap-1 font-medium"
                    >
                      <Edit2 className="w-3 h-3 text-zinc-400" />
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1.5 text-zinc-600 text-[11px]">
                    <span className="text-zinc-400">Full name</span>
                    <span className="font-medium text-zinc-900">{selectedUserDetail.name}</span>

                    <span className="text-zinc-400">Email</span>
                    <span className="font-medium text-zinc-900 truncate">
                      {selectedUserDetail.email}
                    </span>

                    <span className="text-zinc-400">Role</span>
                    <span className="font-medium text-zinc-900">{selectedUserDetail.role}</span>

                    <span className="text-zinc-400">Joined</span>
                    <span className="font-medium text-zinc-900">
                      {selectedUserDetail.registration_date} (32 days ago)
                    </span>

                    <span className="text-zinc-400">Last login</span>
                    <span className="font-medium text-zinc-900 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      {selectedUserDetail.last_login}
                    </span>

                    <span className="text-zinc-400">User ID</span>
                    <span className="font-mono text-[10px] text-zinc-700">
                      {selectedUserDetail.user_id_display}
                    </span>
                  </div>
                </div>

                {/* 2. Subscription */}
                <div className="p-3.5 bg-zinc-50/70 rounded-xl space-y-2 border border-zinc-100">
                  <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/60">
                    <span className="font-bold text-zinc-900 text-xs">Subscription</span>
                    <button
                      type="button"
                      className="text-[11px] text-zinc-600 hover:text-zinc-900 font-medium"
                    >
                      Change plan
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
                    <span className="text-zinc-400">Plan</span>
                    <span className="font-medium text-zinc-900">{selectedUserDetail.plan}</span>

                    <span className="text-zinc-400">Status</span>
                    <span className="font-medium text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                      {selectedUserDetail.billing_status}
                    </span>

                    <span className="text-zinc-400">Users</span>
                    <span className="font-medium text-zinc-900">
                      {selectedUserDetail.users_count}
                    </span>

                    <span className="text-zinc-400">Renews on</span>
                    <span className="font-medium text-zinc-900">
                      {selectedUserDetail.renewal_date}
                    </span>

                    <span className="text-zinc-400">Monthly cost</span>
                    <span className="font-medium text-zinc-900">
                      ${selectedUserDetail.monthly_cost.toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* 3. Connected stores */}
                <div className="p-3.5 bg-zinc-50/70 rounded-xl space-y-2 border border-zinc-100">
                  <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/60">
                    <span className="font-bold text-zinc-900 text-xs">Connected stores (1)</span>
                    <button
                      type="button"
                      className="text-[11px] text-zinc-600 hover:text-zinc-900 font-medium"
                    >
                      View all
                    </button>
                  </div>
                  {selectedUserDetail.stores.map((store) => (
                    <div key={store.url} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                          S
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-900 leading-tight">{store.name}</p>
                          <p className="text-[10px] text-zinc-400">{store.url}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                        {store.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 4. Usage (Current billing cycle) */}
                <div className="p-3.5 bg-zinc-50/70 rounded-xl space-y-2.5 border border-zinc-100">
                  <div className="flex items-center justify-between pb-1 border-b border-zinc-200/60">
                    <span className="font-bold text-zinc-900 text-xs">
                      Usage (Current billing cycle)
                    </span>
                    <button
                      type="button"
                      className="text-[11px] text-zinc-600 hover:text-zinc-900 font-medium"
                    >
                      View usage
                    </button>
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <div className="flex justify-between text-zinc-600 mb-1">
                        <span>Product searches</span>
                        <span className="font-medium text-zinc-900">
                          {selectedUserDetail.usage.product_searches.toLocaleString()} /{' '}
                          {selectedUserDetail.usage.product_searches_limit.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#EA580C] h-full rounded-full"
                          style={{
                            width: `${(selectedUserDetail.usage.product_searches / selectedUserDetail.usage.product_searches_limit) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-zinc-600 mb-1">
                        <span>AI credits</span>
                        <span className="font-medium text-zinc-900">
                          {selectedUserDetail.usage.ai_credits.toLocaleString()} /{' '}
                          {selectedUserDetail.usage.ai_credits_limit.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#EA580C] h-full rounded-full"
                          style={{
                            width: `${(selectedUserDetail.usage.ai_credits / selectedUserDetail.usage.ai_credits_limit) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-zinc-600 mb-1">
                        <span>Ad generations</span>
                        <span className="font-medium text-zinc-900">
                          {selectedUserDetail.usage.ad_generations.toLocaleString()} /{' '}
                          {selectedUserDetail.usage.ad_generations_limit.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-zinc-200 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#EA580C] h-full rounded-full"
                          style={{
                            width: `${(selectedUserDetail.usage.ad_generations / selectedUserDetail.usage.ad_generations_limit) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Recent activity */}
                <div className="p-3.5 bg-zinc-50/70 rounded-xl space-y-2 border border-zinc-100">
                  <div className="flex items-center justify-between pb-1.5 border-b border-zinc-200/60">
                    <span className="font-bold text-zinc-900 text-xs">Recent activity</span>
                    <button
                      type="button"
                      className="text-[11px] text-zinc-600 hover:text-zinc-900 font-medium"
                    >
                      View all
                    </button>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    {selectedUserDetail.recent_activity.slice(0, 3).map((act) => (
                      <div key={act.id} className="flex items-center justify-between text-zinc-600">
                        <span className="flex items-center gap-1.5 text-zinc-800 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                          {act.activity}
                        </span>
                        <div className="flex items-center gap-3 text-[10px] text-zinc-400">
                          <span>{act.timestamp}</span>
                          <span>{act.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ACTIVITY */}
            {drawerTab === 'activity' && (
              <div className="space-y-3 text-xs">
                <div className="divide-y divide-zinc-100">
                  {selectedUserDetail.recent_activity.map((act) => (
                    <div key={act.id} className="py-2.5 space-y-1">
                      <div className="flex items-center justify-between font-medium text-zinc-900">
                        <span>{act.activity}</span>
                        <span className="text-[10px] text-zinc-400">{act.date_time}</span>
                      </div>
                      <p className="text-[11px] text-zinc-500">{act.details}</p>
                      <p className="text-[10px] text-zinc-400">
                        IP: {act.ip_address} · {act.location}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB CONTENT: SECURITY */}
            {drawerTab === 'security' && (
              <div className="space-y-3 text-xs">
                <div className="p-3 bg-zinc-50 rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Email verification</span>
                    <span className="font-semibold text-emerald-600">Verified</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Two-Factor Authentication</span>
                    <span className="font-semibold text-emerald-600">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Last password change</span>
                    <span className="text-zinc-800">45 days ago</span>
                  </div>
                </div>
              </div>
            )}

            {/* Drawer Actions Footer (Matching Figma Exactly) */}
            <div className="pt-3 border-t border-zinc-100 grid grid-cols-2 gap-2 text-xs">
              <Link
                href={`/admin/users/${selectedUserDetail.id}`}
                className="w-full text-center py-2 px-3 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-semibold transition"
              >
                View account
              </Link>
              <button
                type="button"
                onClick={() =>
                  handleStatusToggle(
                    selectedUserDetail.id,
                    selectedUserDetail.status === 'Active' ? 'Suspended' : 'Active',
                  )
                }
                className="w-full py-2 px-3 rounded-xl border border-orange-300 text-orange-700 hover:bg-orange-50 font-semibold transition flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{selectedUserDetail.status === 'Active' ? 'Suspend' : 'Activate'}</span>
              </button>
              <button
                type="button"
                className="w-full py-2 px-3 rounded-xl border border-zinc-200 text-zinc-700 hover:bg-zinc-50 font-semibold transition"
              >
                Change plan
              </button>
              <button
                type="button"
                onClick={() => handleResetAccess(selectedUserDetail.id)}
                className="w-full py-2 px-3 rounded-xl bg-red-600 text-white hover:bg-red-700 font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Reset access</span>
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
