'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Clapperboard,
  ImagePlus,
  Link2,
  Package,
  PenLine,
  RefreshCw,
} from 'lucide-react';
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

// What TrendED does after a link is pasted, in the order the flow runs it.
const FLOW = ['Product sheet', 'Strategy', 'Storyboard', 'Shots checked one by one', 'Final cut'];

function badgeOf({ jobs }: Entry) {
  return jobs === null ? { tone: 'idle', label: 'Status unavailable' } : jobBadge(latestJob(jobs));
}

function Thumb({ product, className }: { product: Product; className: string }) {
  const [broken, setBroken] = useState(false);
  const src = product.images?.find((i) => i.is_primary)?.url || product.main_image_url;
  return (
    <div className={`relative shrink-0 overflow-hidden bg-studio-raised ${className}`}>
      {src && !broken ? (
        <Image
          src={src}
          alt=""
          fill
          unoptimized
          sizes="96px"
          className="object-cover"
          onError={() => setBroken(true)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-studio-meta">
          <Package className="h-5 w-5" strokeWidth={1.5} aria-hidden />
        </div>
      )}
    </div>
  );
}

/** Icon tile above the title, the studio's emblem. */
function Emblem() {
  return (
    <div className="relative mb-8 md:mb-10">
      <div
        aria-hidden
        className="absolute inset-0 rounded-full bg-trend-orange/20 opacity-40 blur-[100px]"
      />
      <div className="relative flex size-24 items-center justify-center overflow-hidden rounded-3xl border border-white/5 bg-white/[0.04] md:size-32">
        <Clapperboard
          aria-hidden
          strokeWidth={1}
          className="absolute -right-4 -bottom-4 size-20 text-trend-orange opacity-20"
        />
        <div className="relative z-10 flex size-16 items-center justify-center rounded-2xl border border-trend-orange/20 bg-trend-orange/10 shadow-glow">
          <Clapperboard aria-hidden strokeWidth={1.5} className="size-8 text-trend-orange" />
        </div>
      </div>
    </div>
  );
}

const chip =
  'inline-flex min-h-10 items-center gap-2 whitespace-nowrap rounded-2xl border border-white/5 bg-white/5 px-4 text-xs font-bold text-white transition hover:bg-white/10 hover:text-trend-orange focus-visible:outline-2 focus-visible:outline-trend-orange';

/** The prompt bar: paste a product page, or start from photos / your own words. */
function Composer() {
  const router = useRouter();
  const [link, setLink] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.push(createHref(link));
  };
  return (
    <form
      onSubmit={submit}
      className="flex w-full max-w-4xl flex-col gap-3 rounded-[1.5rem] border border-white/10 bg-[#111] p-3 md:gap-5 md:rounded-[2.5rem] md:p-5"
    >
      <div className="flex items-start gap-4 px-2">
        <Link2 aria-hidden className="mt-3.5 size-5 shrink-0 text-trend-orange md:mt-4" />
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
          placeholder="Paste your product page link"
          className="min-h-12 min-w-0 flex-1 bg-transparent pt-1 text-base text-white caret-trend-orange outline-none placeholder:text-studio-meta md:text-xl"
        />
      </div>
      <div className="flex flex-col items-stretch justify-between gap-4 border-t border-white/5 px-2 pt-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 overflow-x-auto">
          <Link href="/product-input" className={chip}>
            <ImagePlus className="size-4" aria-hidden />
            Start from photos
          </Link>
          <Link href="/product-input?mode=manual" className={chip}>
            <PenLine className="size-4" aria-hidden />
            Type it in
          </Link>
        </div>
        <button
          type="submit"
          className="flex min-h-12 items-center justify-center gap-2 rounded-xl bg-trend-orange px-8 text-sm font-black text-on-accent transition hover:scale-105 hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange active:scale-95 motion-reduce:transition-none md:rounded-[1.5rem] md:text-base"
        >
          Create ad
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
    </form>
  );
}

