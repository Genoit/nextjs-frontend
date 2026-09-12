'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/auth';

export default function Home() {
  const { isAuthenticated, user, isLoading } = useAuth();

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-20 text-center sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-600" />
          TrendED MVP — Sprint 1
        </div>

        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-white sm:text-6xl">
          AI-Powered UGC Videos for{' '}
          <span className="text-indigo-600 dark:text-indigo-400">E-commerce</span>
        </h1>

        <p className="mx-auto max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
          Scale your TikTok and Instagram ads with hyper-engaging UGC video ads generated
          effortlessly. Authenticate now to enter the creator workspace.
        </p>

        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          {isLoading ? (
            <div className="h-11 w-36 animate-pulse rounded-lg bg-zinc-200 dark:bg-zinc-800" />
          ) : isAuthenticated ? (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/dashboard"
                className="rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 transition"
              >
                Go to Dashboard ({user?.first_name})
              </Link>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Link
                href="/register"
                className="rounded-lg bg-indigo-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-indigo-500 transition shadow-indigo-200 dark:shadow-none"
              >
                Get started for free
              </Link>
              <Link
                href="/login"
                className="rounded-lg border border-zinc-300 bg-white px-6 py-3 text-base font-semibold text-zinc-800 shadow-sm hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800 transition"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>

        <div className="pt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 text-left border-t border-zinc-200 dark:border-zinc-800">
          <div className="rounded-lg p-4 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Secure Auth</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Stateless JWT authentication with bcrypt password hashing and UUID user mapping.
            </p>
          </div>
          <div className="rounded-lg p-4 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Robust Backend</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              FastAPI, SQLAlchemy 2.0, Alembic migrations, and PostgreSQL 17.
            </p>
          </div>
          <div className="rounded-lg p-4 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-800">
            <h3 className="font-semibold text-zinc-900 dark:text-white">Next.js App Router</h3>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Clean client state with AuthProvider, ProtectedRoute, and TailwindCSS design.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
