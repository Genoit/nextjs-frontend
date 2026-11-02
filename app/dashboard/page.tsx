'use client';

import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ArrowRight, ImagePlus, Link2, Package, PenLine, RefreshCw, Search } from 'lucide-react';
import { AppShell } from '../../components/AppShell';
import { StatusBadge, type StatusTone } from '../../components/StatusBadge';
import ProtectedRoute from '../../components/ProtectedRoute';
import { productApi } from '../../lib/api/product';
import { creativeApi } from '../../lib/api/creative';
import type { Product } from '../../lib/types/product';
import type { VideoGenerationJob } from '../../lib/types/creative';
import { createHref, jobBadge, latestJob } from '../../lib/dashboard-rules.mjs';

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

const NOT_A_STORE = new Set(['null', 'unknown', 'generic', 'manual', 'custom', 'other']);

const PIPELINE = ['Product sheet', 'Strategy', 'Storyboard', 'Shots', 'Final cut'];

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

// Illustrates how every ad is cut; not a generated result, so it carries no product data.
const AD_BEATS = [
  { beat: 'Hook', time: '0–2 s', tone: 'bg-trend-orange' },
  { beat: 'Problem', time: '2–5 s', tone: 'bg-stage-text/30' },
  { beat: 'Product', time: '5–10 s', tone: 'bg-trend-gold' },
  { beat: 'Proof', time: '10–13 s', tone: 'bg-stage-text/30' },
  { beat: 'Call to action', time: '13–15 s', tone: 'bg-trend-orange' },
];

