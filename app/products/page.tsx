'use client';

import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Package, Plus, RefreshCw } from 'lucide-react';
import ProtectedRoute from '../../components/ProtectedRoute';
import { StatusBadge, type StatusTone } from '../../components/StatusBadge';
import { useProducts } from '../../hooks/use-products';
import { creativeApi } from '../../lib/api/creative';
import { jobBadge, latestJob } from '../../lib/dashboard-rules.mjs';
import type { Product } from '../../lib/types/product';

type Badge = { tone: StatusTone; label: string };

// Filters on the real state of each product's latest video, like the reference library's type filters.
const FILTERS: { key: 'all' | StatusTone; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'ready', label: 'Ready' },
  { key: 'active', label: 'Generating' },
  { key: 'simulated', label: 'Simulated' },
  { key: 'failed', label: 'Failed' },
  { key: 'idle', label: 'No video yet' },
];

const NOT_A_STORE = new Set(['null', 'unknown', 'generic', 'manual', 'custom', 'other']);

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

function Card({ product, badge }: { product: Product; badge: Badge | undefined }) {
  const [broken, setBroken] = useState(false);
  const src = product.images?.find((i) => i.is_primary)?.url || product.main_image_url;
  const platform = NOT_A_STORE.has(String(product.source_platform))
    ? null
    : product.source_platform;
  const meta = [platform, priceText(product)].filter(Boolean).join(' · ');
  return (
    <li>
      <Link
        href={`/products/${product.id}`}
        className="group relative block overflow-hidden rounded-2xl border border-white/10 bg-[#141414] transition duration-300 hover:scale-[1.02] hover:border-trend-orange/50 hover:shadow-glow focus-visible:outline-2 focus-visible:outline-trend-orange active:scale-[0.98] motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        <div className="relative aspect-square w-full overflow-hidden bg-black/40">
          {src && !broken ? (
            <Image
              src={src}
              alt=""
              fill
              unoptimized
              sizes="(min-width: 1280px) 20vw, (min-width: 640px) 33vw, 50vw"
              className="object-cover"
              onError={() => setBroken(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-white/5 text-studio-meta">
              <Package className="size-8" strokeWidth={1.25} aria-hidden />
            </div>
          )}
        </div>
        <div className="absolute top-3 left-3 max-w-[calc(100%-1.5rem)]">
          {badge ? (
            <StatusBadge tone={badge.tone} label={badge.label} className="bg-black/80" />
          ) : (
            <span className="block h-6 w-20 rounded-full bg-black/60" aria-hidden />
          )}
        </div>
        {/* Title always readable on touch screens: no hover-only text. */}
        <div className="absolute inset-x-0 bottom-0 bg-black/85 p-3">
          <p className="line-clamp-2 text-xs leading-snug font-bold text-white">{product.title}</p>
          <p className="mt-1 truncate text-[11px] text-ink-muted capitalize tabular-nums">
            {meta || 'Added ' + new Date(product.created_at).toLocaleDateString('en-US')}
          </p>
        </div>
      </Link>
    </li>
  );
}

export default function ProductsPage() {
  const {
    products,
    total,
    page,
    totalPages,
    isLoading,
    error,
    refresh,
    goToNextPage,
    goToPreviousPage,
    canGoToNextPage,
    canGoToPreviousPage,
  } = useProducts({ initialPageSize: 20, fetchOnMount: true });
  const [badges, setBadges] = useState<Record<string, Badge>>({});
  const [filter, setFilter] = useState<(typeof FILTERS)[number]['key']>('all');

  // shortcut: one jobs call per product on the page (N+1, 20 max); add a list endpoint with
  // the latest job status when the library grows past a few pages.
  useEffect(() => {
    let alive = true;
    Promise.allSettled(products.map((p) => creativeApi.listVideoJobs(p.id))).then((res) => {
      if (!alive) return;
      const next: Record<string, Badge> = {};
      res.forEach((r, i) => {
        next[products[i].id] =
          r.status === 'fulfilled' && Array.isArray(r.value)
            ? (jobBadge(latestJob(r.value)) as Badge)
            : { tone: 'idle', label: 'Status unavailable' };
      });
      setBadges(next);
    });
    return () => {
      alive = false;
    };
  }, [products]);

  const shown = useMemo(
    () => (filter === 'all' ? products : products.filter((p) => badges[p.id]?.tone === filter)),
    [products, badges, filter],
  );

  return (
    <ProtectedRoute>
      <main className="w-full flex-1 px-4 py-8 md:px-10">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="mb-1 text-3xl font-black tracking-tight text-white">Products</h1>
            <p className="text-xs text-ink-muted">
              {total > 0 ? `${total} products, newest first.` : 'Every product you add lands here.'}
            </p>
          </div>
          <Link
            href="/product-input"
            className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-trend-orange px-6 text-sm font-black text-on-accent transition hover:scale-105 hover:shadow-glow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange active:scale-95 motion-reduce:transition-none"
          >
            <Plus className="size-4" aria-hidden />
            New ad
          </Link>
        </div>

        <div
          className="mb-8 flex flex-wrap items-center gap-2"
          role="group"
          aria-label="Filter by video status"
        >
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              aria-pressed={filter === f.key}
              className={`min-h-9 rounded-xl px-4 text-xs font-bold transition focus-visible:outline-2 focus-visible:outline-trend-orange ${
                filter === f.key
                  ? 'bg-white text-black'
                  : 'border border-white/10 bg-white/5 text-ink-muted hover:bg-white/10 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {error ? (
          <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-4 text-center">
            <p className="text-sm text-ink-muted">Your products could not be loaded. {error}</p>
            <button
              type="button"
              onClick={() => refresh()}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white/10 px-6 text-sm font-bold text-white hover:bg-white/20"
            >
              <RefreshCw className="size-4" aria-hidden />
              Try again
            </button>
          </div>
        ) : isLoading && products.length === 0 ? (
          <ul
            aria-busy="true"
            aria-label="Loading products"
            className="grid grid-cols-2 gap-4 pb-16 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
          >
            {Array.from({ length: 10 }, (_, i) => (
              <li key={i} className="aspect-square animate-pulse rounded-2xl bg-white/5" />
            ))}
          </ul>
        ) : shown.length === 0 ? (
          <div className="mx-auto mt-16 flex max-w-md flex-col items-center gap-3 text-center">
            <Package className="size-10 text-studio-meta" strokeWidth={1.5} aria-hidden />
            <p className="text-sm text-ink-muted">
              {products.length === 0
                ? 'No products yet. Paste a product link in the Studio: your first ad starts here.'
                : 'No product on this page matches this filter.'}
            </p>
          </div>
        ) : (
          <ul className="grid grid-cols-2 gap-4 pb-16 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {shown.map((p) => (
              <Card key={p.id} product={p} badge={badges[p.id]} />
            ))}
          </ul>
        )}

        {totalPages > 1 && (
          <nav aria-label="Pages" className="flex items-center justify-center gap-3 pb-10">
            <button
              type="button"
              onClick={goToPreviousPage}
              disabled={!canGoToPreviousPage}
              aria-label="Previous page"
              className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <span className="text-xs font-bold text-ink-muted tabular-nums">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              onClick={goToNextPage}
              disabled={!canGoToNextPage}
              aria-label="Next page"
              className="flex size-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 disabled:opacity-30"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </nav>
        )}
      </main>
    </ProtectedRoute>
  );
}