/** Ads rendering right now, as cards under the prompt bar. Nothing when none run. */
function Rendering({ load }: { load: Load }) {
  if (load.state !== 'ready') return null;
  const running = load.entries.flatMap(({ product, jobs }) =>
    (jobs ?? []).filter((j) => jobBadge(j).tone === 'active').map((job) => ({ product, job })),
  );
  if (running.length === 0) return null;
  return (
    <section aria-labelledby="rendering-title" className="mt-10 w-full max-w-4xl">
      <h2 id="rendering-title" className="px-2 text-sm font-bold text-white">
        Rendering now
      </h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2">
        {running.map(({ product, job }) => {
          const pct = Math.max(0, Math.min(100, Math.round(job.progress_percentage ?? 0)));
          return (
            <li key={job.id}>
              <Link
                href={`/products/${product.id}/creative`}
                className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 p-3 transition hover:bg-white/10"
              >
                <Thumb product={product} className="size-12 rounded-xl" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-sm font-bold text-white">{product.title}</p>
                    <span className="shrink-0 text-xs tabular-nums text-ink-muted">{pct}%</span>
                  </div>
                  <div
                    className="mt-2 h-1 overflow-hidden rounded-full bg-white/10"
                    role="progressbar"
                    aria-valuenow={pct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`${product.title} progress`}
                  >
                    <div className="h-full rounded-full bg-warning" style={{ width: `${pct}%` }} />
                  </div>
                  {job.current_step && (
                    <p className="mt-1 truncate text-xs text-ink-muted">{job.current_step}</p>
                  )}
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** History: recent products as thumbnails. Right rail on desktop, a strip on phones. */
function History({ load, retry }: { load: Load; retry: () => void }) {
  const entries = load.state === 'ready' ? load.entries : [];
  const items = entries.map((entry, i) => {
    const badge = badgeOf(entry);
    return (
      <li key={entry.product.id} className="shrink-0">
        <Link
          href={`/products/${entry.product.id}`}
          title={`${entry.product.title} · ${badge.label}`}
          className={`group relative block overflow-hidden rounded-xl border-2 transition focus-visible:outline-2 focus-visible:outline-trend-orange ${
            i === 0 ? 'border-trend-orange shadow-glow' : 'border-white/10 hover:border-white/30'
          }`}
        >
          <Thumb
            product={entry.product}
            className="size-16 md:aspect-square md:size-auto md:w-full"
          />
          <span className="sr-only">
            {entry.product.title}, {badge.label}
          </span>
        </Link>
      </li>
    );
  });

  const empty =
    load.state === 'loading' ? (
      <p className="text-center text-[11px] text-ink-muted">Loading…</p>
    ) : load.state === 'error' ? (
      <button
        type="button"
        onClick={retry}
        title={load.message}
        className="flex flex-col items-center gap-1 text-[11px] font-bold text-ink-muted hover:text-white"
      >
        <RefreshCw className="size-4" aria-hidden />
        Retry
      </button>
    ) : entries.length === 0 ? (
      <p className="text-center text-[11px] text-ink-muted">No products yet</p>
    ) : null;

  return (
    <>
      <aside
        aria-labelledby="history-title"
        className="fixed top-16 right-0 bottom-0 z-40 hidden w-24 flex-col items-center gap-3 overflow-y-auto border-l border-white/5 bg-black/60 py-4 md:flex"
      >
        <h2 id="history-title" className="text-[11px] font-bold text-ink-muted">
          Recent
        </h2>
        {empty}
        <ul className="flex w-full flex-col gap-2 px-2">{items}</ul>
        {entries.length > 0 && (
          <Link
            href="/products"
            className="mt-1 text-[11px] font-bold text-ink-muted hover:text-white"
          >
            All
          </Link>
        )}
      </aside>

      <section aria-label="Recent products" className="mt-10 w-full max-w-4xl md:hidden">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-bold text-white">Recent</h2>
          <Link href="/products" className="text-xs font-bold text-ink-muted hover:text-white">
            All products
          </Link>
        </div>
        <div className="mt-3 px-2">{empty}</div>
        <ul className="mt-1 flex gap-2 overflow-x-auto px-2 pb-2">{items}</ul>
      </section>
    </>
  );
}

/** Latest product with its status, under the prompt: what the rail's highlighted thumb is. */
function Latest({ load }: { load: Load }) {
  if (load.state !== 'ready' || load.entries.length === 0) return null;
  const entry = load.entries[0];
  const badge = badgeOf(entry);
  return (
    <Link
      href={`/products/${entry.product.id}`}
      className="mt-6 inline-flex max-w-full items-center gap-3 rounded-2xl border border-white/5 bg-white/5 py-2 pr-3 pl-2 transition hover:bg-white/10"
    >
      <Thumb product={entry.product} className="size-9 rounded-lg" />
      <span className="truncate text-xs font-bold text-white">{entry.product.title}</span>
      <StatusBadge tone={badge.tone as StatusTone} label={badge.label} className="shrink-0" />
    </Link>
  );
}

export default function DashboardPage() {
  const [load, setLoad] = useState<Load>({ state: 'loading' });

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

  return (
    <ProtectedRoute>
      <AppShell active="/dashboard">
        <main className="flex flex-1 flex-col items-center justify-center px-4 py-12 md:pr-28 md:pl-6 lg:py-16">
          <div className="flex flex-col items-center">
            <Emblem />
            <h1 className="px-4 text-center text-4xl font-black tracking-widest text-white uppercase sm:text-5xl md:text-7xl">
              Create an ad
            </h1>
            <p className="mt-4 max-w-xl text-center text-sm font-medium text-ink-muted">
              Paste a product page. TrendED writes the product sheet, plans the shots and renders
              the ad. You check the facts before anything is rendered.
            </p>
          </div>

          <div className="mt-10 flex w-full flex-col items-center md:mt-16">
            <Composer />
            <p className="mt-5 max-w-4xl px-4 text-center text-xs text-studio-meta">
              {FLOW.join('  ·  ')}
            </p>
            <Latest load={load} />
            <Rendering load={load} />
            <History load={load} retry={retry} />
          </div>
        </main>
      </AppShell>
    </ProtectedRoute>
  );
}
