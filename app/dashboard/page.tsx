'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, ImagePlus, Link2, Package, PenLine, RefreshCw, Search } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { StatusBadge, type StatusTone } from '../../components/StatusBadge';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../lib/auth';
import { productApi } from '../../lib/api/product';
import { creativeApi } from '../../lib/api/creative';
import type { Product } from '../../lib/types/product';
import type { VideoGenerationJob } from '../../lib/types/creative';
import { createHref, jobBadge, latestJob } from '../../lib/dashboard-rules.mjs';

// shortcut: jobs are fetched per product (N+1) for the 12 most recent products; add a
// user-wide jobs endpoint when the dashboard needs more than one page.
const RECENT_LIMIT = 12;
const ROWS_SHOWN = 6;

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

const NOT_A_STORE = new Set(['null', 'unknown', 'generic', 'manual', 'custom', 'other']);

// What TrendED does after a link is pasted, in the order the flow runs it.
const FLOW = [
  { step: 'Product sheet', what: 'Facts kept apart from guesses' },
  { step: 'Strategy', what: 'Audience, angle and hook' },
  { step: 'Storyboard', what: 'Scenes timed to a 15 or 30 s ad' },
  { step: 'Shots', what: 'Each shot generated, then checked' },
  { step: 'Final cut', what: 'Music, voice, subtitles and export' },
];

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

function greeting(hour: number) {
  if (hour < 5 || hour >= 18) return 'Good evening';
  return hour < 12 ? 'Good morning' : 'Good afternoon';
}

function Thumb({ product }: { product: Product }) {
  const [broken, setBroken] = useState(false);
  const src = product.images?.find((i) => i.is_primary)?.url || product.main_image_url;
  return (
    <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-studio-raised">
      {src && !broken ? (
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          sizes="40px"
          className="object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-studio-meta">
          <Package className="h-4 w-4" strokeWidth={1.5} aria-hidden />
        </div>
      )}
    </div>
  );
}

function Panel({
  id,
  title,
  count,
  action,
  className = '',
  children,
}: {
  id: string;
  title: string;
  count?: number;
  action?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <section aria-labelledby={id} className={`rounded-2xl bg-studio-surface p-5 ${className}`}>
      <div className="flex min-h-7 items-center justify-between gap-3">
        <h2 id={id} className="flex items-center gap-2 text-sm font-semibold text-studio-text">
          {title}
          {count !== undefined && (
            <span className="rounded-full bg-studio-ground px-2 py-0.5 text-xs font-medium tabular-nums text-studio-muted">
              {count}
            </span>
          )}
        </h2>
        {action}
      </div>
      <div className="mt-4">{children}</div>
    </section>
  );
}

const rowClass =
  'flex min-h-[63px] items-center gap-3 rounded-xl border border-studio-rule bg-studio-ground px-3 py-2.5 transition-colors hover:border-line focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange';

function Composer() {
  const router = useRouter();
  const [link, setLink] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.push(createHref(link));
  };
  return (
    <section
      aria-labelledby="composer-title"
      className="flex flex-col justify-between gap-6 rounded-2xl bg-cream p-5 sm:p-6 lg:col-span-8"
    >
      <div>
        <h2 id="composer-title" className="text-base font-semibold text-studio-text">
          New ad from a product page
        </h2>
        <p className="mt-1 max-w-xl text-sm leading-5 text-ink-soft">
          Paste the link. TrendED reads the page, keeps facts apart from guesses and plans the ad
          shot by shot. You check the sheet before anything is rendered.
        </p>
      </div>

      <div>
        <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
          <label htmlFor="product-link" className="sr-only">
            Product page link
          </label>
          <div className="relative flex-1">
            <Link2
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-studio-meta"
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
              className="h-12 w-full rounded-[10px] border border-line bg-studio-ground pr-4 pl-10 text-[15px] text-studio-text caret-trend-orange outline-none transition-colors placeholder:text-studio-meta focus:border-trend-orange focus:ring-2 focus:ring-trend-orange/25"
            />
          </div>
          <button
            type="submit"
            className="flex h-12 shrink-0 items-center justify-center gap-2 rounded-[10px] bg-trend-orange px-6 text-[15px] font-semibold text-on-accent transition-[background-color,transform] hover:bg-trend-orange-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange active:scale-[0.98] motion-reduce:transition-none"
          >
            Create ad
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </form>

        <p className="mt-2 flex flex-wrap items-center gap-x-5 text-sm text-ink-soft">
          <span>No link?</span>
          <Link
            href="/product-input"
            className="inline-flex min-h-11 items-center gap-1.5 font-medium text-studio-text underline-offset-4 hover:underline"
          >
            <ImagePlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Start from photos
          </Link>
          <Link
            href="/product-input?mode=manual"
            className="inline-flex min-h-11 items-center gap-1.5 font-medium text-studio-text underline-offset-4 hover:underline"
          >
            <PenLine className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Type it in
          </Link>
        </p>
      </div>
    </section>
  );
}

function Flow() {
  return (
    <Panel id="flow-title" title="What happens next" className="lg:col-span-4">
      <ol aria-label="Steps of every ad">
        {FLOW.map(({ step, what }, i) => (
          <li
            key={step}
            className={`flex items-baseline justify-between gap-3 py-2 ${i ? 'border-t border-studio-rule' : 'pt-0'}`}
          >
            <span className="shrink-0 text-sm font-medium whitespace-nowrap text-studio-text">
              {step}
            </span>
            <span className="text-right text-[13px] leading-5 text-studio-muted">{what}</span>
          </li>
        ))}
      </ol>
    </Panel>
  );
}