function AdAnatomy() {
  return (
    <figure className="hidden lg:block" aria-labelledby="anatomy-caption">
      <div className="mx-auto flex aspect-[9/16] w-[220px] flex-col justify-between rounded-[28px] bg-stage p-4 text-stage-text shadow-[0_24px_60px_-24px_rgba(28,25,23,0.55)]">
        <div className="flex items-center justify-between text-[11px] text-stage-text/70">
          <span className="font-semibold tracking-wide text-stage-text">9:16</span>
          <span>15 s</span>
        </div>
        <ol className="space-y-2">
          {AD_BEATS.map(({ beat, time, tone }) => (
            <li key={beat} className="flex items-center gap-2.5">
              <span aria-hidden className={`h-8 w-1 shrink-0 rounded-full ${tone}`} />
              <span className="min-w-0 flex-1">
                <span className="block text-[13px] font-medium leading-tight">{beat}</span>
                <span className="block text-[11px] tabular-nums text-stage-text/60">{time}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="text-[11px] leading-snug text-stage-text/60">TikTok · Reels · Shorts</p>
      </div>
      <figcaption id="anatomy-caption" className="mt-3 text-center text-xs text-studio-meta">
        How every ad is cut
      </figcaption>
    </figure>
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
    <section
      aria-labelledby="studio-title"
      className="grid items-center gap-8 overflow-hidden rounded-3xl bg-cream p-5 sm:p-8 lg:grid-cols-[1fr_240px] lg:gap-12 lg:p-10"
    >
      <div className="min-w-0">
        <p className="text-sm font-medium text-trend-orange-strong">Studio</p>
        <h1
          id="studio-title"
          className="mt-2 font-editorial text-[38px] leading-[1.02] tracking-[-0.01em] text-balance text-studio-text sm:text-[52px]"
        >
          Turn a product into a video ad
        </h1>
        <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-studio-muted sm:text-base">
          Paste the product page. TrendED reads it, separates facts from guesses, and builds the ad
          shot by shot.
        </p>

        <form onSubmit={submit} className="mt-7 flex flex-col gap-3 sm:flex-row">
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
              className="h-14 w-full rounded-xl bg-white pl-12 pr-4 text-base text-studio-text caret-trend-orange shadow-sm outline-none ring-1 ring-line transition placeholder:text-studio-meta focus:ring-2 focus:ring-trend-orange"
            />
          </div>
          <button
            type="submit"
            className="flex h-14 shrink-0 items-center justify-center gap-2 rounded-xl bg-trend-orange px-7 text-[15px] font-semibold text-white shadow-sm transition hover:bg-trend-orange-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange active:scale-[0.98]"
          >
            Create ad
            <ArrowRight className="h-4 w-4" aria-hidden />
          </button>
        </form>

        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
          <Link
            href="/product-input"
            className="inline-flex min-h-11 items-center gap-1.5 text-studio-muted underline-offset-4 transition-colors hover:text-studio-text hover:underline"
          >
            <ImagePlus className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            No link? Start from photos
          </Link>
          <Link
            href="/product-input?mode=manual"
            className="inline-flex min-h-11 items-center gap-1.5 text-studio-muted underline-offset-4 transition-colors hover:text-studio-text hover:underline"
          >
            <PenLine className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            Type it in
          </Link>
        </div>

        <ol
          className="mt-5 flex flex-wrap gap-2 border-t border-trend-gold/25 pt-5"
          aria-label="What happens next"
        >
          {PIPELINE.map((step, i) => (
            <li
              key={step}
              className="inline-flex items-center gap-2 rounded-full bg-white/70 py-1 pl-1 pr-3 text-sm text-studio-muted"
            >
              <span
                aria-hidden
                className="flex size-6 items-center justify-center rounded-full bg-white text-xs font-semibold tabular-nums text-trend-orange-strong"
              >
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </div>

      <AdAnatomy />
    </section>
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
        className="group block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-trend-orange"
      >
        <div className="relative">
          <Thumb product={product} className="aspect-[4/5] w-full rounded-xl" />
          <StatusBadge
            tone={badge.tone as StatusTone}
            label={badge.label}
            className="absolute bottom-2.5 left-2.5 shadow-sm"
          />
        </div>
        <p className="mt-2.5 line-clamp-2 text-sm leading-snug font-medium text-studio-text group-hover:underline underline-offset-2">
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
                className="flex items-center gap-3 rounded-xl bg-studio-raised p-2.5 transition-colors hover:bg-studio-rule focus-visible:outline-2 focus-visible:outline-trend-orange"
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
                    <div className="h-full rounded-full bg-warning" style={{ width: `${pct}%` }} />
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
            className="inline-flex h-9 items-center gap-2 rounded-full bg-studio-text px-4 text-sm font-medium text-studio-ground transition hover:bg-black active:scale-[0.98]"
          >
            <RefreshCw className="h-4 w-4" aria-hidden />
            Try again
          </button>
        </div>
      )}

      {load.state === 'ready' && load.entries.length === 0 && (
        <div className="mt-4 rounded-2xl border border-dashed border-studio-rule px-5 py-10 text-center">
          <p className="text-[15px] font-medium text-studio-text">No products yet</p>
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

  const topbar = (
    <>
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
          className="h-10 w-full rounded-lg bg-studio-surface pr-3 pl-9 text-sm text-studio-text outline-none ring-1 ring-studio-rule transition placeholder:text-studio-meta focus:ring-trend-orange"
        />
      </div>
      <Link
        href="/products"
        className="ml-auto hidden h-10 shrink-0 items-center gap-2 rounded-lg px-3 text-sm font-medium text-studio-muted transition hover:bg-studio-surface hover:text-studio-text sm:inline-flex"
      >
        <Package className="h-4 w-4" strokeWidth={1.75} aria-hidden />
        My products
      </Link>
    </>
  );

  return (
    <ProtectedRoute>
      <AppShell active="/dashboard" topbar={topbar}>
        <main className="mx-auto w-full max-w-[1200px] space-y-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          <Composer />
          {load.state === 'ready' && <Generating entries={load.entries} />}
          <Gallery load={load} query={query} retry={retry} />
        </main>
      </AppShell>
    </ProtectedRoute>
  );
}
