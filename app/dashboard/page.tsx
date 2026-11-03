'use client';

import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ChevronRight,
  ImagePlus,
  Link2,
  Package,
  PenLine,
  Plus,
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

// Rows under the title: the latest products, like the reference studio's starter rows.
const RECENT_ROWS = 4;

/** The prompt bar, docked at the foot of the screen: paste a product page, or start from photos / words. */
function Composer() {
  const router = useRouter();
  const [link, setLink] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    router.push(createHref(link));
  };
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 px-3 pb-3 md:px-5 md:pb-5">
      <form
        onSubmit={submit}
        className="studio-bar pointer-events-auto mx-auto flex w-full max-w-[940px] flex-col gap-2 rounded-[24px] p-3 transition-colors has-[input:focus]:border-accent-line"
      >
        <div className="flex items-center gap-3">
          <Link
            href="/product-input"
            aria-label="Start from photos"
            className="studio-chip !size-9 shrink-0 justify-center !p-0"
          >
            <Plus className="size-4" aria-hidden />
          </Link>
          <label htmlFor="product-link" className="sr-only">
            Product page link
          </label>
          <Link2 aria-hidden className="hidden size-4 shrink-0 text-studio-meta sm:block" />
          <input
            id="product-link"
            type="url"
            inputMode="url"
            autoComplete="off"
            value={link}
            onChange={(e) => setLink(e.target.value)}
            placeholder="Paste your product page link"
            className="min-h-10 min-w-0 flex-1 bg-transparent text-[15px] text-studio-text caret-trend-orange outline-none placeholder:text-studio-meta"
          />
        </div>
        <div className="flex flex-wrap items-center gap-1.5">
          <Link href="/product-input" className="studio-chip">
            <ImagePlus className="size-3.5" aria-hidden />
            Start from photos
          </Link>
          <Link href="/product-input?mode=manual" className="studio-chip">
            <PenLine className="size-3.5" aria-hidden />
            Type it in
          </Link>
          <button
            type="submit"
            className="ml-auto inline-flex h-[38px] w-full items-center justify-center gap-2 rounded-[10px] bg-trend-orange px-4 text-[13px] font-semibold text-on-accent transition hover:bg-trend-orange-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange active:scale-[0.98] sm:w-auto"
          >
            Create ad
            <ArrowRight className="size-4" aria-hidden />
          </button>
        </div>
      </form>
    </div>
  );
}

/** Ads rendering right now. Nothing when none run. */
function Rendering({ load }: { load: Load }) {
  if (load.state !== 'ready') return null;
  const running = load.entries.flatMap(({ product, jobs }) =>
    (jobs ?? []).filter((j) => jobBadge(j).tone === 'active').map((job) => ({ product, job })),
  );
  if (running.length === 0) return null;
  return (
    <section aria-labelledby="rendering-title" className="w-full">
      <h2 id="rendering-title" className="px-1 text-[13px] font-semibold text-studio-text">
        Rendering now
      </h2>
      <ul className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-[7px]">
        {running.map(({ product, job }) => {
          const pct = Math.max(0, Math.min(100, Math.round(job.progress_percentage ?? 0)));
          return (
            <li key={job.id}>
              <Link
                href={`/products/${product.id}/creative`}
                className="flex items-center gap-[13px] rounded-[13px] border border-studio-rule bg-white/[0.018] py-2.5 pr-3 pl-2.5 transition hover:border-studio-rule-strong hover:bg-studio-surface"
              >
                <Thumb product={product} className="h-10 w-[58px] rounded-[7px]" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <p className="truncate text-[13px] text-studio-text">{product.title}</p>
                    <span className="shrink-0 text-xs tabular-nums text-studio-muted">{pct}%</span>
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
                    <p className="mt-1 truncate text-xs text-studio-meta">{job.current_step}</p>
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

/** Latest products as rows under the title: thumbnail, name, status. */
function Recent({ load, retry }: { load: Load; retry: () => void }) {
  if (load.state === 'loading') {
    return (
      <ul aria-hidden className="grid w-full gap-[7px]">
        {[0, 1, 2].map((i) => (
          <li key={i} className="h-[62px] animate-pulse rounded-[13px] bg-white/[0.03]" />
        ))}
      </ul>
    );
  }
  if (load.state === 'error') {
    return (
      <button type="button" onClick={retry} title={load.message} className="studio-chip mx-auto">
        <RefreshCw className="size-3.5" aria-hidden />
        Could not load your products. Retry
      </button>
    );
  }
  if (load.entries.length === 0) return null;
  return (
    <section aria-labelledby="recent-title" className="w-full">
      <div className="flex items-baseline justify-between px-1">
        <h2 id="recent-title" className="text-[13px] font-semibold text-studio-text">
          Recent products
        </h2>
        <Link
          href="/products"
          className="text-xs text-studio-meta transition hover:text-studio-text"
        >
          All products
        </Link>
      </div>
      <ul className="mt-2 grid grid-cols-[minmax(0,1fr)] gap-[7px]">
        {load.entries.slice(0, RECENT_ROWS).map((entry) => {
          const badge = badgeOf(entry);
          return (
            <li key={entry.product.id}>
              <Link
                href={`/products/${entry.product.id}`}
                className="group flex items-center gap-[13px] rounded-[13px] border border-studio-rule bg-white/[0.018] py-2.5 pr-3 pl-2.5 transition hover:border-studio-rule-strong hover:bg-studio-surface focus-visible:outline-2 focus-visible:outline-trend-orange"
              >
                <Thumb product={entry.product} className="h-10 w-[58px] rounded-[7px]" />
                <span className="min-w-0 flex-1 truncate text-[13px] text-studio-muted transition group-hover:text-studio-text">
                  {entry.product.title}
                </span>
                <StatusBadge
                  tone={badge.tone as StatusTone}
                  label={badge.label}
                  className="shrink-0"
                />
                <ChevronRight
                  className="size-4 shrink-0 text-studio-meta transition group-hover:translate-x-0.5 group-hover:text-studio-text"
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
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
        {/* pb clears the docked composer (about 130px tall, more on phones). */}
        <main className="flex flex-1 flex-col items-center justify-center px-4 pt-10 pb-56 sm:pb-44">
          <div className="flex w-full max-w-[544px] flex-col items-center gap-[9px] text-center">
            <h1 className="text-xl font-semibold tracking-[-0.01em] text-studio-text">
              Create an ad
            </h1>
            <p className="max-w-[46ch] text-[13px] text-studio-meta">
              Paste a product page below. TrendED writes the product sheet, plans the shots and
              renders the ad. You check the facts before anything is rendered.
            </p>
          </div>
          <div className="mt-6 flex w-full max-w-[544px] flex-col gap-6">
            <Rendering load={load} />
            <Recent load={load} retry={retry} />
          </div>
          <Composer />
        </main>
      </AppShell>
    </ProtectedRoute>
  );
}
