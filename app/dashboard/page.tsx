'use client';

import React from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/auth';

export default function DashboardPage() {
  const { user, logout } = useAuth();

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between border-b border-zinc-200 pb-6 dark:border-zinc-800">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold leading-7 text-zinc-900 sm:truncate sm:text-3xl sm:tracking-tight dark:text-white">
              Dashboard
            </h1>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Welcome to your TrendED UGC Workspace
            </p>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0">
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center rounded-md bg-white px-3.5 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-zinc-300 hover:bg-zinc-50 dark:bg-zinc-800 dark:text-zinc-200 dark:ring-zinc-700 dark:hover:bg-zinc-700 transition"
            >
              Sign out
            </button>
          </div>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* User Profile Card */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-base font-semibold leading-6 text-zinc-900 dark:text-white">
              User Profile
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Your authenticated account details
            </p>

            <dl className="mt-6 divide-y divide-zinc-100 text-sm leading-6 dark:divide-zinc-800">
              <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-zinc-900 dark:text-zinc-300">Full name</dt>
                <dd className="mt-1 text-zinc-700 sm:col-span-2 sm:mt-0 dark:text-zinc-400">
                  {user?.first_name} {user?.last_name}
                </dd>
              </div>
              <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-zinc-900 dark:text-zinc-300">Email</dt>
                <dd className="mt-1 text-zinc-700 sm:col-span-2 sm:mt-0 dark:text-zinc-400">
                  {user?.email}
                </dd>
              </div>
              <div className="py-3 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="font-medium text-zinc-900 dark:text-zinc-300">User ID</dt>
                <dd className="mt-1 font-mono text-xs text-zinc-600 sm:col-span-2 sm:mt-0 dark:text-zinc-400">
                  {user?.id}
                </dd>
              </div>
            </dl>
          </div>

          {/* Session & Sprint 1 Status Card */}
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
            <h2 className="text-base font-semibold leading-6 text-zinc-900 dark:text-white">
              Sprint 1 Status
            </h2>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Authentication & Session Verification
            </p>

            <div className="mt-6 space-y-4">
              <div className="flex items-center gap-3">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
                <span className="text-sm font-medium text-zinc-800 dark:text-zinc-200">
                  JWT Session Active
                </span>
              </div>

              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                End-to-end authentication is working between Next.js, FastAPI, SQLAlchemy, and
                PostgreSQL.
              </p>

              <div className="rounded-lg bg-zinc-50 p-3 border border-zinc-200 dark:bg-zinc-800/50 dark:border-zinc-750 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                <p>
                  ✓ Register endpoint:{' '}
                  <code className="font-mono text-[#E85022]">/api/v1/auth/register</code>
                </p>
                <p>
                  ✓ Login endpoint:{' '}
                  <code className="font-mono text-[#E85022]">/api/v1/auth/login</code>
                </p>
                <p>
                  ✓ Me endpoint: <code className="font-mono text-[#E85022]">/api/v1/auth/me</code>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
