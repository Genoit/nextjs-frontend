import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

/** Billing stands alone, like a checkout: no app sidebar or header, only the mark and a way back. */
export default function BillingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-studio-ground font-sans text-studio-text antialiased selection:bg-trend-orange selection:text-white">
      <header className="border-b border-studio-rule">
        <div className="mx-auto flex h-16 w-full max-w-[1100px] items-center justify-between px-4 sm:px-6">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-trend-orange"
          >
            <Image src="/symbol.png" alt="" width={26} height={26} className="object-contain" />
            <span className="text-[17px] font-semibold tracking-tight">TrendED</span>
          </Link>
          <Link
            href="/dashboard"
            className="-mr-3 inline-flex h-11 items-center gap-2 rounded-lg px-3 text-sm font-medium text-studio-muted transition-colors hover:bg-studio-surface hover:text-studio-text focus-visible:outline-2 focus-visible:outline-trend-orange"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Back to Studio
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
