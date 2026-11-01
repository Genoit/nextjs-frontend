'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ChevronRight,
  Clapperboard,
  ImagePlus,
  Link2,
  LogOut,
  Menu,
  Package,
  Plus,
  RefreshCw,
  Search,
  X,
} from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/auth';
import { productApi } from '../../lib/api/product';
import { creativeApi } from '../../lib/api/creative';
import type { Product } from '../../lib/types/product';
import type { VideoGenerationJob } from '../../lib/types/creative';
import {
  createHref,
  formatUsd,
  jobBadge,
  latestJob,
  studioStats,
} from '../../lib/dashboard-rules.mjs';

// shortcut: jobs are fetched per product (N+1) for the 12 most recent products; add a
// user-wide jobs endpoint when the dashboard needs more than one page.
const RECENT_LIMIT = 12;

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

const NAV = [
  { href: '/dashboard', label: 'Studio', icon: Clapperboard },
  { href: '/products', label: 'Products', icon: Package },
  { href: '/product-input', label: 'New ad', icon: Plus },
];

const NOT_A_STORE = new Set(['null', 'unknown', 'generic', 'manual', 'custom', 'other']);

const PIPELINE = ['Product sheet', 'Strategy', 'Storyboard', 'Shots', 'Final cut'];

const BADGE_TONE: Record<string, string> = {
  idle: 'text-studio-muted',
  active: 'text-trend-orange-glow',
  ready: 'text-green-400',
  failed: 'text-red-400',
};

function priceText(p: Product) {
  if (p.price === null || p.price === undefined) return null;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: p.currency || 'USD',
    }).format(p.price);
  } catch {
    return `${p.price} ${p.currency}`;
  }
}

function Thumb({ product, className }: { product: Product; className: string }) {
  const [broken, setBroken] = useState(false);
  const src = product.images?.find((i) => i.is_primary)?.url || product.main_image_url;
  return (
    <div className={`relative overflow-hidden bg-studio-raised ${className}`}>
      {src && !broken ? (
        <Image
          src={src}
          alt={product.title}
          fill
          unoptimized
          sizes="(min-width: 1280px) 25vw, (min-width: 768px) 33vw, 50vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-studio-meta">
          <Package className="h-7 w-7" strokeWidth={1.5} aria-hidden />
        </div>
      )}
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const { user, logout } = useAuth();
  const name = user ? `${user.first_name} ${user.last_name}`.trim() : '';
  return (
    <div className="flex h-full flex-col justify-between">
      <div>
        <Link
          href="/dashboard"
          onClick={onNavigate}
          className="flex h-16 items-center gap-2.5 px-5 focus-visible:outline-2 focus-visible:outline-trend-orange-glow"
        >
          <Image src="/symbol.png" alt="" width={26} height={26} className="object-contain" />
          <span className="text-[17px] font-semibold tracking-tight text-studio-text">TrendED</span>
        </Link>
        <nav aria-label="Main" className="mt-3 space-y-0.5 px-3">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = href === '/dashboard';
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={`flex h-9 items-center gap-2.5 rounded-lg px-2.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-trend-orange-glow ${
                  active
                    ? 'bg-studio-raised text-studio-text'
                    : 'text-studio-muted hover:bg-studio-surface hover:text-studio-text'
                }`}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} aria-hidden />
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-studio-rule p-3">
        <div className="flex items-center gap-2.5 px-2 py-2">
          <span
            aria-hidden
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-studio-raised text-xs font-semibold text-studio-text"
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
          className="mt-1 flex h-9 w-full items-center gap-2.5 rounded-lg px-2.5 text-sm text-studio-muted transition-colors hover:bg-studio-surface hover:text-studio-text focus-visible:outline-2 focus-visible:outline-trend-orange-glow"
        >
          <LogOut className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Sign out
        </button>
      </div>
    </div>
  );
}

