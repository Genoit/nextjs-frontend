'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  Bell,
  ChevronDown,
  CircleHelp,
  Folder,
  House,
  Layers,
  LogOut,
  Menu,
  MoreVertical,
  Package,
  Search,
  Settings,
  Sparkles,
  Tag,
  X,
  Zap,
} from 'lucide-react';
import ProtectedRoute from '../ProtectedRoute';
import { useAuth } from '../../lib/auth';
import { productApi } from '../../lib/api/product';
import { creativeApi } from '../../lib/api/creative';
import { billingApi, type BillingPlan, type BillingSummary } from '../../lib/api/billing';
import { isSubscribed, PLAN_LABEL } from '../../lib/billing-rules.mjs';
import { daysUntil } from '../../lib/dashboard-rules.mjs';
import type { Product } from '../../lib/types/product';
import type { VideoGenerationJob } from '../../lib/types/creative';

// ---------------------------------------------------------------- data

export type Entry = { product: Product; jobs: VideoGenerationJob[] | null };
export type Load =
  | { state: 'loading' }
  | { state: 'error'; message: string }
  | { state: 'ready'; entries: Entry[]; total: number };

/**
 * The user's newest products with their video jobs (jobs: null when that call failed).
 * shortcut: the products API has no search/sort/filter and no user-wide jobs list, so pages load
 * up to 100 products and one jobs call each (N+1); add those endpoints when libraries grow.
 */
