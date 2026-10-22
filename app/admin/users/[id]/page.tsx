'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ChevronRight,
  Copy,
  Check,
  Edit2,
  ChevronDown,
  Calendar,
  Clock,
  User as UserIcon,
  Mail,
  ShieldCheck,
  CreditCard,
  Activity,
  Store,
  ExternalLink,
  ShieldAlert,
  KeyRound,
  FileText,
  Sparkles,
  Search as SearchIcon,
  Megaphone,
  LogIn,
} from 'lucide-react';
import {
  fetchAdminUserDetail,
  updateAdminUserStatus,
  resetAdminUserAccess,
} from '../../../../lib/api/admin';
import { AdminUserDetail } from '../../../../lib/types/admin';

export default function AdminUserDetailPage() {
  const params = useParams();
  const userId = (params?.id as string) || 'usr_8f3a2d6e7c1b4a9d';

  const [userDetail, setUserDetail] = useState<AdminUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const detail = await fetchAdminUserDetail(userId);
        setUserDetail(detail);
      } catch (err) {
        console.error('Failed to load user detail', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [userId]);

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStatusToggle = async () => {
    if (!userDetail) return;
    const newStatus = userDetail.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await updateAdminUserStatus(userDetail.id, newStatus);
      setUserDetail({ ...userDetail, status: newStatus });
      setActionMessage(`User account status updated to ${newStatus}`);
      setTimeout(() => setActionMessage(null), 3000);
    } catch {
      // ignore
    }
  };

  const handleResetPassword = async () => {
    if (!userDetail) return;
    try {
      await resetAdminUserAccess(userDetail.id);
      setActionMessage('Password reset link sent to user email address');
      setTimeout(() => setActionMessage(null), 3000);
    } catch {
      // ignore
    }
  };

  if (loading || !userDetail) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-3 border-[#EA580C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Action Toast */}
      {actionMessage && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* BREADCRUMB NAVIGATION */}
      {/* ========================================================= */}
      <nav className="flex items-center gap-2 text-xs text-zinc-400 font-medium select-none">
        <Link href="/admin/overview" className="hover:text-zinc-700 transition">
          Admin
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
        <Link href="/admin/users" className="hover:text-zinc-700 transition">
          Users
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-zinc-300" />
        <span className="text-[#EA580C] font-semibold">{userDetail.name}</span>
      </nav>

      {/* ========================================================= */}
      {/* USER PROFILE HEADER CARD */}
      {/* ========================================================= */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-zinc-100">
          {/* Avatar & Identifiers */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-full bg-zinc-100 text-zinc-800 font-bold text-lg flex items-center justify-center border border-zinc-200 shrink-0">
                {userDetail.initials}
              </div>
              <span className="absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-zinc-900 tracking-tight">
                  {userDetail.name}
                </h1>
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    userDetail.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-rose-50 text-rose-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      userDetail.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                    }`}
                  />
                  {userDetail.status}
                </span>
              </div>

              <div className="flex items-center gap-4 flex-wrap text-xs text-zinc-500">
                <div className="flex items-center gap-1.5">
                  <span>{userDetail.email}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(userDetail.email, 'email')}
                    className="text-zinc-400 hover:text-zinc-700 p-0.5"
                    title="Copy email"
                  >
                    {copiedField === 'email' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-zinc-400">User ID:</span>
                  <span className="font-mono text-zinc-700">{userDetail.user_id_display}</span>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(userDetail.user_id_display, 'id')}
                    className="text-zinc-400 hover:text-zinc-700 p-0.5"
                    title="Copy User ID"
                  >
                    {copiedField === 'id' ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Edit User Button */}
          <div className="relative">
            <button
              type="button"
              className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-zinc-200/90 shadow-2xs hover:bg-zinc-50 text-xs font-semibold text-zinc-700 transition"
            >
              <Edit2 className="w-3.5 h-3.5 text-zinc-500" />
              <span>Edit User</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400 ml-1" />
            </button>
          </div>
        </div>

        {/* 5 Metadata Columns */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-xs">
          {/* 1. Registration date */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Calendar className="w-3.5 h-3.5" />
              <span>Registration date</span>
            </div>
            <p className="font-semibold text-zinc-900 leading-snug">
              {userDetail.registration_date}
            </p>
          </div>

          {/* 2. Last login */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Last login</span>
            </div>
            <p className="font-semibold text-zinc-900 leading-snug">{userDetail.last_login}</p>
          </div>

          {/* 3. User role */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <UserIcon className="w-3.5 h-3.5" />
              <span>User role</span>
            </div>
            <p className="font-semibold text-zinc-900">{userDetail.role}</p>
            <p className="text-[10px] text-zinc-400">Standard Access</p>
          </div>

          {/* 4. Email status */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <Mail className="w-3.5 h-3.5" />
              <span>Email status</span>
            </div>
            <p className="font-semibold text-emerald-600 flex items-center gap-1">
              <span>{userDetail.email_status}</span>
            </p>
          </div>

          {/* 5. Two-factor auth */}
          <div className="space-y-1">
            <div className="flex items-center gap-1.5 text-zinc-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Two-factor auth</span>
            </div>
            <p className="font-semibold text-emerald-600 flex items-center gap-1">
              <span>Enabled</span>
            </p>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 1: SUBSCRIPTION, USAGE, CONNECTED STORES */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Subscription */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 font-bold text-xs text-zinc-900">
              <CreditCard className="w-4 h-4 text-zinc-500" />
              <span>Subscription</span>
            </div>

            <div className="space-y-2.5 mt-4 text-xs">
              <div className="flex justify-between">
                <span className="text-zinc-500">Current plan</span>
                <span className="font-bold text-zinc-900">{userDetail.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Billing status</span>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-50 text-emerald-700">
                  {userDetail.billing_status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Renewal date</span>
                <span className="font-medium text-zinc-900">{userDetail.renewal_date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500">Price</span>
                <span className="font-bold text-zinc-900">
                  ${userDetail.monthly_cost.toFixed(2)} / month
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/admin/subscriptions"
            className="w-full text-center py-2 px-3 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
          >
            View Subscription
          </Link>
        </div>

        {/* Card 2: Usage */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2 font-bold text-xs text-zinc-900">
                <Activity className="w-4 h-4 text-zinc-500" />
                <span>Usage</span>
              </div>
              <span className="text-[10px] text-zinc-400">
                Resets on {userDetail.usage.resets_on}
              </span>
            </div>

            <div className="space-y-2.5 mt-4 text-xs">
              {/* Product research */}
              <div>
                <div className="flex justify-between text-zinc-600 mb-1">
                  <span>Product research</span>
                  <span className="font-medium text-zinc-900">
                    {userDetail.usage.product_searches} / {userDetail.usage.product_searches_limit}
                  </span>
                </div>
                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-zinc-300 h-full rounded-full"
                    style={{
                      width: `${(userDetail.usage.product_searches / userDetail.usage.product_searches_limit) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* AI generations */}
              <div>
                <div className="flex justify-between text-zinc-600 mb-1">
                  <span>AI generations</span>
                  <span className="font-medium text-zinc-900">
                    {userDetail.usage.ai_credits.toLocaleString()} /{' '}
                    {userDetail.usage.ai_credits_limit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#EA580C] h-full rounded-full"
                    style={{
                      width: `${(userDetail.usage.ai_credits / userDetail.usage.ai_credits_limit) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Creative exports */}
              <div>
                <div className="flex justify-between text-zinc-600 mb-1">
                  <span>Creative exports</span>
                  <span className="font-medium text-zinc-900">
                    {userDetail.usage.creative_exports} / {userDetail.usage.creative_exports_limit}
                  </span>
                </div>
                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#EA580C] h-full rounded-full"
                    style={{
                      width: `${(userDetail.usage.creative_exports / userDetail.usage.creative_exports_limit) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* API calls */}
              <div>
                <div className="flex justify-between text-zinc-600 mb-1">
                  <span>API calls</span>
                  <span className="font-medium text-zinc-900">
                    {userDetail.usage.api_calls.toLocaleString()} /{' '}
                    {userDetail.usage.api_calls_limit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-zinc-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="bg-[#EA580C] h-full rounded-full"
                    style={{
                      width: `${(userDetail.usage.api_calls / userDetail.usage.api_calls_limit) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="w-full py-2 px-3 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
          >
            View Usage Details
          </button>
        </div>

        {/* Card 3: Connected stores */}
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-100 font-bold text-xs text-zinc-900">
              <Store className="w-4 h-4 text-zinc-500" />
              <span>Connected stores</span>
            </div>

            <div className="mt-4 space-y-3">
              {userDetail.stores.map((store) => (
                <div key={store.url} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs flex items-center justify-center">
                        S
                      </div>
                      <span className="font-bold text-zinc-900 text-xs">{store.platform}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                      {store.status}
                    </span>
                  </div>

                  <a
                    href={`https://${store.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-800 transition"
                  >
                    <span>{store.url}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400" />
                  </a>

                  <div className="text-[11px] text-zinc-400">
                    Connected on: {store.connected_at}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            type="button"
            className="w-full py-2 px-3 rounded-xl border border-zinc-200 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 transition"
          >
            View Stores
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 2: RECENT ACTIVITY & ADMIN ACTIONS */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Recent Activity Table (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div className="flex items-center gap-2 font-bold text-sm text-zinc-900">
              <Clock className="w-4 h-4 text-zinc-500" />
              <span>Recent activity</span>
            </div>
            <Link
              href="/admin/system-logs"
              className="text-xs font-medium text-[#EA580C] hover:underline"
            >
              View all activity
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-100">
                <tr>
                  <th className="pb-2.5">Activity</th>
                  <th className="pb-2.5">Details</th>
                  <th className="pb-2.5">IP Address</th>
                  <th className="pb-2.5 text-right">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {userDetail.recent_activity.map((act) => {
                  let Icon = LogIn;
                  let iconBg = 'bg-emerald-50 text-emerald-600';

                  if (act.activity.includes('Product')) {
                    Icon = SearchIcon;
                    iconBg = 'bg-blue-50 text-blue-600';
                  } else if (act.activity.includes('Creative')) {
                    Icon = Sparkles;
                    iconBg = 'bg-purple-50 text-purple-600';
                  } else if (act.activity.includes('Campaign')) {
                    Icon = Megaphone;
                    iconBg = 'bg-orange-50 text-[#EA580C]';
                  }

                  return (
                    <tr key={act.id} className="hover:bg-zinc-50/70 transition">
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 ${iconBg}`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-semibold text-zinc-900">{act.activity}</span>
                        </div>
                      </td>
                      <td className="py-3 text-zinc-600">{act.details}</td>
                      <td className="py-3 font-mono text-[11px] text-zinc-500">{act.ip_address}</td>
                      <td className="py-3 text-right text-zinc-500 text-[11px]">{act.date_time}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right: Admin Actions (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-zinc-100 font-bold text-sm text-zinc-900 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-zinc-500" />
            <span>Admin actions</span>
          </div>

          <div className="space-y-2.5">
            {/* 1. Suspend account */}
            <button
              type="button"
              onClick={handleStatusToggle}
              className="w-full text-left p-3.5 rounded-xl border border-rose-100 bg-rose-50/50 hover:bg-rose-50 transition flex items-start gap-3 group"
            >
              <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-rose-900">
                  {userDetail.status === 'Active' ? 'Suspend account' : 'Activate account'}
                </p>
                <p className="text-[11px] text-rose-600/80 mt-0.5">
                  Temporarily suspend this user&apos;s access
                </p>
              </div>
            </button>

            {/* 2. Change subscription */}
            <Link
              href="/admin/subscriptions"
              className="w-full text-left p-3.5 rounded-xl border border-amber-100 bg-amber-50/50 hover:bg-amber-50 transition flex items-start gap-3 group block"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-amber-900">Change subscription</p>
                <p className="text-[11px] text-amber-700/80 mt-0.5">
                  Update user&apos;s plan or billing
                </p>
              </div>
            </Link>

            {/* 3. Reset password */}
            <button
              type="button"
              onClick={handleResetPassword}
              className="w-full text-left p-3.5 rounded-xl border border-blue-100 bg-blue-50/50 hover:bg-blue-50 transition flex items-start gap-3 group"
            >
              <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-blue-900">Reset password</p>
                <p className="text-[11px] text-blue-600/80 mt-0.5">
                  Send password reset link to user
                </p>
              </div>
            </button>

            {/* 4. View activity */}
            <Link
              href="/admin/system-logs"
              className="w-full text-left p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-100/70 transition flex items-start gap-3 group block"
            >
              <div className="w-7 h-7 rounded-lg bg-zinc-200 text-zinc-700 flex items-center justify-center shrink-0">
                <FileText className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900">View activity</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">See all user activity logs</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