function ProductRow({ entry }: { entry: Entry }) {
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
      <Link href={`/products/${product.id}`} className={`group ${rowClass}`}>
        <Thumb product={product} />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-studio-text group-hover:underline underline-offset-2">
            {product.title}
          </p>
          <p className="truncate text-xs text-studio-muted capitalize tabular-nums">
            {meta || '—'}
          </p>
        </div>
        <StatusBadge tone={badge.tone as StatusTone} label={badge.label} className="shrink-0" />
      </Link>
    </li>
  );
}

function RecentProducts({ load, query, retry }: { load: Load; query: string; retry: () => void }) {
  const shown = useMemo(() => {
    if (load.state !== 'ready') return [];
    const q = query.trim().toLowerCase();
    return q ? load.entries.filter((e) => e.product.title.toLowerCase().includes(q)) : load.entries;
  }, [load, query]);

  return (
    <Panel
      id="recent-title"
      title="Recent products"
      count={load.state === 'ready' ? shown.length : undefined}
      className="lg:col-span-8"
      action={
        <Link
          href="/products"
          className="inline-flex min-h-9 items-center text-sm text-studio-muted underline-offset-4 hover:text-studio-text hover:underline"
        >
          View all
        </Link>
      }
    >
      {load.state === 'loading' && (
        <ul className="space-y-2" aria-busy="true" aria-label="Loading products">
          {Array.from({ length: 3 }, (_, i) => (
            <li key={i} className={rowClass}>
              <div className="size-10 rounded-lg bg-studio-raised" />
              <div className="h-4 w-1/2 rounded bg-studio-raised" />
            </li>
          ))}
        </ul>
      )}

      {load.state === 'error' && (
        <div className="flex flex-col items-start gap-3 rounded-xl border border-studio-rule bg-studio-ground p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-studio-text">
            Your products could not be loaded.{' '}
            <span className="text-studio-muted">{load.message}</span>
          </p>
          <button
            type="button"
            onClick={retry}
            className="inline-flex h-9 items-center gap-2 rounded-lg border border-line bg-studio-ground px-3 text-sm font-medium text-studio-text hover:border-studio-text"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </button>
        </div>
      )}

      {load.state === 'ready' && load.entries.length === 0 && (
        <p className="rounded-xl border border-dashed border-line px-4 py-3 text-sm text-studio-muted">
          No products yet. Paste a product link above: your first ad starts here.
        </p>
      )}

      {load.state === 'ready' && load.entries.length > 0 && shown.length === 0 && (
        <p className="rounded-xl border border-dashed border-line px-4 py-3 text-sm text-studio-muted">
          No recent product matches &ldquo;{query}&rdquo;.
        </p>
      )}

      {shown.length > 0 && (
        <ul className="space-y-2">
          {shown.slice(0, ROWS_SHOWN).map((entry) => (
            <ProductRow key={entry.product.id} entry={entry} />
          ))}
        </ul>
      )}
    </Panel>
  );
}

function Generating({ load }: { load: Load }) {
  const running =
    load.state === 'ready'
      ? load.entries.flatMap(({ product, jobs }) =>
          (jobs ?? [])
            .filter((j) => jobBadge(j).tone === 'active')
            .map((job) => ({ product, job })),
        )
      : [];
  return (
    <Panel
      id="generating-title"
      title="Rendering now"
      count={load.state === 'ready' ? running.length : undefined}
      className="lg:col-span-4"
    >
      {running.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line px-4 py-3 text-sm text-studio-muted">
          {load.state === 'loading'
            ? 'Checking your renders…'
            : 'Nothing is rendering. Ads you start show their progress here.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {running.map(({ product, job }) => {
            const pct = Math.max(0, Math.min(100, Math.round(job.progress_percentage ?? 0)));
            return (
              <li key={job.id}>
                <Link href={`/products/${product.id}/creative`} className={rowClass}>
                  <Thumb product={product} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <p className="truncate text-sm text-studio-text">{product.title}</p>
                      <span className="shrink-0 text-xs tabular-nums text-studio-muted">
                        {pct}%
                      </span>
                    </div>
                    <div
                      className="mt-1.5 h-1 overflow-hidden rounded-full bg-studio-raised"
                      role="progressbar"
                      aria-valuenow={pct}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`${product.title} progress`}
                    >
                      <div
                        className="h-full rounded-full bg-warning"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    {job.current_step && (
                      <p className="mt-1 truncate text-xs text-studio-muted">{job.current_step}</p>
                    )}
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Panel>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [query, setQuery] = useState('');
  const [now] = useState(() => new Date());

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

  const name = user?.first_name?.trim();
  const title = name ? `${greeting(now.getHours())}, ${name}` : 'Studio';

  const topbar = (
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
        className="h-10 w-full rounded-lg border border-studio-rule bg-studio-ground pr-3 pl-9 text-sm text-studio-text outline-none transition-colors placeholder:text-studio-meta focus:border-trend-orange focus:ring-2 focus:ring-trend-orange/25"
      />
    </div>
  );

  return (
    <ProtectedRoute>
      <AppShell active="/dashboard" topbar={topbar}>
        <main className="mx-auto w-full max-w-[1100px] px-4 pt-8 pb-16 sm:px-6 lg:pt-12">
          <h1 className="font-editorial text-[28px] leading-[1.1] text-studio-text sm:text-[32px]">
            {title}
          </h1>
          <p className="mt-1 text-sm text-studio-muted" suppressHydrationWarning>
            {now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>

          {/* 12 columns; both rows split 8 + 4 so every inner edge meets the one above it. */}
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-12">
            <Composer />
            <Flow />
            <RecentProducts load={load} query={query} retry={retry} />
            <Generating load={load} />
          </div>
        </main>
      </AppShell>
    </ProtectedRoute>
  );
}
