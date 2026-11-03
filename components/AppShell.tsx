'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Clapperboard, LogOut, Menu, Package, Plus, X, Zap } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { billingApi, type BillingSummary } from '../lib/api/billing';
import { creditsText, isSubscribed, PLAN_LABEL } from '../lib/billing-rules.mjs';

const NAV = [
  { href: '/dashboard', label: 'Studio', icon: Clapperboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/product-input', label: 'New ad', icon: Plus },
];

/** Remaining credits + Upgrade, top right on every app screen. */
function CreditsBadge({ summary }: { summary: BillingSummary | null }) {
  if (!summary) return <span className="h-9 w-28 rounded-full bg-studio-surface" aria-hidden />;
  const subscribed = isSubscribed(summary);
  const low = summary.credits === 0;
  return (
    <Link
      href="/billing"
      className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-studio-rule bg-studio-ground pl-3 pr-1 text-sm transition hover:border-trend-orange focus-visible:outline-2 focus-visible:outline-trend-orange"
      aria-label={`${creditsText(summary.credits)} left. ${subscribed ? 'Manage plan' : 'Upgrade'}`}
    >
      <Zap
        className={`h-4 w-4 ${low ? 'text-danger' : 'text-trend-gold'}`}
        fill="currentColor"
        aria-hidden
      />
      <span className={`font-medium tabular-nums ${low ? 'text-danger' : 'text-studio-text'}`}>
        {creditsText(summary.credits)}
      </span>
      {subscribed ? (
        <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-trend-orange-strong">
          {PLAN_LABEL[summary.plan]}
        </span>
      ) : (
        <span className="rounded-full bg-cream px-2.5 py-1 text-xs font-semibold text-trend-orange-strong">
          Upgrade
        </span>
      )}
    </Link>
  );
}

/** Current plan, bottom of the sidebar. */
function PlanCard({
  summary,
  onNavigate,
}: {
  summary: BillingSummary | null;
  onNavigate?: () => void;
}) {
  if (!summary) return null;
  const subscribed = isSubscribed(summary);
  return (
    <div className="mx-3 mb-3 rounded-xl bg-cream p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-studio-text">{PLAN_LABEL[summary.plan]} plan</p>
        <p className="text-xs tabular-nums text-studio-muted">{creditsText(summary.credits)}</p>
      </div>
      {subscribed ? (
        <Link
          href="/billing"
          onClick={onNavigate}
          className="mt-2 inline-flex min-h-9 items-center text-sm font-medium text-trend-orange-strong hover:underline"
        >
          Manage plan
        </Link>
      ) : (
        <>
          <p className="mt-1 text-xs leading-relaxed text-studio-muted">
            Get monthly credits and keep creating ads.
          </p>
          <Link
            href="/billing"
            onClick={onNavigate}
            className="mt-1 inline-flex min-h-9 items-center gap-1.5 text-sm font-semibold text-trend-orange-strong underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-trend-orange"
          >
            See plans
            <ArrowRight className="h-3.5 w-3.5" aria-hidden />
          </Link>
        </>
      )}
    </div>
  );
}

function Sidebar({
  active,
  summary,
  onNavigate,
}: {
  active: string;
  summary: BillingSummary | null;
  onNavigate?: () => void;
}) {
  const { user, logout } = useAuth();
  const name = user ? `${user.first_name} ${user.last_name}`.trim() : '';
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex h-16 items-center gap-2.5 px-5 focus-visible:outline-2 focus-visible:outline-trend-orange"
        >
          <Image src="/symbol.png" alt="" width={26} height={26} className="object-contain" />
          <span className="text-[17px] font-semibold tracking-tight text-studio-text">TrendED</span>
        </Link>
        <nav aria-label="Main" className="mt-3 space-y-0.5 px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const current = href === active;
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                aria-current={current ? 'page' : undefined}
                className={`flex h-10 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-trend-orange ${
                  current
                    ? 'bg-cream font-medium text-studio-text'
                    : 'text-studio-muted hover:bg-studio-surface hover:text-studio-text'
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${current ? 'text-trend-orange' : ''}`}
                  strokeWidth={1.75}
                  aria-hidden
                />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <PlanCard summary={summary} onNavigate={onNavigate} />
        <div className="border-t border-studio-rule p-3">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <span
              aria-hidden
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink text-xs font-semibold text-on-accent"
            >
              {(user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm text-studio-text">{name || 'Your account'}</p>
              <p className="truncate text-xs text-studio-meta">{user?.email}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onNavigate?.();
              logout();
            }}
            className="mt-1 flex h-10 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-studio-muted transition-colors hover:bg-studio-surface hover:text-studio-text focus-visible:outline-2 focus-visible:outline-trend-orange"
          >
            <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}

/** The app's one frame: sidebar on desktop, drawer on phone, a top bar the page fills. */
export function AppShell({
  active,
  topbar,
  children,
}: {
  active: string;
  topbar?: ReactNode;
  children: ReactNode;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [summary, setSummary] = useState<BillingSummary | null>(null);

  useEffect(() => {
    let alive = true;
    billingApi
      .getSummary()
      .then((s) => alive && setSummary(s))
      .catch(() => undefined); // the badge just stays hidden; pages still work
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <div className="flex min-h-dvh bg-studio-ground font-sans text-studio-text antialiased selection:bg-trend-orange selection:text-on-accent">
      <aside className="sticky top-0 hidden h-dvh w-[232px] shrink-0 border-r border-studio-rule lg:block">
        <Sidebar active={active} summary={summary} />
      </aside>

      {menuOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/60"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative h-full w-[272px] bg-studio-ground shadow-2xl">
            <button
              type="button"
              onClick={() => setMenuOpen(false)}
              className="absolute top-3 right-3 flex size-11 items-center justify-center rounded-lg text-studio-muted hover:bg-studio-surface hover:text-studio-text"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" aria-hidden />
            </button>
            <Sidebar active={active} summary={summary} onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-studio-rule bg-studio-ground px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="-ml-2 flex size-11 items-center justify-center rounded-lg text-studio-muted hover:bg-studio-surface hover:text-studio-text lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <div className="flex min-w-0 flex-1 items-center gap-3">{topbar}</div>
          <CreditsBadge summary={summary} />
        </header>
        {children}
      </div>
    </div>
  );
}
