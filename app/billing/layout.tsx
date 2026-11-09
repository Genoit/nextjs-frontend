'use client';

import type { ReactNode } from 'react';
import { BrandLogo } from '../../components/Icons';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useStudioTheme } from '../../lib/theme';

/** Billing stands alone, like a checkout: no app sidebar or header, only the mark and a way back. */
export default function BillingLayout({ children }: { children: ReactNode }) {
  // Like the studio shells: data-theme here swaps white/black so text-white reads in light mode.
  const theme = useStudioTheme();
  return (
    <div
      data-theme={theme}
      className="min-h-dvh bg-studio-ground font-sans text-studio-text antialiased selection:bg-trend-orange selection:text-on-accent"
    >
      <header className="sticky top-0 z-50 border-b border-white/[0.06] bg-studio-ground/80 backdrop-blur-xl transition-all">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-lg transition-opacity hover:opacity-85 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-trend-orange"
          >
            <BrandLogo className="h-7" priority />
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] px-3.5 text-xs font-semibold text-studio-muted transition-all duration-200 hover:border-white/20 hover:bg-white/5 hover:text-white focus-visible:outline-2 focus-visible:outline-trend-orange"
          >
            <ArrowLeft className="size-3.5" strokeWidth={2} aria-hidden />
            <span>Back to Studio</span>
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
