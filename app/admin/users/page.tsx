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
        <div className="fixed top-5 right-5 z-50 bg-success text-on-accent text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in duration-200">
          <Check className="w-4 h-4" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* PAGE HEADER */}
      {/* ========================================================= */}
      <div>
        <h1 className="text-2xl sm:text-[26px] font-bold tracking-tight text-ink">Users</h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-0.5">
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
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ink-muted" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users by name or email..."
              className="w-full rounded-xl border border-line/90 bg-studio-ground py-2 pl-9 pr-3 text-xs text-ink placeholder-ink-muted shadow-2xs focus:border-trend-orange focus:ring-1 focus:ring-trend-orange transition"
            />
          </div>

          {/* Status Filter Dropdown */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-studio-ground border border-line/90 rounded-xl px-3.5 py-2 pr-8 text-xs font-medium text-ink-soft shadow-2xs cursor-pointer hover:bg-studio-surface focus:border-trend-orange transition"
            >
              <option value="All status">All status</option>
              <option value="Active">Active</option>
              <option value="Suspended">Suspended</option>
              <option value="Pending">Pending</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted" />
          </div>
        </div>

        {/* Export Button */}
        <button
          type="button"
          onClick={() => alert('Exporting users to CSV...')}
          className="flex items-center justify-center gap-1.5 px-3.5 py-2 bg-studio-ground rounded-xl border border-line/90 shadow-2xs hover:bg-studio-surface text-xs font-semibold text-ink-soft transition"
        >
          <Download className="w-3.5 h-3.5 text-ink-muted" />
          <span>Export</span>
        </button>
      </div>

      {/* ========================================================= */}
      {/* MAIN LAYOUT: TABLE (LEFT) + DRAWER (RIGHT) */}
      {/* ========================================================= */}
      <div className="flex gap-6 items-start">
        {/* USERS TABLE */}
        <div
          className={`bg-studio-ground rounded-2xl border border-line/80 shadow-2xs overflow-hidden transition-all duration-300 ${
            drawerOpen && selectedUserDetail ? 'w-full lg:w-3/5' : 'w-full'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-cream border-b border-line text-ink-muted text-[11px] font-semibold uppercase tracking-wider select-none">
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
              <tbody className="divide-y divide-line font-normal">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-ink-muted">
                      Loading users...
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-ink-muted">
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
                        className={`hover:bg-studio-surface/80 cursor-pointer transition ${
                          isSelected ? 'bg-cream/40' : ''
                        }`}
                      >
                        {/* User info */}
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-studio-raised text-ink-soft font-bold text-xs flex items-center justify-center shrink-0 border border-line/60">
                              {user.initials}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-ink truncate">{user.name}</p>
                              <p className="text-[11px] text-ink-muted truncate">{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Plan */}
                        <td className="py-3 px-3">
                          <span className="font-medium text-ink-soft">{user.plan}</span>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-3">
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${
                              user.status === 'Active'
                                ? 'bg-success-soft text-success'
                                : user.status === 'Suspended'
                                  ? 'bg-danger-soft text-danger'
                                  : 'bg-warning-soft text-warning'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                user.status === 'Active'
                                  ? 'bg-success'
                                  : user.status === 'Suspended'
                                    ? 'bg-danger'
                                    : 'bg-warning'
                              }`}
                            />
                            {user.status}
                          </span>
                        </td>

                        {/* Store */}
                        <td className="py-3 px-3 hidden sm:table-cell">
                          <span className="text-ink-soft font-medium">{user.store}</span>
                        </td>

                        {/* Last activity */}
                        <td className="py-3 px-3 hidden md:table-cell text-ink-muted text-[11px]">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                            {user.last_activity}
                          </span>
                        </td>

                        {/* Created */}
                        <td className="py-3 px-3 hidden lg:table-cell text-ink-muted text-[11px]">
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
                            className="p-1 rounded-lg text-ink-muted hover:text-ink-soft hover:bg-studio-raised"
                            aria-label="Actions"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>

                          {activeMenuId === user.id && (
                            <div className="absolute right-4 top-8 w-44 bg-studio-ground rounded-xl shadow-xl border border-line/90 py-1 z-30 animate-in fade-in">
                              <Link
                                href={`/admin/users/${user.id}`}
                                className="block px-3 py-1.5 text-xs text-ink-soft hover:bg-studio-surface text-left"
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
                                className="w-full px-3 py-1.5 text-xs text-ink-soft hover:bg-studio-surface text-left"
                              >
                                {user.status === 'Active' ? 'Suspend account' : 'Activate account'}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  handleResetAccess(user.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full px-3 py-1.5 text-xs text-ink-soft hover:bg-studio-surface text-left"
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
          <div className="px-4 py-3 border-t border-line flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-xs text-ink-muted">
            <div>
              Showing 1 to {Math.min(pageSize, users.length)} of {totalUsers} users
            </div>

            <div className="flex items-center gap-1 self-center">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="p-1.5 rounded-lg border border-line disabled:opacity-40 hover:bg-studio-surface"
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
                      ? 'bg-cream text-trend-orange border border-trend-orange/20'
                      : 'text-ink-soft hover:bg-studio-surface'
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                type="button"
                disabled={currentPage >= 5}
                onClick={() => setCurrentPage((p) => p + 1)}
                className="p-1.5 rounded-lg border border-line disabled:opacity-40 hover:bg-studio-surface"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span>Rows per page</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-line rounded-lg px-2 py-1 text-xs bg-studio-ground"
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
          <aside className="w-full lg:w-2/5 bg-studio-ground rounded-2xl border border-line/80 shadow-2xs p-5 space-y-5 animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="flex items-start justify-between pb-3 border-b border-line">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-studio-raised text-ink font-bold text-sm flex items-center justify-center border border-line">
                  {selectedUserDetail.initials}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-sm font-bold text-ink">{selectedUserDetail.name}</h2>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-success-soft text-success">
                      <span className="w-1.5 h-1.5 rounded-full bg-success" />
                      {selectedUserDetail.status}
                    </span>
                  </div>
                  <p className="text-[11px] text-ink-muted">{selectedUserDetail.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setDrawerOpen(false)}
                className="p-1 text-ink-muted hover:text-ink-soft rounded-lg hover:bg-studio-raised"
                aria-label="Close drawer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Tabs */}
            <div className="flex border-b border-line text-xs font-semibold">
              <button
                type="button"
                onClick={() => setDrawerTab('overview')}
                className={`pb-2.5 px-3 border-b-2 transition ${
                  drawerTab === 'overview'
                    ? 'border-trend-orange text-trend-orange'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`}
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('activity')}
                className={`pb-2.5 px-3 border-b-2 transition ${
                  drawerTab === 'activity'
                    ? 'border-trend-orange text-trend-orange'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`}
              >
                Activity
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('security')}
                className={`pb-2.5 px-3 border-b-2 transition ${
                  drawerTab === 'security'
                    ? 'border-trend-orange text-trend-orange'
                    : 'border-transparent text-ink-muted hover:text-ink'
                }`}
              >
                Security
              </button>
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {drawerTab === 'overview' && (
              <div className="space-y-4 text-xs">
                {/* 1. Account information */}
                <div className="p-3.5 bg-studio-surface/70 rounded-xl space-y-2 border border-line">
                  <div className="flex items-center justify-between pb-1.5 border-b border-line/60">
                    <span className="font-bold text-ink text-xs">Account information</span>
                    <button
                      type="button"
                      className="text-[11px] text-ink-soft hover:text-ink flex items-center gap-1 font-medium"
                    >
                      <Edit2 className="w-3 h-3 text-ink-muted" />
                      Edit
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1.5 text-ink-soft text-[11px]">
                    <span className="text-ink-muted">Full name</span>
                    <span className="font-medium text-ink">{selectedUserDetail.name}</span>

                    <span className="text-ink-muted">Email</span>
                    <span className="font-medium text-ink truncate">
                      {selectedUserDetail.email}
                    </span>

                    <span className="text-ink-muted">Role</span>
                    <span className="font-medium text-ink">{selectedUserDetail.role}</span>

                    <span className="text-ink-muted">Joined</span>
                    <span className="font-medium text-ink">
                      {selectedUserDetail.registration_date} (32 days ago)
                    </span>

                    <span className="text-ink-muted">Last login</span>
                    <span className="font-medium text-ink flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                      {selectedUserDetail.last_login}
                    </span>

                    <span className="text-ink-muted">User ID</span>
                    <span className="font-mono text-[10px] text-ink-soft">
                      {selectedUserDetail.user_id_display}
                    </span>
                  </div>
                </div>

                {/* 2. Subscription */}
                <div className="p-3.5 bg-studio-surface/70 rounded-xl space-y-2 border border-line">
                  <div className="flex items-center justify-between pb-1.5 border-b border-line/60">
                    <span className="font-bold text-ink text-xs">Subscription</span>
                    <button
                      type="button"
                      className="text-[11px] text-ink-soft hover:text-ink font-medium"
                    >
                      Change plan
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-y-1.5 text-[11px]">
                    <span className="text-ink-muted">Plan</span>
                    <span className="font-medium text-ink">{selectedUserDetail.plan}</span>

                    <span className="text-ink-muted">Status</span>
                    <span className="font-medium text-success flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                      {selectedUserDetail.billing_status}
                    </span>

                    <span className="text-ink-muted">Users</span>
                    <span className="font-medium text-ink">{selectedUserDetail.users_count}</span>

                    <span className="text-ink-muted">Renews on</span>
                    <span className="font-medium text-ink">{selectedUserDetail.renewal_date}</span>

                    <span className="text-ink-muted">Monthly cost</span>
                    <span className="font-medium text-ink">
                      ${selectedUserDetail.monthly_cost.toFixed(2)} USD
                    </span>
                  </div>
                </div>

                {/* 3. Connected stores */}
                <div className="p-3.5 bg-studio-surface/70 rounded-xl space-y-2 border border-line">
                  <div className="flex items-center justify-between pb-1.5 border-b border-line/60">
                    <span className="font-bold text-ink text-xs">Connected stores (1)</span>
                    <button
                      type="button"
                      className="text-[11px] text-ink-soft hover:text-ink font-medium"
                    >
                      View all
                    </button>
                  </div>
                  {selectedUserDetail.stores.map((store) => (
                    <div key={store.url} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-success-soft text-success flex items-center justify-center font-bold text-[10px]">
                          S
                        </div>
                        <div>
                          <p className="font-semibold text-ink leading-tight">{store.name}</p>
                          <p className="text-[10px] text-ink-muted">{store.url}</p>
                        </div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-success-soft text-success">
                        {store.status}
                      </span>
                    </div>
                  ))}
                </div>

                {/* 4. Usage (Current billing cycle) */}
                <div className="p-3.5 bg-studio-surface/70 rounded-xl space-y-2.5 border border-line">
                  <div className="flex items-center justify-between pb-1 border-b border-line/60">
                    <span className="font-bold text-ink text-xs">
                      Usage (Current billing cycle)
                    </span>
                    <button
                      type="button"
                      className="text-[11px] text-ink-soft hover:text-ink font-medium"
                    >
                      View usage
                    </button>
                  </div>

                  {/* Progress bars */}
                  <div className="space-y-2 text-[11px]">
                    <div>
                      <div className="flex justify-between text-ink-soft mb-1">
                        <span>Product searches</span>
                        <span className="font-medium text-ink">
                          {selectedUserDetail.usage.product_searches.toLocaleString()} /{' '}
                          {selectedUserDetail.usage.product_searches_limit.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-studio-rule h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-trend-orange h-full rounded-full"
                          style={{
                            width: `${(selectedUserDetail.usage.product_searches / selectedUserDetail.usage.product_searches_limit) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-ink-soft mb-1">
                        <span>AI credits</span>
                        <span className="font-medium text-ink">
                          {selectedUserDetail.usage.ai_credits.toLocaleString()} /{' '}
                          {selectedUserDetail.usage.ai_credits_limit.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-studio-rule h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-trend-orange h-full rounded-full"
                          style={{
                            width: `${(selectedUserDetail.usage.ai_credits / selectedUserDetail.usage.ai_credits_limit) * 100}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-ink-soft mb-1">
                        <span>Ad generations</span>
                        <span className="font-medium text-ink">
                          {selectedUserDetail.usage.ad_generations.toLocaleString()} /{' '}
                          {selectedUserDetail.usage.ad_generations_limit.toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-studio-rule h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-trend-orange h-full rounded-full"
                          style={{
                            width: `${(selectedUserDetail.usage.ad_generations / selectedUserDetail.usage.ad_generations_limit) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 5. Recent activity */}
                <div className="p-3.5 bg-studio-surface/70 rounded-xl space-y-2 border border-line">
                  <div className="flex items-center justify-between pb-1.5 border-b border-line/60">
                    <span className="font-bold text-ink text-xs">Recent activity</span>
                    <button
                      type="button"
                      className="text-[11px] text-ink-soft hover:text-ink font-medium"
                    >
                      View all
                    </button>
                  </div>
                  <div className="space-y-2 text-[11px]">
                    {selectedUserDetail.recent_activity.slice(0, 3).map((act) => (
                      <div key={act.id} className="flex items-center justify-between text-ink-soft">
                        <span className="flex items-center gap-1.5 text-ink font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-success inline-block" />
                          {act.activity}
                        </span>
                        <div className="flex items-center gap-3 text-[10px] text-ink-muted">
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
                <div className="divide-y divide-line">
                  {selectedUserDetail.recent_activity.map((act) => (
                    <div key={act.id} className="py-2.5 space-y-1">
                      <div className="flex items-center justify-between font-medium text-ink">
                        <span>{act.activity}</span>
                        <span className="text-[10px] text-ink-muted">{act.date_time}</span>
                      </div>
                      <p className="text-[11px] text-ink-muted">{act.details}</p>
                      <p className="text-[10px] text-ink-muted">
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
                <div className="p-3 bg-studio-surface rounded-xl space-y-2">
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Email verification</span>
                    <span className="font-semibold text-success">Verified</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Two-Factor Authentication</span>
                    <span className="font-semibold text-success">Enabled</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-muted">Last password change</span>
                    <span className="text-ink">45 days ago</span>
                  </div>
                </div>
              </div>
            )}

            {/* Drawer Actions Footer (Matching Figma Exactly) */}
            <div className="pt-3 border-t border-line grid grid-cols-2 gap-2 text-xs">
              <Link
                href={`/admin/users/${selectedUserDetail.id}`}
                className="w-full text-center py-2 px-3 rounded-xl border border-line text-ink-soft hover:bg-studio-surface font-semibold transition"
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
                className="w-full py-2 px-3 rounded-xl border border-trend-orange/20 text-trend-orange-strong hover:bg-cream font-semibold transition flex items-center justify-center gap-1.5"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>{selectedUserDetail.status === 'Active' ? 'Suspend' : 'Activate'}</span>
              </button>
              <button
                type="button"
                className="w-full py-2 px-3 rounded-xl border border-line text-ink-soft hover:bg-studio-surface font-semibold transition"
              >
                Change plan
              </button>
              <button
                type="button"
                onClick={() => handleResetAccess(selectedUserDetail.id)}
                className="w-full py-2 px-3 rounded-xl bg-danger text-on-accent hover:bg-danger font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
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
