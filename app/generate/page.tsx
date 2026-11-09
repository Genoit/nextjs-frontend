'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertCircle, Clapperboard, LayoutGrid, List, Plus, Search } from 'lucide-react';
import {
  DashShell,
  focusRing,
  loadEntries,
  productImage,
  Thumb,
  type Load,
} from '../../components/dashboard/DashShell';
import { Composer } from '../../components/dashboard/Composer';
import { useApiMediaUrl } from '../../hooks/use-assets';
import { jobBadge, timeAgo } from '../../lib/dashboard-rules.mjs';
import { anyActive, creationHref, creations } from '../../lib/generate-rules.mjs';
import type { VideoGenerationJob } from '../../lib/types/creative';
import type { Product } from '../../lib/types/product';

type Creation = { product: Product; job: VideoGenerationJob };
const REFRESH_MS = 5000;

/** The finished video's thumbnail (API path, fetched with the token), else the product photo. */
function JobThumb({ c, className }: { c: Creation; className: string }) {
  const thumb = useApiMediaUrl(c.job.thumbnail_url);
  return (
    <Thumb
      src={thumb.url ?? (thumb.failed || !c.job.thumbnail_url ? productImage(c.product) : null)}
      className={className}
    />
  );
}

const TONE: Record<string, string> = {
  ready: 'bg-dash-green/15 text-dash-green',
  active: 'bg-trend-orange/15 text-trend-orange',
  failed: 'bg-danger/15 text-danger',
  simulated: 'bg-white/10 text-dash-soft',
  idle: 'bg-white/10 text-dash-soft',
};

function Card({ c, now }: { c: Creation; now: Date }) {
  const badge = jobBadge(c.job);
  const active = badge.tone === 'active';
  return (
    <Link
      href={creationHref(c)}
      className={`group block overflow-hidden rounded-[16px] border border-white/[0.07] bg-dash-panel transition hover:border-white/20 ${focusRing}`}
    >
      <div className="relative aspect-[4/5]">
        {active ? (
          <div className="absolute inset-0 overflow-hidden bg-dash-raised">
            {/* Slow colour drift while the ad renders, like a developing photo. */}
            <div className="absolute -inset-1/4 animate-[spin_14s_linear_infinite] bg-[conic-gradient(from_90deg,#3b2a6e,#1e4b5c,#4a3b1e,#a6441d,#3b2a6e)] opacity-70 blur-3xl motion-reduce:animate-none" />
            <div className="absolute inset-x-0 bottom-0 p-4">
              <p className="text-[14px] font-medium text-white">{badge.label}</p>
              {c.job.current_step && (
                <p className="mt-0.5 line-clamp-2 text-[12.5px] text-white/75">
                  {c.job.current_step}
                </p>
              )}
            </div>
          </div>
        ) : (
          <JobThumb
            c={c}
            className="absolute inset-0 transition duration-300 group-hover:scale-[1.02]"
          />
        )}
        {!active && (
          <span
            className={`absolute top-3 left-3 rounded-full px-2.5 py-1 text-[12px] font-medium backdrop-blur ${TONE[badge.tone]}`}
          >
            {badge.label}
          </span>
        )}
      </div>
      <div className="px-3.5 py-3">
        <p className="truncate text-[14.5px] font-medium text-white">{c.product.title}</p>
        <p className="mt-0.5 truncate text-[12.5px] text-dash-soft">
          {timeAgo(c.job.created_at, now)}
          {c.job.status === 'failed' && c.job.error_message ? ` · ${c.job.error_message}` : ''}
        </p>
      </div>
    </Link>
  );
}

function Row({ c, now }: { c: Creation; now: Date }) {
  const badge = jobBadge(c.job);
  return (
    <Link
      href={creationHref(c)}
      className={`flex items-center gap-4 rounded-[14px] px-3 py-2.5 transition hover:bg-white/[0.05] ${focusRing}`}
    >
      <JobThumb c={c} className="h-14 w-11 rounded-[8px]" />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] text-white">{c.product.title}</span>
        <span className="block text-[12.5px] text-dash-soft">{timeAgo(c.job.created_at, now)}</span>
      </span>
      <span className={`rounded-full px-2.5 py-1 text-[12px] font-medium ${TONE[badge.tone]}`}>
        {badge.label}
      </span>
    </Link>
  );
}