function Composer() {
  const router = useRouter();
  const [link, setLink] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.push(createHref(link));
  };
  return (
    <section aria-labelledby="studio-title" className="rounded-2xl bg-studio-surface p-5 sm:p-7">
      <h1
        id="studio-title"
        className="font-editorial text-[34px] leading-[1.05] tracking-[-0.01em] text-balance text-studio-text sm:text-[46px]"
      >
        Turn a product into a video ad
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-studio-muted">
        Paste the product page. TrendED reads it, separates facts from guesses, and builds the ad
        shot by shot.
      </p>

      <form onSubmit={submit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <label htmlFor="product-link" className="sr-only">
          Product link
        </label>
        <div className="relative flex-1">
          <Link2
            className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-studio-meta"
            strokeWidth={1.75}
            aria-hidden
          />
          <input
            id="product-link"
            type="url"
            inputMode="url"
            autoComplete="off"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="https://store.com/products/your-product"
            className="h-14 w-full rounded-xl bg-studio-raised pl-12 pr-4 text-base text-studio-text caret-trend-orange-glow outline-none ring-1 ring-transparent transition placeholder:text-studio-meta focus:ring-trend-orange-glow"
          />
        </div>
        <button
          type="submit"
          className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-trend-orange px-6 text-[15px] font-semibold text-white transition hover:bg-trend-orange-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange-glow active:scale-[0.98]"
        >
          Create ad
          <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      </form>

      <div className="mt-5 flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <ol
          className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-studio-meta"
          aria-label="What happens next"
        >
          {PIPELINE.map((step, i) => (
            <li key={step} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5" aria-hidden />}
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <Link
          href="/product-input"
          className="inline-flex items-center gap-1.5 text-studio-muted underline-offset-4 transition-colors hover:text-studio-text hover:underline"
        >
          <ImagePlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          No link? Start from photos
        </Link>
      </div>
    </section>
  );
}

function Stats({ entries }: { entries: Entry[] }) {
  const s = studioStats(entries.map((e) => ({ jobs: e.jobs ?? [] })));
  const cells = [
    {
      label: 'Products',
      value: String(s.products),
      note: s.products === RECENT_LIMIT ? 'Most recent shown' : 'In your library',
    },
    {
      label: 'Generating',
      value: String(s.inProgress),
      note: s.inProgress ? 'Rendering now' : 'Nothing running',
    },
    { label: 'Ready videos', value: String(s.ready), note: 'Completed jobs' },
    {
      label: 'Spend',
      value: formatUsd(s.spend),
      note: s.unmeasured
        ? `${s.unmeasured} job${s.unmeasured > 1 ? 's' : ''} not measured yet`
        : 'Actual provider cost',
    },
  ];
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl bg-studio-rule lg:grid-cols-4">
      {cells.map((c) => (
        <div key={c.label} className="bg-studio-surface px-5 py-4">
          <dt className="text-sm text-studio-muted">{c.label}</dt>
          <dd className="mt-1 text-[26px] leading-tight font-normal text-studio-text tabular-nums">
            {c.value}
          </dd>
          <dd className="mt-0.5 text-xs text-studio-meta">{c.note}</dd>
        </div>
      ))}
    </dl>
  );
}

function ProductCard({ entry }: { entry: Entry }) {
  const { product, jobs } = entry;
  const badge =
    jobs === null ? { tone: 'idle', label: 'Status unavailable' } : jobBadge(latestJob(jobs));
  // The API also sends generic/manual/unknown (absent from SourcePlatform): not a store name.
  const platform = NOT_A_STORE.has(String(product.source_platform))
    ? null
    : product.source_platform;
  const meta = [platform, priceText(product)].filter(Boolean).join(' · ');
  return (
    <li>
      <Link
        href={`/products/${product.id}`}
        className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-trend-orange-glow"
      >
        <div className="relative">
          <Thumb product={product} className="aspect-[4/5] w-full rounded-xl" />
          <span
            className={`absolute bottom-2.5 left-2.5 rounded-full bg-black/75 px-2.5 py-1 text-xs font-medium ${BADGE_TONE[badge.tone]}`}
          >
            {badge.label}
          </span>
        </div>
        <p className="mt-2.5 line-clamp-2 text-sm leading-snug font-medium text-studio-text group-hover:text-white">
          {product.title}
        </p>
        {meta && <p className="mt-0.5 truncate text-xs text-studio-meta capitalize">{meta}</p>}
      </Link>
    </li>
  );
}

function Generating({ entries }: { entries: Entry[] }) {
  const running = entries.flatMap(({ product, jobs }) =>
    (jobs ?? []).filter((j) => jobBadge(j).tone === 'active').map((job) => ({ product, job })),
  );
  if (running.length === 0) return null;
  return (
    <section aria-labelledby="generating-title" className="rounded-2xl bg-studio-surface p-5">
      <h2 id="generating-title" className="text-sm font-semibold text-studio-text">
        Generating now <span className="ml-1 font-normal text-studio-meta">{running.length}</span>
      </h2>
      <ul className="mt-3 space-y-2">
        {running.map(({ product, job }) => {
          const pct = Math.max(0, Math.min(100, Math.round(job.progress_percentage ?? 0)));
          return (
            <li key={job.id}>
              <Link
                href={`/products/${product.id}/creative`}
                className="flex items-center gap-3 rounded-xl bg-studio-raised p-2.5 transition-colors hover:bg-studio-rule focus-visible:outline-2 focus-visible:outline-trend-orange-glow"
              >
                <Thumb product={product} className="h-11 w-11 shrink-0 rounded-lg" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-studio-text">{product.title}</p>
                  <div
                    className="mt-1.5 h-1 overflow-hidden rounded-full bg-studio-rule"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${product.title} progress`}
                  >
                    <div
                      className="h-full rounded-full bg-trend-orange-glow"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
                <span className="shrink-0 text-right text-xs text-studio-muted tabular-nums">
                  {job.current_step ? `${pct}% · ${job.current_step}` : `${pct}%`}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Gallery({ load, query, retry }: { load: Load; query: string; retry: () => void }) {
  const shown = useMemo(() => {
    if (load.state !== 'ready') return [];
    const q = query.trim().toLowerCase();
    return q ? load.entries.filter((e) => e.product.title.toLowerCase().includes(q)) : load.entries;
  }, [load, query]);

  return (
    <section aria-labelledby="recent-title">
      <div className="flex items-baseline justify-between">
        <h2 id="recent-title" className="text-sm font-semibold text-studio-text">
          Recent products
          {load.state === 'ready' && (
            <span className="ml-1.5 font-normal text-studio-meta">{load.entries.length}</span>
          )}
        </h2>
        <Link
          href="/products"
          className="text-sm text-studio-muted underline-offset-4 transition-colors hover:text-studio-text hover:underline"
        >
          View all
        </Link>
      </div>

      {load.state === 'loading' && (
        <ul
          className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4"
          aria-busy="true"
          aria-label="Loading products"
        >
          {Array.from({ length: 4 }, (_, i) => (
            <li key={i}>
              <div className="aspect-[4/5] rounded-xl bg-studio-surface motion-safe:animate-pulse" />
              <div className="mt-2.5 h-4 w-3/4 rounded bg-studio-surface motion-safe:animate-pulse" />
            </li>
          ))}
        </ul>
      )}

      {load.state === 'error' && (
        <div className="mt-4 flex flex-col items-start gap-3 rounded-2xl bg-studio-surface p-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-studio-text">
            Your products could not be loaded.{' '}
            <span className="text-studio-muted">{load.message}</span>
          </p>
          <button
            type="button"
            onClick={retry}
            className="inline-flex h-9 items-center gap-2 rounded-full bg-studio-text px-4 text-sm font-medium text-studio-ground transition hover:bg-white active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </button>
        </div>
      )}

      {load.state === 'ready' && load.entries.length === 0 && (
        <div className="mt-4 rounded-2xl bg-studio-surface px-5 py-10 text-center">
          <p className="text-[15px] text-studio-text">No products yet.</p>
          <p className="mt-1 text-sm text-studio-muted">
            Paste a product link above and your first ad starts here.
          </p>
        </div>
      )}

      {load.state === 'ready' && load.entries.length > 0 && shown.length === 0 && (
        <p className="mt-4 rounded-2xl bg-studio-surface px-5 py-6 text-sm text-studio-muted">
          No recent product matches &ldquo;{query}&rdquo;.
        </p>
      )}

      {shown.length > 0 && (
        <ul className="mt-4 grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-3 xl:grid-cols-4">
          {shown.map((entry) => (
            <ProductCard key={entry.product.id} entry={entry} />
          ))}
        </ul>
      )}
    </section>
  );
}

export default function DashboardPage() {
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [query, setQuery] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadStudio().then((next) => {
      if (!cancelled) setLoad(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const retry = () => {
    setLoad({ state: 'loading' });
    loadStudio().then(setLoad);
  };

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <ProtectedRoute>
      <div className="flex min-h-dvh bg-studio-ground font-sans text-studio-text antialiased selection:bg-trend-orange selection:text-white">
        <aside className="sticky top-0 hidden h-dvh w-[232px] shrink-0 border-r border-studio-rule lg:block">
          <Sidebar />
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
              className="absolute inset-0 bg-black/70"
              onClick={() => setMenuOpen(false)}
            />
            <div className="relative h-full w-[272px] bg-studio-ground shadow-2xl">
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="absolute top-4 right-3 rounded-lg p-2 text-studio-muted hover:bg-studio-surface hover:text-studio-text"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" aria-hidden />
              </button>
              <Sidebar onNavigate={() => setMenuOpen(false)} />
            </div>
          </div>
        )}

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-studio-rule bg-studio-ground px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="-ml-1 rounded-lg p-2 text-studio-muted hover:bg-studio-surface hover:text-studio-text lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" aria-hidden />
            </button>
            <div className="relative w-full max-w-md">
              <label htmlFor="studio-search" className="sr-only">
                Search recent products
              </label>
              <Search
                className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-studio-meta"
                aria-hidden
              />
              <input
                id="studio-search"
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search recent products"
                className="h-9 w-full rounded-lg bg-studio-surface pr-3 pl-9 text-sm text-studio-text outline-none ring-1 ring-transparent transition placeholder:text-studio-meta focus:ring-studio-muted"
              />
            </div>
            <Link
              href="/products"
              className="ml-auto hidden h-9 shrink-0 items-center rounded-full bg-studio-text px-4 text-sm font-medium text-studio-ground transition hover:bg-white active:scale-[0.98] sm:inline-flex"
            >
              My products
            </Link>
          </header>

          <main className="mx-auto w-full max-w-[1200px] space-y-8 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
            <Composer />
            {load.state === 'ready' && load.entries.length > 0 && <Stats entries={load.entries} />}
            {load.state === 'ready' && <Generating entries={load.entries} />}
            <Gallery load={load} query={query} retry={retry} />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