export async function loadEntries(limit: number): Promise<Load> {
  try {
    const { products, total } = await productApi.getProducts({
      page_size: limit,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    const jobs = await Promise.allSettled(products.map((p) => creativeApi.listVideoJobs(p.id)));
    return {
      state: 'ready',
      total: total ?? products.length,
      entries: products.map((product, i) => {
        const r = jobs[i];
        return {
          product,
          jobs: r.status === 'fulfilled' && Array.isArray(r.value) ? r.value : null,
        };
      }),
    };
  } catch (err) {
    return { state: 'error', message: err instanceof Error ? err.message : 'Unknown error.' };
  }
}

export const productImage = (p: Product) =>
  p.images?.find((i) => i.is_primary)?.url || p.main_image_url;

// ---------------------------------------------------------------- small parts

export const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-text';

export const menuItem =
  'flex h-9 w-full items-center gap-2 rounded-lg px-3 text-[13px] text-studio-muted transition hover:bg-white/5 hover:text-white';

export function Thumb({
  src,
  className,
  iconSize = 'size-6',
}: {
  src?: string | null;
  className: string;
  iconSize?: string;
}) {
  const [broken, setBroken] = useState(false);
  return (
    <div className={`relative shrink-0 overflow-hidden bg-dash-raised ${className}`}>
      {src && !broken ? (
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          sizes="320px"
          className="object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-studio-meta">
          <Package className={iconSize} strokeWidth={1.25} aria-hidden />
        </div>
      )}
    </div>
  );
}

/** Small popover anchored to its button; closes on outside click and Escape. */
export function Popover({
  label,
  button,
  className,
  buttonClassName = '',
  children,
}: {
  label: string;
  button: ReactNode;
  className: string;
  buttonClassName?: string;
  children: (close: () => void) => ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => !ref.current?.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center justify-center rounded-md transition hover:text-white ${focusRing} ${buttonClassName}`}
      >
        {button}
      </button>
      {open && (
        <div
          className={`absolute z-50 rounded-xl border border-dash-line bg-dash-raised p-1.5 shadow-menu ${className}`}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}

export function RowMenu({ product, up = false }: { product: Product; up?: boolean }) {
  return (
    <Popover
      label={`Actions for ${product.title}`}
      button={<MoreVertical className="size-4" aria-hidden />}
      className={`right-0 w-44 ${up ? 'bottom-7' : 'top-7'}`}
    >
      {(close) => (
        <>
          <Link href={`/products/${product.id}`} onClick={close} className={menuItem}>
            Open product
          </Link>
          <Link href={`/products/${product.id}/creative`} onClick={close} className={menuItem}>
            Open ad studio
          </Link>
          <Link href={`/products/${product.id}/edit`} onClick={close} className={menuItem}>
            Edit product
          </Link>
        </>
      )}
    </Popover>
  );
}

// ---------------------------------------------------------------- sidebar

const NAV: { label: string; Icon: typeof House; href?: string }[] = [
  { label: 'Dashboard', Icon: House, href: '/dashboard' },
  { label: 'Create Ad', Icon: Sparkles, href: '/product-input' },
  { label: 'My Projects', Icon: Folder, href: '/projects' },
  { label: 'Product Library', Icon: Package, href: '/products' },
  { label: 'Templates', Icon: Layers },
  { label: 'Brand Kit', Icon: Tag },
];
const NAV_FOOT: typeof NAV = [
  { label: 'Settings', Icon: Settings },
  { label: 'Help', Icon: CircleHelp },
];

const isActive = (href: string | undefined, path: string) =>
  !!href && (path === href || path.startsWith(`${href}/`));

function Wordmark() {
  return (
    <Link href="/dashboard" className={`block rounded-md ${focusRing}`}>
      <span className="block text-[27px] leading-none font-bold tracking-[-0.03em] text-white">
        Trend<span className="text-ember-text">ED</span>
      </span>
      <span className="mt-1.5 block text-[9px] whitespace-nowrap text-studio-muted">
        E-commerce · Dropshipping · Growth
      </span>
    </Link>
  );
}

function NavItem({ item, onNavigate }: { item: (typeof NAV)[number]; onNavigate?: () => void }) {
  const { label, Icon, href } = item;
  const active = isActive(href, usePathname() ?? '');
  const cls = `flex h-[45px] items-center gap-3.5 rounded-[10px] px-4 text-[13.5px] transition ${
    active
      ? 'bg-gradient-to-r from-ember-deep/90 to-[#3f1c0e] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]'
      : 'text-[#e6e6e6] hover:bg-white/[0.04]'
  }`;
  const icon = <Icon className="size-[19px] shrink-0" strokeWidth={1.6} aria-hidden />;
  if (!href) {
    // No page behind these yet: same look, not a link.
    return (
      <span aria-disabled="true" title="Coming soon" className={`${cls} cursor-not-allowed`}>
        {icon}
        {label}
      </span>
    );
  }
  return (
    <Link
      href={href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={`${cls} ${focusRing}`}
    >
      {icon}
      {label}
    </Link>
  );
}

function CreditsCard({ summary, total }: { summary: BillingSummary | null; total: number | null }) {
  if (!summary)
    return <div className="h-[138px] animate-pulse rounded-[12px] bg-white/[0.03]" aria-hidden />;
  const days = isSubscribed(summary) ? daysUntil(summary.current_period_end, new Date()) : null;
  const pct = total ? Math.min(100, Math.round((summary.credits / total) * 100)) : 0;
  return (
    <div className="rounded-[12px] border border-dash-line bg-dash-panel p-4">
      <p className="flex items-center gap-2 text-[10.5px] text-studio-muted">
        <span className="size-3.5 rounded-full bg-coin" aria-hidden />
        {PLAN_LABEL[summary.plan]} plan
      </p>
      <p className="mt-2.5 text-[11.5px] text-studio-muted">Credits remaining</p>
      <p className="mt-1 flex items-baseline gap-2 tabular-nums">
        <span className="text-[22px] font-semibold text-white">
          {summary.credits.toLocaleString('en-US')}
        </span>
        {total ? (
          <span className="text-[11.5px] text-studio-muted">/ {total.toLocaleString('en-US')}</span>
        ) : null}
      </p>
      {total ? (
        <div
          className="mt-2 h-[7px] overflow-hidden rounded-full bg-[#272727]"
          role="progressbar"
          aria-label="Credits remaining"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="h-full rounded-full bg-coin" style={{ width: `${pct}%` }} />
        </div>
      ) : null}
      {days !== null ? (
        <p className="mt-3 text-[11.5px] text-studio-muted">
          Renews in {days} day{days === 1 ? '' : 's'}
        </p>
      ) : (
        <Link
          href="/billing"
          className="mt-3 inline-block text-[11.5px] text-ember-text hover:underline"
        >
          Get more credits
        </Link>
      )}
    </div>
  );
}

function Sidebar({
  summary,
  total,
  onNavigate,
}: {
  summary: BillingSummary | null;
  total: number | null;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col px-4 pt-7 pb-5">
      <div className="px-3">
        <Wordmark />
      </div>
      <nav aria-label="Main" className="mt-9 flex flex-col gap-[2px]">
        {NAV.map((item) => (
          <NavItem key={item.label} item={item} onNavigate={onNavigate} />
        ))}
      </nav>
      <div className="mt-auto flex flex-col gap-[2px] pt-8">
        {NAV_FOOT.map((item) => (
          <NavItem key={item.label} item={item} onNavigate={onNavigate} />
        ))}
        <div className="mt-3">
          <CreditsCard summary={summary} total={total} />
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- top bar

function AccountMenu() {
  const { user, logout } = useAuth();
  const name = user ? `${user.first_name} ${user.last_name}`.trim() : '';
  return (
    <Popover
      label="Account"
      className="top-12 right-0 w-60"
      button={
        <span className="flex items-center gap-2 text-studio-muted">
          <span className="flex size-[38px] items-center justify-center rounded-full bg-gradient-to-br from-[#3a3a3a] to-[#1f1f1f] text-[13px] font-semibold text-white ring-1 ring-white/10">
            {(user?.first_name?.[0] || user?.email?.[0] || '?').toUpperCase()}
          </span>
          <ChevronDown className="size-4" aria-hidden />
        </span>
      }
    >
      {(close) => (
        <>
          <div className="px-3 py-2">
            <p className="truncate text-[13px] font-semibold text-white">
              {name || 'Your account'}
            </p>
            <p className="truncate text-xs text-studio-meta">{user?.email}</p>
          </div>
          <Link href="/billing" onClick={close} className={menuItem}>
            <Zap className="size-4" aria-hidden />
            Plan and credits
          </Link>
          <button
            type="button"
            onClick={() => {
              close();
              logout();
            }}
            className={menuItem}
          >
            <LogOut className="size-4" aria-hidden />
            Sign out
          </button>
        </>
      )}
    </Popover>
  );
}

function Topbar({
  summary,
  search,
  onMenu,
}: {
  summary: BillingSummary | null;
  search: boolean;
  onMenu: () => void;
}) {
  const router = useRouter();
  const path = usePathname() ?? '';
  const crumb = NAV.find((n) => isActive(n.href, path))?.label ?? 'Workspace';
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!search) return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [search]);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    const term = q.trim();
    router.push(term ? `/products?search=${encodeURIComponent(term)}` : '/products');
  };
  return (
    <header className="relative z-30 flex h-[66px] items-center gap-4 px-5 lg:px-9">
      <button
        type="button"
        onClick={onMenu}
        aria-label="Open menu"
        className={`-ml-2 flex size-10 items-center justify-center rounded-lg text-studio-muted hover:text-white lg:hidden ${focusRing}`}
      >
        <Menu className="size-5" aria-hidden />
      </button>
      <nav aria-label="Breadcrumb" className="hidden text-[13px] sm:block">
        <ol className="flex items-center gap-3">
          <li className="text-studio-muted">Workspace</li>
          <li aria-hidden className="text-studio-meta">
            /
          </li>
          <li aria-current="page" className="text-white">
            {crumb}
          </li>
        </ol>
      </nav>
      <div className="ml-auto flex items-center gap-5 lg:gap-8">
        {search && (
          <form onSubmit={submit} role="search" className="relative hidden md:block">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-studio-muted"
              aria-hidden
            />
            <label htmlFor="dash-search" className="sr-only">
              Search projects or products
            </label>
            <input
              ref={input}
              id="dash-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search projects or products..."
              className="h-[38px] w-[300px] rounded-[9px] border border-[#2a2a2a] bg-[#141414] pr-12 pl-10 text-[13px] text-white outline-none placeholder:text-studio-muted focus:border-ember-text/60 xl:w-[318px]"
            />
            <kbd className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 rounded-[5px] border border-[#333] bg-[#1d1d1d] px-1.5 py-0.5 font-sans text-[10.5px] text-studio-muted">
              ⌘K
            </kbd>
          </form>
        )}
        <Link
          href="/billing"
          className={`flex items-center gap-2 rounded-md text-[14px] text-white ${focusRing}`}
        >
          <span
            className="flex size-[18px] items-center justify-center rounded-full bg-coin"
            aria-hidden
          >
            <span className="size-2.5 rounded-full border border-[#8a5a12]/60" />
          </span>
          <span className="tabular-nums">
            {summary
              ? `${summary.credits.toLocaleString('en-US')} credit${summary.credits === 1 ? '' : 's'}`
              : '…'}
          </span>
        </Link>
        <Popover
          label="Notifications"
          className="top-10 right-0 w-64"
          button={<Bell className="size-5 text-studio-muted" strokeWidth={1.6} aria-hidden />}
        >
          {() => <p className="px-3 py-3 text-[13px] text-studio-muted">No notifications yet.</p>}
        </Popover>
        <AccountMenu />
      </div>
    </header>
  );
}

// ---------------------------------------------------------------- shell

export type Billing = { summary: BillingSummary | null; total: number | null };

/** Sidebar + top bar of the studio pages. `children` may read the billing summary it loads. */
export function DashShell({
  search = false,
  children,
}: {
  search?: boolean;
  children: ReactNode | ((billing: Billing) => ReactNode);
}) {
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    billingApi
      .getSummary()
      .then((s) => alive && setSummary(s))
      .catch(() => undefined); // credits stay as placeholders; the page still works
    billingApi
      .getPlans()
      .then((p) => alive && setPlans(p))
      .catch(() => undefined);
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

  const total = (summary && plans.find((p) => p.id === summary.plan)?.monthly_credits) || null;

  return (
    <ProtectedRoute>
      <div className="flex min-h-dvh bg-dash-ground font-sans text-white antialiased">
        <aside className="sticky top-0 hidden h-dvh w-[220px] shrink-0 border-r border-[#262626] bg-[#0c0c0c] lg:block">
          <Sidebar summary={summary} total={total} />
        </aside>

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
            <div className="relative h-full w-[260px] border-r border-[#262626] bg-[#0c0c0c]">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                className="absolute top-6 right-3 flex size-10 items-center justify-center rounded-lg text-studio-muted hover:text-white"
              >
                <X className="size-5" aria-hidden />
              </button>
              <Sidebar summary={summary} total={total} onNavigate={() => setMenuOpen(false)} />
            </div>
          </div>
        )}

        <div className="relative flex min-w-0 flex-1 flex-col overflow-x-clip">
          <Topbar summary={summary} search={search} onMenu={() => setMenuOpen(true)} />
          {typeof children === 'function' ? children({ summary, total }) : children}
        </div>
      </div>
    </ProtectedRoute>
  );
}
