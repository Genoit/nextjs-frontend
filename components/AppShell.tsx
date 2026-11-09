'use client';

import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { BrandLogo } from './Icons';
import Link from 'next/link';
import { Clapperboard, LogOut, Menu, Package, Plus, X, Zap } from 'lucide-react';
import { useAuth } from '../lib/auth';
import { useStudioTheme } from '../lib/theme';
import { billingApi, type BillingSummary } from '../lib/api/billing';
import { creditsText, isSubscribed, PLAN_LABEL } from '../lib/billing-rules.mjs';

const NAV = [
  { href: '/dashboard', label: 'Studio', icon: Clapperboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/product-input', label: 'New ad', icon: Plus },
];

/** Remaining credits + Upgrade, top right on every app screen. */
function CreditsBadge({ summary }: { summary: BillingSummary | null }) {
  if (!summary) return <span className="h-9 w-28 rounded-[10px] bg-white/5" aria-hidden />;
  const subscribed = isSubscribed(summary);
  const low = summary.credits === 0;
  return (
    <Link
      href="/billing"
      className="studio-tab shrink-0 !pr-1.5 focus-visible:outline-2 focus-visible:outline-trend-orange"
      aria-label={`${creditsText(summary.credits)} left. ${subscribed ? 'Manage plan' : 'Upgrade'}`}
    >
      <Zap
        className={`h-4 w-4 ${low ? 'text-danger' : 'text-trend-orange'}`}
        fill="currentColor"
        aria-hidden
      />
      <span className={`tabular-nums ${low ? 'text-danger' : 'text-studio-text'}`}>
        {creditsText(summary.credits)}
      </span>
      <span className="rounded-md bg-trend-orange px-2 py-1 text-[11.5px] font-semibold text-on-accent">
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
      className="flex shrink-0 items-center gap-2 rounded-[10px] px-1 transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-trend-orange"
    >
      <BrandLogo className="h-6" />
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
        className="flex size-9 items-center justify-center rounded-[10px] bg-studio-raised-2 text-xs font-semibold text-studio-text transition hover:bg-studio-hover focus-visible:outline-2 focus-visible:outline-trend-orange"
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
          <div className="absolute top-12 right-0 z-50 w-64 rounded-2xl border border-studio-rule-strong bg-studio-raised p-2 shadow-menu">
            <div className="px-3 py-2">
              <p className="truncate text-sm font-semibold text-studio-text">
                {name || 'Your account'}
              </p>
              <p className="truncate text-xs text-ink-muted">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                logout();
              }}
              className="mt-1 flex h-10 w-full items-center gap-2.5 rounded-[10px] px-3 text-[13px] font-medium text-studio-muted transition hover:bg-white/5 hover:text-studio-text"
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

/** The app's one frame: wordmark, a floating nav pill and a floating account pill over the page. */
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
  const theme = useStudioTheme();

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
    <div
      data-theme={theme}
      className="flex min-h-dvh flex-col bg-studio-ground font-sans text-studio-text antialiased selection:bg-trend-orange/30 selection:text-studio-text"
    >
      {/* No bar across the page: the wordmark, the nav pill and the account pill float over the ground. */}
      <header className="sticky top-0 z-50 flex h-[70px] shrink-0 items-center justify-between gap-2 lg:grid lg:grid-cols-[1fr_auto_1fr] px-3 pt-3 pb-1 md:px-5">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="flex size-11 items-center justify-center rounded-[10px] text-studio-muted hover:text-studio-text lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
          <Wordmark />
        </div>
        <nav
          aria-label="Main"
          className="studio-bar hidden h-[46px] items-center gap-0.5 rounded-[15px] px-[5px] lg:flex"
        >
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              aria-current={href === active ? 'page' : undefined}
              className="studio-tab focus-visible:outline-2 focus-visible:outline-trend-orange"
            >
              <Icon className="size-4" aria-hidden />
              {label}
            </Link>
          ))}
        </nav>
        <div className="flex min-w-0 items-center justify-end gap-2">
          {topbar}
          <div className="studio-bar flex h-[46px] items-center gap-1 rounded-[15px] px-[5px]">
            <CreditsBadge summary={summary} />
            <div className="hidden sm:block">
              <UserMenu />
            </div>
          </div>
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
          <div className="relative flex h-full w-[280px] flex-col border-r border-studio-rule bg-studio-rail p-4">
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
              {NAV.map(({ href, label, icon: Icon }) => (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  aria-current={href === active ? 'page' : undefined}
                  className="studio-tab !h-11 !text-sm"
                >
                  <Icon className="size-4" aria-hidden />
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
              className="mt-auto flex h-11 items-center gap-2.5 rounded-[10px] px-4 text-sm font-medium text-studio-muted hover:bg-white/5 hover:text-studio-text"
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
