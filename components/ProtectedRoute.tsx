'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';

export default function ProtectedRoute({
  children,
  requireAdmin = false,
}: {
  children: React.ReactNode;
  requireAdmin?: boolean;
}) {
  const { isAuthenticated, isLoading, user } = useAuth();
  // UX guard only: the backend enforces admin access on /api/v1/admin/*
  const forbidden = requireAdmin && isAuthenticated && !user?.is_admin;
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && forbidden) {
      router.replace('/dashboard');
    }
  }, [isLoading, isAuthenticated, forbidden, router]);

  if (isLoading) {
    return (
      <div className="flex flex-1 items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
          <p className="text-sm text-zinc-500">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || forbidden) {
    return null;
  }

  return <>{children}</>;
}
