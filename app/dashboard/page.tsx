'use client';

import { useEffect, useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Bell,
  CheckCircle2,
  ChevronDown,
  CircleCheck,
  CircleHelp,
  CirclePlay,
  Clock3,
  Database,
  Film,
  Folder,
  House,
  ImageUp,
  Layers,
  Link2,
  LogOut,
  Menu,
  Monitor,
  MoreVertical,
  Package,
  PenLine,
  Search,
  Settings,
  Smartphone,
  Sparkles,
  Square,
  Tag,
  X,
  Zap,
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/auth';
import { productApi } from '../../lib/api/product';
import { creativeApi } from '../../lib/api/creative';
import { billingApi, type BillingPlan, type BillingSummary } from '../../lib/api/billing';
import { isSubscribed, PLAN_LABEL } from '../../lib/billing-rules.mjs';
import type { Product } from '../../lib/types/product';
import type { VideoGenerationJob } from '../../lib/types/creative';
import {
  createHref,
  daysUntil,
  durationText,
  jobBadge,
  latestJob,
  monthStats,
  timeAgo,
} from '../../lib/dashboard-rules.mjs';

// shortcut: jobs are fetched per product (N+1) for the 12 most recent products, so the month
// stats only count those; add a user-wide jobs endpoint when users have more products.
const RECENT_LIMIT = 12;
// Read by CreativeConfigForm as its default aspect ratio.
const FORMAT_KEY = 'trended.outputFormat';

type Entry = { product: Product; jobs: VideoGenerationJob[] | null };
type Load =
  { state: 'loading' } | { state: 'error'; message: string } | { state: 'ready'; entries: Entry[] };

async function loadStudio(): Promise<Load> {
  try {
    const { products } = await productApi.getProducts({
      page_size: RECENT_LIMIT,
      sort_by: 'created_at',
      sort_order: 'desc',
    });
    const jobs = await Promise.allSettled(products.map((p) => creativeApi.listVideoJobs(p.id)));
    return {
      state: 'ready',
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

const FORMATS = [
  { value: '9:16', label: '9:16 Vertical', Icon: Smartphone },
  { value: '1:1', label: '1:1 Square', Icon: Square },
  { value: '16:9', label: '16:9 Landscape', Icon: Monitor },
];

const NAV: { label: string; Icon: typeof House; href?: string }[] = [
  { label: 'Dashboard', Icon: House, href: '/dashboard' },
  { label: 'Create Ad', Icon: Sparkles, href: '/product-input' },
  { label: 'My Projects', Icon: Folder, href: '/products' },
  { label: 'Product Library', Icon: Package, href: '/products' },
  { label: 'Templates', Icon: Layers },
  { label: 'Brand Kit', Icon: Tag },
];
const NAV_FOOT: typeof NAV = [
  { label: 'Settings', Icon: Settings },
  { label: 'Help', Icon: CircleHelp },
];

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-text';
const STATUS_DOT: Record<string, string> = {
  ready: 'text-dash-green',
  simulated: 'text-studio-muted',
  active: 'text-warning',
  failed: 'text-danger',
  idle: 'text-studio-meta',
};
const NOT_A_TAG = ['null', 'unknown', 'generic', 'manual', 'custom', 'other'];

const productImage = (p: Product) => p.images?.find((i) => i.is_primary)?.url || p.main_image_url;
const formatOf = (job: VideoGenerationJob | null) => job?.exports?.[0]?.aspect_ratio ?? null;

function Thumb({
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
function Popover({
  label,
  button,
  className,
  children,
}: {
  label: string;
  button: ReactNode;
  className: string;
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
        className={`flex items-center justify-center rounded-md transition hover:text-white ${focusRing}`}
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

const menuItem =
  'flex h-9 w-full items-center gap-2 rounded-lg px-3 text-[13px] text-studio-muted transition hover:bg-white/5 hover:text-white';

function RowMenu({ product }: { product: Product }) {
  return (
    <Popover
      label={`Actions for ${product.title}`}
      button={<MoreVertical className="size-4" aria-hidden />}
      className="right-0 bottom-7 w-44"
    >
      {(close) => (
        <>
          <Link href={`/products/${product.id}`} onClick={close} className={menuItem}>
            Open product
          </Link>
          <Link href={`/products/${product.id}/creative`} onClick={close} className={menuItem}>
            Open ad studio
          </Link>
        </>
      )}
    </Popover>
  );
}

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
  const active = label === 'Dashboard';
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

function Topbar({ summary, onMenu }: { summary: BillingSummary | null; onMenu: () => void }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        input.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
  const search = (e: FormEvent) => {
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
            Dashboard
          </li>
        </ol>
      </nav>
      <div className="ml-auto flex items-center gap-5 lg:gap-8">
        <form onSubmit={search} role="search" className="relative hidden md:block">
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

function Hero({ empty }: { empty: boolean }) {
  return (
    <section className="relative">
      {/* The studio picture bleeds right and fades into the ground on its left. */}
      <div
        aria-hidden
        className="pointer-events-none absolute top-0 right-0 hidden h-[176px] w-[52%] md:block"
        style={{
          maskImage: 'linear-gradient(to right, transparent, #000 30%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, #000 30%)',
        }}
      >
        <Image
          src="/studio-hero.jpg"
          alt=""
          fill
          priority
          sizes="54vw"
          className="object-cover object-center"
        />
        <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-dash-ground to-transparent" />
      </div>
      <div className="relative px-5 pt-3 pb-[22px] lg:px-9">
        <h1 className="text-[34px] leading-[1.1] font-bold tracking-[-0.03em] text-white sm:text-[42px]">
          Turn products into ads.
        </h1>
        <p className="mt-2.5 text-[15px] text-[#a8a8a8] sm:text-[16px]">
          Create cinematic product videos that make people stop scrolling.
        </p>
        <Link
          href="/product-input"
          className={`mt-6 inline-flex h-[42px] items-center gap-2.5 rounded-[9px] bg-gradient-to-b from-[#a2300a] to-ember-deep px-5 text-[14.5px] font-semibold text-white shadow-[0_0_28px_rgb(184_56_8/0.35),inset_0_1px_0_rgb(255_255_255/0.12)] transition hover:brightness-110 active:scale-[0.98] ${focusRing}`}
        >
          <Sparkles className="size-[18px]" aria-hidden />
          {empty ? 'Create your first ad' : 'Create a new ad'}
        </Link>
      </div>
    </section>
  );
}

function CreatePanel() {
  const router = useRouter();
  const [link, setLink] = useState('');
  const [format, setFormat] = useState('9:16');
  const FormatIcon = FORMATS.find((f) => f.value === format)?.Icon ?? Smartphone;
  const keepFormat = () => {
    try {
      sessionStorage.setItem(FORMAT_KEY, format);
    } catch {
      // storage blocked: the ad studio falls back to 9:16
    }
  };
  const submit = (e: FormEvent) => {
    e.preventDefault();
    keepFormat();
    router.push(createHref(link));
  };
  return (
    <form
      onSubmit={submit}
      className="grid gap-6 rounded-[14px] border border-dash-line bg-dash-panel px-[22px] py-4 lg:grid-cols-[minmax(0,1fr)_auto_182px_minmax(240px,280px)] lg:items-center lg:gap-x-[30px]"
    >
      <div className="min-w-0">
        <h2 className="text-[15px] font-semibold text-white">Create a product ad</h2>
        <p className="mt-1 text-[11.5px] text-studio-muted">
          From product image or URL to cinematic video.
        </p>
        <div className="mt-3.5 flex gap-2">
          <span
            className="flex size-[43px] shrink-0 items-center justify-center rounded-[9px] border border-[#2a2a2a] bg-dash-raised text-studio-muted"
            aria-hidden
          >
            <Link2 className="size-[18px]" />
          </span>
          <label htmlFor="product-link" className="sr-only">
            Product page link
          </label>
          <input
            id="product-link"
            type="url"
            inputMode="url"
            autoComplete="off"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Paste your product URL..."
            className="h-[43px] min-w-0 flex-1 rounded-[9px] border border-[#2a2a2a] bg-dash-raised px-3.5 text-[13px] text-white outline-none placeholder:text-studio-meta focus:border-ember-text/60"
          />
        </div>
        <Link
          href="/product-input?mode=manual"
          onClick={keepFormat}
          className={`mt-3.5 inline-flex items-center gap-2.5 rounded-md text-[13px] text-[#d4d4d4] transition hover:text-white ${focusRing}`}
        >
          <PenLine className="size-4" aria-hidden />
          Enter product details manually
        </Link>
      </div>

      <div
        className="relative hidden h-full min-h-[120px] items-center justify-center lg:flex"
        aria-hidden
      >
        <span className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-dash-line" />
        <span className="relative flex size-8 items-center justify-center rounded-full border border-dash-line bg-dash-panel text-[10.5px] text-studio-muted">
          OR
        </span>
      </div>

      <Link
        href="/product-input"
        onClick={keepFormat}
        className={`flex h-[100px] flex-col items-center justify-center gap-3 rounded-[10px] border border-dashed border-[#3a3a3a] bg-white/[0.015] text-[12.5px] text-[#cfcfcf] transition hover:border-[#555] hover:text-white ${focusRing}`}
      >
        <ImageUp className="size-6 text-studio-muted" strokeWidth={1.5} aria-hidden />
        Upload product image
      </Link>

      <div className="flex flex-col gap-3">
        <label htmlFor="output-format" className="text-[14px] font-medium text-white">
          Output format
        </label>
        <div className="relative">
          <FormatIcon
            className="pointer-events-none absolute top-1/2 left-3.5 size-[18px] -translate-y-1/2 text-studio-muted"
            aria-hidden
          />
          <select
            id="output-format"
            value={format}
            onChange={(e) => setFormat(e.target.value)}
            className="h-[43px] w-full appearance-none rounded-[9px] border border-[#2a2a2a] bg-dash-raised pr-10 pl-10 text-[13px] text-white outline-none focus:border-ember-text/60"
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>
                {f.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className="pointer-events-none absolute top-1/2 right-3.5 size-4 -translate-y-1/2 text-studio-muted"
            aria-hidden
          />
        </div>
        <button
          type="submit"
          className={`inline-flex h-[43px] items-center justify-center gap-2.5 rounded-[9px] bg-ember text-[14px] font-semibold text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.1)] transition hover:bg-ember-strong active:scale-[0.99] ${focusRing}`}
        >
          <Sparkles className="size-[18px]" aria-hidden />
          Generate ad
        </button>
      </div>
    </form>
  );
}

function ProductCard({ entry }: { entry: Entry }) {
  const job = entry.jobs ? latestJob(entry.jobs) : null;
  const badge = entry.jobs === null ? { tone: 'idle', label: 'Status unavailable' } : jobBadge(job);
  const format = formatOf(job);
  const tags = [entry.product.category, entry.product.brand, entry.product.source_platform]
    .filter((t) => t && !NOT_A_TAG.includes(String(t)))
    .join(' · ');
  return (
    <li className="overflow-hidden rounded-[12px] border border-dash-line bg-[#111]">
      <Link href={`/products/${entry.product.id}`} className={`group relative block ${focusRing}`}>
        <Thumb
          src={job?.thumbnail_url || productImage(entry.product)}
          className="h-[148px] w-full transition duration-500 group-hover:brightness-110"
          iconSize="size-8"
        />
        {format && (
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1 rounded-md border border-white/15 bg-black/60 px-1.5 py-0.5 text-[11.5px] text-white tabular-nums">
            <Film className="size-3" aria-hidden />
            {format}
          </span>
        )}
      </Link>
      <div className="flex items-start gap-2 px-3 pt-2.5 pb-2">
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-2">
            <Link
              href={`/products/${entry.product.id}`}
              className="truncate text-[12.5px] font-semibold text-white hover:underline"
            >
              {entry.product.title}
            </Link>
            <span
              className={`inline-flex shrink-0 items-center gap-1 text-[10.5px] ${STATUS_DOT[badge.tone]}`}
            >
              <span className="size-1.5 rounded-full bg-current" aria-hidden />
              {badge.label}
            </span>
          </p>
          <p className="mt-1 truncate text-[10.5px] text-studio-meta capitalize">
            {tags || 'No category'}
          </p>
        </div>
        <div className="mt-0.5 text-studio-muted">
          <RowMenu product={entry.product} />
        </div>
      </div>
    </li>
  );
}

function LatestProducts({ load, retry }: { load: Load; retry: () => void }) {
  return (
    <section aria-labelledby="products-title" className="min-w-0">
      <h2
        id="products-title"
        className="flex items-center gap-2 text-[14px] font-semibold text-white"
      >
        <Sparkles className="size-4 text-coin" fill="currentColor" aria-hidden />
        Your latest products
      </h2>
      {load.state === 'loading' ? (
        <ul aria-hidden className="mt-3 grid gap-[13px] sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-[205px] animate-pulse rounded-[12px] bg-white/[0.03]" />
          ))}
        </ul>
      ) : load.state === 'error' ? (
        <p className="mt-3 text-[13px] text-studio-muted">
          Your products could not be loaded.{' '}
          <button type="button" onClick={retry} className="text-ember-text hover:underline">
            Retry
          </button>
        </p>
      ) : load.entries.length === 0 ? (
        <Link
          href="/product-input"
          className="mt-3 flex h-[205px] flex-col items-center justify-center gap-2 rounded-[12px] border border-dashed border-[#333] text-[13px] text-studio-muted transition hover:text-white"
        >
          <Package className="size-7" strokeWidth={1.25} aria-hidden />
          Add your first product: its card appears here.
        </Link>
      ) : (
        <ul className="mt-3 grid grid-cols-[minmax(0,1fr)] gap-[13px] sm:grid-cols-3">
          {load.entries.slice(0, 3).map((entry) => (
            <ProductCard key={entry.product.id} entry={entry} />
          ))}
        </ul>
      )}
    </section>
  );
}

function RecentCreations({ load }: { load: Load }) {
  const now = new Date();
  const rows =
    load.state === 'ready'
      ? load.entries
          .flatMap(({ product, jobs }) => (jobs ?? []).map((job) => ({ product, job })))
          .sort((a, b) => Date.parse(b.job.created_at) - Date.parse(a.job.created_at))
          .slice(0, 3)
      : [];
  return (
    <section
      aria-labelledby="recent-title"
      className="rounded-[14px] border border-dash-line bg-[#151515] px-[18px] pt-3.5 pb-1.5"
    >
      <div className="flex items-center justify-between border-b border-dash-line pb-2.5">
        <h2 id="recent-title" className="text-[14.5px] font-medium text-white">
          Recent creations
        </h2>
        <Link href="/products" className="text-[12.5px] text-ember-text hover:underline">
          View all
        </Link>
      </div>
      {load.state === 'loading' ? (
        <ul aria-hidden className="space-y-2 py-3">
          {[0, 1, 2].map((i) => (
            <li key={i} className="h-[50px] animate-pulse rounded-lg bg-white/[0.03]" />
          ))}
        </ul>
      ) : rows.length === 0 ? (
        <p className="py-6 text-center text-[12.5px] text-studio-meta">No ad generated yet.</p>
      ) : (
        <ul>
          {rows.map(({ product, job }) => {
            const badge = jobBadge(job);
            const format = formatOf(job);
            const ready = badge.tone === 'ready';
            const done = ready || badge.tone === 'simulated';
            return (
              <li key={job.id} className="flex items-center gap-3.5 py-[5px]">
                <Link
                  href={`/products/${product.id}/creative`}
                  className={`shrink-0 rounded-md ${focusRing}`}
                >
                  <Thumb
                    src={job.thumbnail_url || productImage(product)}
                    className="h-[48px] w-[65px] rounded-md"
                    iconSize="size-4"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${product.id}/creative`}
                    className="block truncate text-[12.5px] font-semibold text-white hover:underline"
                  >
                    {product.title}
                  </Link>
                  {format && (
                    <p className="text-[11.5px] text-studio-muted tabular-nums">{format}</p>
                  )}
                  <p
                    className={`mt-0.5 flex items-center gap-1.5 text-[11.5px] ${ready ? 'text-[#d4d4d4]' : STATUS_DOT[badge.tone]}`}
                  >
                    {done ? (
                      <CheckCircle2
                        className={`size-3.5 ${ready ? 'text-dash-green' : 'text-studio-muted'}`}
                        aria-hidden
                      />
                    ) : (
                      <span className="size-1.5 rounded-full bg-current" aria-hidden />
                    )}
                    {ready ? 'Completed' : badge.label}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-studio-muted">
                  {timeAgo(job.completed_at || job.created_at, now)}
                </span>
                <span className="shrink-0 text-studio-muted">
                  <RowMenu product={product} />
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function Stat({
  Icon,
  label,
  value,
  sub,
  subTone = 'text-studio-muted',
}: {
  Icon: typeof Clock3;
  label: string;
  value: string;
  sub: string;
  subTone?: string;
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 lg:px-6">
      <Icon className="size-[26px] shrink-0 text-studio-muted" strokeWidth={1.3} aria-hidden />
      <div className="min-w-0">
        <p className="truncate text-[11.5px] text-studio-muted">{label}</p>
        <p className="mt-0.5 text-[19px] font-semibold text-white tabular-nums">{value}</p>
        <p className={`truncate text-[11px] ${subTone}`}>{sub}</p>
      </div>
    </div>
  );
}

function Stats({
  load,
  summary,
  total,
}: {
  load: Load;
  summary: BillingSummary | null;
  total: number | null;
}) {
  const jobs = load.state === 'ready' ? load.entries.flatMap((e) => e.jobs ?? []) : [];
  const s = monthStats(jobs, new Date());
  const ready = load.state === 'ready';
  const count = (n: number) => (ready ? String(n) : '…');
  // shortcut: credits used = plan allowance minus balance; wrong once top-ups exist, swap for a
  // usage endpoint then.
  const used = summary && total ? Math.max(0, total - summary.credits) : null;
  return (
    <section
      aria-label="This month"
      className="grid grid-cols-2 divide-dash-line rounded-[14px] border border-dash-line bg-dash-panel sm:grid-cols-3 lg:grid-cols-5 lg:divide-x"
    >
      <Stat
        Icon={CirclePlay}
        label="Videos generated"
        value={count(s.generated)}
        sub="This month"
      />
      <Stat
        Icon={Clock3}
        label="Rendering"
        value={count(s.rendering)}
        sub={s.rendering > 0 ? 'In progress' : 'Nothing running'}
        subTone={s.rendering > 0 ? 'text-ember-text' : 'text-studio-muted'}
      />
      <Stat Icon={CircleCheck} label="Completed" value={count(s.completed)} sub="This month" />
      <Stat
        Icon={Zap}
        label="Avg. generation time"
        value={ready ? durationText(s.avgSeconds) : '…'}
        sub="Per video"
      />
      <Stat
        Icon={Database}
        label="Credits used"
        value={used === null ? '—' : used.toLocaleString('en-US')}
        sub="This period"
      />
    </section>
  );
}

export default function DashboardPage() {
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [summary, setSummary] = useState<BillingSummary | null>(null);
  const [plans, setPlans] = useState<BillingPlan[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let alive = true;
    loadStudio().then((next) => alive && setLoad(next));
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

  const retry = () => {
    setLoad({ state: 'loading' });
    loadStudio().then(setLoad);
  };
  const total = (summary && plans.find((p) => p.id === summary.plan)?.monthly_credits) || null;
  const empty = load.state === 'ready' && load.entries.length === 0;

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

        <div className="relative min-w-0 flex-1 overflow-x-clip">
          <Topbar summary={summary} onMenu={() => setMenuOpen(true)} />
          <main className="pb-8">
            <Hero empty={empty} />
            <div className="flex flex-col gap-[15px] px-5 lg:pr-8 lg:pl-9">
              <CreatePanel />
              <div className="grid grid-cols-[minmax(0,1fr)] gap-[26px] xl:grid-cols-[minmax(0,1fr)_345px]">
                <LatestProducts load={load} retry={retry} />
                <RecentCreations load={load} />
              </div>
              <Stats load={load} summary={summary} total={total} />
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
