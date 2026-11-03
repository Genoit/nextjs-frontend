'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { LogOut, Menu, X, Zap } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { billingApi, type BillingSummary } from '../lib/api/billing';
import { creditsText, isSubscribed, PLAN_LABEL } from '../lib/billing-rules.mjs';

const NAV = [
  { href: '/dashboard', label: 'Studio' },
  { href: '/products', label: 'Products' },
  { href: '/product-input', label: 'New ad' },
];

/** Remaining credits + Upgrade, top right on every app screen. */
function CreditsBadge({ summary }: { summary: BillingSummary | null }) {
  if (!summary) return <span className="h-9 w-28 rounded-full bg-white/5" aria-hidden />;
  const subscribed = isSubscribed(summary);
  const low = summary.credits === 0;
  return (
    <Link
      href="/billing"
      className="inline-flex h-9 shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 pl-3 pr-1 text-sm transition hover:bg-white/10 focus-visible:outline-2 focus-visible:outline-trend-orange"
      aria-label={`${creditsText(summary.credits)} left. ${subscribed ? 'Manage plan' : 'Upgrade'}`}
    >
      <Zap
        className={`h-4 w-4 ${low ? 'text-danger' : 'text-trend-orange'}`}
        fill="currentColor"
        aria-hidden
      />
      <span className={`font-bold tabular-nums ${low ? 'text-danger' : 'text-studio-text'}`}>
        {creditsText(summary.credits)}
      </span>
      <span className="rounded-full bg-trend-orange px-2.5 py-1 text-xs font-black text-on-accent">
        {subscribed ? PLAN_LABEL[summary.plan] : 'Upgrade'}
      </span>
    </Link>
  );
}

function Wordmark({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Link
      href="/dashboard"
      onClick={onNavigate}
      className="flex shrink-0 items-center gap-2.5 transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-trend-orange motion-reduce:transition-none"
    >
      <Image src="/symbol.png" alt="" width={30} height={30} className="object-contain" />
      <span className="text-lg font-black tracking-tight text-white">TrendED</span>
    </Link>
  );
}

function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const name = user ? `${user.first_name} ${user.last_name}`.trim() : '';
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Account"
        className="flex size-9 items-center justify-center rounded-full bg-white/10 text-xs font-black text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-trend-orange"
      >
        {(user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
      </button>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close account menu"
            className="fixed inset-0 z-40 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div className="absolute top-12 right-0 z-50 w-64 rounded-3xl border border-white/10 bg-[#111] p-3 shadow-2xl">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-bold text-white">{name || 'Your account'}</p>
              <p className="truncate text-xs text-ink-muted">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="mt-1 flex h-11 w-full items-center gap-2.5 rounded-2xl px-3 text-sm font-bold text-ink-muted transition hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </div>
        </>
      )}
    </div>
  );
}

/** The app's one frame: a black top bar (wordmark, studio tabs, credits, account) over the page. */
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
  const { logout } = useAuth();

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
    <div className="flex min-h-dvh flex-col bg-black font-sans text-studio-text antialiased selection:bg-trend-orange selection:text-on-accent">
      <header className="sticky top-0 z-50 flex h-16 shrink-0 items-center gap-4 border-b border-white/5 bg-black px-4 md:px-6">
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="-ml-2 flex size-11 items-center justify-center rounded-lg text-ink-muted hover:text-white lg:hidden"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </button>
        <Wordmark />
        <nav
          aria-label="Main"
          className="ml-4 hidden items-center gap-6 text-[13px] font-bold lg:flex"
        >
          {NAV.map(({ href, label }) => {
            const current = href === active;
            return (
              <Link
                key={href}
                href={href}
                aria-current={current ? 'page' : undefined}
                className={`relative py-2 transition-colors focus-visible:outline-2 focus-visible:outline-trend-orange ${
                  current ? 'text-white' : 'text-ink-muted hover:text-white'
                }`}
              >
                {label}
                {current && (
                  <span
                    aria-hidden
                    className="absolute bottom-0 left-1/2 size-1 -translate-x-1/2 rounded-full bg-trend-orange"
                  />
                )}
              </Link>
            );
          })}
        </nav>
        <div className="flex min-w-0 flex-1 items-center justify-end gap-3">{topbar}</div>
        <CreditsBadge summary={summary} />
        <div className="hidden sm:block">
          <UserMenu />
        </div>
      </header>

      {menuOpen && (
        <div
          className="fixed inset-0 z-[60] lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
        >
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-black/70"
            onClick={() => setMenuOpen(false)}
          />
          <div className="relative flex h-full w-[280px] flex-col border-r border-white/5 bg-black p-4">
            <div className="flex h-12 items-center justify-between">
              <Wordmark onNavigate={() => setMenuOpen(false)} />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex size-11 items-center justify-center rounded-lg text-ink-muted hover:text-white"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
            </div>
            <nav aria-label="Main" className="mt-6 flex flex-col gap-1">
              {NAV.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={href === active ? 'page' : undefined}
                  className={`flex h-12 items-center rounded-2xl px-4 text-sm font-bold ${
                    href === active
                      ? 'bg-white/5 text-white'
                      : 'text-ink-muted hover:bg-white/5 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                logout();
              }}
              className="mt-auto flex h-12 items-center gap-2.5 rounded-2xl px-4 text-sm font-bold text-ink-muted hover:bg-white/5 hover:text-white"
            >
              <LogOut className="h-4 w-4" aria-hidden />
              Sign out
            </button>
          </div>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}