export default function GeneratePage() {
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [productId, setProductId] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    let alive = true;
    loadEntries(100).then((next) => alive && setLoad(next));
    return () => {
      alive = false;
    };
  }, []);

  const entries = load.state === 'ready' ? load.entries : [];
  const all = creations(entries);
  const shown = creations(entries, { productId, query });
  const rendering = anyActive(all);

  // Refresh while an ad renders, so progress and finished thumbnails appear without a reload.
  useEffect(() => {
    if (!rendering) return;
    const timer = window.setInterval(() => {
      loadEntries(100).then((next) => next.state === 'ready' && setLoad(next));
    }, REFRESH_MS);
    return () => window.clearInterval(timer);
  }, [rendering]);

  const now = new Date();
  const groups = entries.filter((e) => (e.jobs ?? []).length > 0);
  const group = (active: boolean) =>
    `flex w-full items-center gap-3 rounded-[12px] px-2.5 py-2 text-left text-[14.5px] transition ${
      active ? 'bg-white/[0.08] text-white' : 'text-dash-nav hover:bg-white/[0.05] hover:text-white'
    } ${focusRing}`;

  return (
    <DashShell>
      {({ summary }) => (
        <div className="flex flex-1 gap-6 px-5 md:pr-8 md:pl-[46px]">
          <aside aria-label="Creations" className="hidden w-[240px] shrink-0 lg:block">
            <div className="sticky top-4 space-y-1.5">
              <h2 className="px-2.5 pb-2 text-[17px] font-semibold text-white">Creations</h2>
              <Link href="/product-input" className={group(false)}>
                <span className="flex size-9 items-center justify-center rounded-[10px] bg-white/[0.07]">
                  <Plus className="size-5" aria-hidden />
                </span>
                New product
              </Link>
              <button
                type="button"
                onClick={() => setProductId(null)}
                aria-pressed={productId === null}
                className={group(productId === null)}
              >
                <span className="flex size-9 items-center justify-center rounded-[10px] bg-white/[0.07]">
                  <Clapperboard className="size-[18px]" aria-hidden />
                </span>
                <span className="flex-1">All videos</span>
                <span className="text-[12.5px] text-dash-soft tabular-nums">{all.length}</span>
              </button>
              <ul className="max-h-[calc(100dvh-280px)] space-y-1 overflow-y-auto">
                {groups.map(({ product, jobs }) => (
                  <li key={product.id}>
                    <button
                      type="button"
                      onClick={() => setProductId(product.id)}
                      aria-pressed={productId === product.id}
                      className={group(productId === product.id)}
                    >
                      <Thumb
                        src={productImage(product)}
                        className="size-9 rounded-[10px] bg-white"
                        iconSize="size-4"
                      />
                      <span className="min-w-0 flex-1 truncate">{product.title}</span>
                      <span className="text-[12.5px] text-dash-soft tabular-nums">
                        {jobs?.length}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          <main className="flex min-w-0 flex-1 flex-col pb-6">
            <div className="flex flex-wrap items-center justify-end gap-3">
              <h1 className="mr-auto text-[26px] font-bold tracking-[-0.02em] text-white">
                Generate
              </h1>
              <label className="relative order-last w-full sm:order-none sm:w-auto">
                <span className="sr-only">Search by product</span>
                <Search
                  className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-dash-soft"
                  aria-hidden
                />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by product"
                  className="h-10 w-full rounded-[12px] sm:w-[220px] border border-dash-edge bg-dash-field pr-3 pl-9 text-[14px] text-white placeholder:text-dash-soft/70 focus:border-ember-text/60 focus:outline-none"
                />
              </label>
              <div
                role="group"
                aria-label="View"
                className="flex rounded-[12px] border border-dash-edge bg-dash-field p-1"
              >
                {(
                  [
                    ['grid', 'Grid', LayoutGrid],
                    ['list', 'List', List],
                  ] as const
                ).map(([id, label, Icon]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={view === id}
                    onClick={() => setView(id)}
                    className={`flex h-8 items-center gap-1.5 rounded-[9px] px-3 text-[13.5px] transition ${
                      view === id ? 'bg-white/[0.1] text-white' : 'text-dash-soft hover:text-white'
                    } ${focusRing}`}
                  >
                    <Icon className="size-4" aria-hidden />
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Products as chips on small screens, where the groups column is hidden. */}
            {groups.length > 0 && (
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1 lg:hidden">
                {[{ id: null, title: 'All videos' }, ...groups.map((g) => g.product)].map((p) => (
                  <button
                    key={p.id ?? 'all'}
                    type="button"
                    aria-pressed={productId === p.id}
                    onClick={() => setProductId(p.id)}
                    className={`h-9 shrink-0 rounded-full border px-4 text-[13.5px] ${
                      productId === p.id
                        ? 'border-ember-text/60 bg-ember-deep/20 text-white'
                        : 'border-dash-edge text-dash-soft'
                    } ${focusRing}`}
                  >
                    <span className="block max-w-[180px] truncate">{p.title}</span>
                  </button>
                ))}
              </div>
            )}

            <section
              aria-label="Videos"
              aria-busy={load.state === 'loading'}
              className="mt-6 flex-1"
            >
              {load.state === 'loading' && (
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {Array.from({ length: 4 }, (_, i) => (
                    <div
                      key={i}
                      className="aspect-[4/5] animate-pulse rounded-[16px] bg-dash-panel"
                    />
                  ))}
                </div>
              )}
              {load.state === 'error' && (
                <p role="alert" className="flex items-center gap-2 text-[14.5px] text-danger">
                  <AlertCircle className="size-4" aria-hidden />
                  Your videos could not be loaded.
                </p>
              )}
              {load.state === 'ready' && shown.length === 0 && (
                <div className="flex flex-col items-center py-[8vh] text-center">
                  <span className="flex size-16 items-center justify-center rounded-[18px] bg-white/[0.06] text-dash-soft">
                    <Clapperboard className="size-7" strokeWidth={1.4} aria-hidden />
                  </span>
                  <h2 className="mt-6 text-[24px] font-bold text-white">
                    {all.length ? 'No video matches' : 'Your first ad starts below'}
                  </h2>
                  <p className="mt-2 max-w-[44ch] text-[15px] text-dash-soft">
                    {all.length
                      ? 'Try another product or clear the search.'
                      : 'Paste a product link or add photos, then Generate. You check the product sheet before anything is rendered.'}
                  </p>
                </div>
              )}
              {shown.length > 0 &&
                (view === 'grid' ? (
                  <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                    {shown.map((c) => (
                      <li key={c.job.id}>
                        <Card c={c} now={now} />
                      </li>
                    ))}
                  </ul>
                ) : (
                  <ul className="divide-y divide-white/[0.06]">
                    {shown.map((c) => (
                      <li key={c.job.id}>
                        <Row c={c} now={now} />
                      </li>
                    ))}
                  </ul>
                ))}
            </section>

            <div className="z-20 mt-8 md:sticky md:bottom-4">
              <Composer credits={summary?.credits ?? null} className="mx-auto max-w-[980px]" />
            </div>
          </main>
        </div>
      )}
    </DashShell>
  );
}
