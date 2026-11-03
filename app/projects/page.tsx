'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { ChevronDown, Film, LayoutGrid, List, Plus, Search, Star } from 'lucide-react';
import {
  DashShell,
  focusRing,
  loadEntries,
  productImage,
  RowMenu,
  Thumb,
  type Load,
} from '../../components/dashboard/DashShell';
import { clockText, jobBadge, jobSeconds } from '../../lib/dashboard-rules.mjs';
import type { Product } from '../../lib/types/product';
import type { VideoGenerationJob } from '../../lib/types/creative';

const LIMIT = 100; // the products API maximum page size

type Tone = 'idle' | 'active' | 'ready' | 'simulated' | 'failed';
type Creative = {
  product: Product;
  job: VideoGenerationJob;
  badge: { tone: Tone; label: string };
};

const TABS: { key: 'all' | Tone; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'ready', label: 'Ready' },
  { key: 'active', label: 'Generating' },
  { key: 'simulated', label: 'Simulated' },
  { key: 'failed', label: 'Failed' },
];
const FORMATS = ['9:16', '1:1', '16:9', '4:5'];

const PILL: Record<Tone, string> = {
  ready: 'bg-dash-green/15 text-dash-green',
  active: 'bg-warning/15 text-warning',
  simulated: 'bg-white/10 text-studio-muted',
  failed: 'bg-danger/15 text-danger',
  idle: 'bg-white/5 text-studio-meta',
};
const TIER: Record<string, string> = {
  draft: 'Draft tier',
  standard: 'Standard',
  premium: 'Premium',
};

const dateText = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

function costText(job: VideoGenerationJob) {
  const raw = job.actual_cost ?? job.estimated_cost;
  const n = raw === null || raw === undefined ? NaN : Number(raw);
  if (!Number.isFinite(n)) return '—';
  return `${job.cost_is_heuristic ? '~' : ''}$${n.toFixed(2)}`;
}

function qaText(job: VideoGenerationJob) {
  if (!job.finishing_report) return '—';
  return job.finishing_report.passed ? 'Passed' : 'Failed';
}

const formatsOf = (job: VideoGenerationJob): string[] =>
  (job.exports ?? []).map((e) => e.aspect_ratio);

function Pill({ tone, children }: { tone: Tone; children: ReactNode }) {
  return (
    <span
      className={`inline-flex h-[19px] shrink-0 items-center rounded-[5px] px-1.5 text-[10.5px] font-medium ${PILL[tone]}`}
    >
      {children}
    </span>
  );
}

function Figures({ job }: { job: VideoGenerationJob }) {
  const qa = qaText(job);
  const items = [
    { label: 'Shots', value: job.shots?.length ? String(job.shots.length) : '—' },
    { label: 'Cost', value: costText(job) },
    { label: 'Final QA', value: qa },
  ];
  return (
    <dl className="grid grid-cols-3">
      {items.map((it, i) => (
        <div key={it.label} className={i === 1 ? 'text-center' : i === 2 ? 'text-right' : ''}>
          <dt className="text-[10.5px] text-studio-muted">{it.label}</dt>
          <dd
            className={`mt-0.5 text-[13px] font-medium tabular-nums ${
              it.value === '—'
                ? 'text-studio-meta'
                : it.label === 'Final QA' && qa === 'Failed'
                  ? 'text-danger'
                  : 'text-ember-text'
            }`}
          >
            {it.value}
          </dd>
        </div>
      ))}
    </dl>
  );
}

function Card({ c }: { c: Creative }) {
  const href = `/products/${c.product.id}/creative`;
  const clock = clockText(jobSeconds(c.job));
  const format = formatsOf(c.job)[0];
  const tier = c.job.quality_tier ? TIER[c.job.quality_tier] : null;
  return (
    <li className="overflow-hidden rounded-[10px] border border-dash-line bg-dash-panel transition hover:border-[#333]">
      <Link href={href} className={`group relative block ${focusRing}`}>
        <Thumb
          src={c.job.thumbnail_url || c.job.exports?.[0]?.thumbnail_url || productImage(c.product)}
          className="aspect-[241/132] w-full transition duration-500 group-hover:brightness-110"
          iconSize="size-8"
        />
        {tier && (
          <span className="absolute top-2 left-2 inline-flex h-[22px] items-center gap-1 rounded-md bg-black/70 px-2 text-[10.5px] text-white">
            <Star className="size-3 text-coin" fill="currentColor" aria-hidden />
            {tier}
          </span>
        )}
        {format && (
          <span className="absolute top-2 right-2 inline-flex h-[22px] items-center gap-1 rounded-md bg-black/70 px-1.5 text-[10.5px] text-white tabular-nums">
            <Film className="size-3" aria-hidden />
            {format}
          </span>
        )}
        {clock && (
          <span className="absolute right-2 bottom-2 rounded-[5px] bg-black/75 px-1.5 py-0.5 text-[10.5px] text-white tabular-nums">
            {clock}
          </span>
        )}
      </Link>
      <div className="px-2.5 pt-2.5 pb-2">
        <Link href={href} className="block truncate text-[12.5px] font-semibold hover:underline">
          {c.product.title}
        </Link>
        <p className="mt-1 flex items-center justify-between gap-2">
          <span className="text-[11px] text-studio-muted">Video ad</span>
          <Pill tone={c.badge.tone}>{c.badge.label}</Pill>
        </p>
      </div>
      <div className="border-t border-dash-line px-2.5 py-2">
        <Figures job={c.job} />
      </div>
      <div className="flex items-center justify-between border-t border-dash-line px-2.5 py-1.5 text-studio-muted">
        <span className="text-[10.5px]">Created {dateText(c.job.created_at)}</span>
        <RowMenu product={c.product} up />
      </div>
    </li>
  );
}

function Row({ c }: { c: Creative }) {
  const href = `/products/${c.product.id}/creative`;
  const format = formatsOf(c.job)[0];
  return (
    <li className="grid grid-cols-[96px_minmax(0,1fr)_auto] items-center gap-4 rounded-[10px] border border-dash-line bg-dash-panel p-2 md:grid-cols-[96px_minmax(0,1fr)_260px_110px_auto]">
      <Link href={href} className={`rounded-md ${focusRing}`}>
        <Thumb
          src={c.job.thumbnail_url || productImage(c.product)}
          className="h-[54px] w-[96px] rounded-md"
          iconSize="size-4"
        />
      </Link>
      <div className="min-w-0">
        <Link href={href} className="block truncate text-[13px] font-semibold hover:underline">
          {c.product.title}
        </Link>
        <p className="mt-1 flex items-center gap-2 text-[11px] text-studio-muted">
          Video ad{format ? ` · ${format}` : ''}
          <Pill tone={c.badge.tone}>{c.badge.label}</Pill>
        </p>
      </div>
      <div className="hidden md:block">
        <Figures job={c.job} />
      </div>
      <span className="hidden text-[11px] text-studio-muted md:block">
        {dateText(c.job.created_at)}
      </span>
      <span className="text-studio-muted">
        <RowMenu product={c.product} />
      </span>
    </li>
  );
}

const control =
  'h-[38px] rounded-[8px] border border-[#2a2a2a] bg-[#141414] text-[13px] text-white outline-none focus:border-ember-text/60';

function Select({
  label,
  value,
  onChange,
  options,
  disabled,
  className = 'w-[160px]',
}: {
  label: string;
  value: string;
  onChange?: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`} title={disabled ? 'Coming soon' : undefined}>
      <select
        aria-label={disabled ? `${label} (coming soon)` : label}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className={`${control} w-full appearance-none pr-9 pl-3 disabled:cursor-not-allowed disabled:text-studio-meta`}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-studio-muted"
        aria-hidden
      />
    </div>
  );
}

export default function ProjectsPage() {
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [q, setQ] = useState('');
  const [format, setFormat] = useState('all');
  const [tab, setTab] = useState<(typeof TABS)[number]['key']>('all');
  const [order, setOrder] = useState<'desc' | 'asc'>('desc');
  const [view, setView] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    let alive = true;
    loadEntries(LIMIT).then((next) => alive && setLoad(next));
    return () => {
      alive = false;
    };
  }, []);

  const all = useMemo<Creative[]>(
    () =>
      load.state === 'ready'
        ? load.entries.flatMap(({ product, jobs }) =>
            (jobs ?? []).map((job) => ({
              product,
              job,
              badge: jobBadge(job) as Creative['badge'],
            })),
          )
        : [],
    [load],
  );
  const failedLoads =
    load.state === 'ready' ? load.entries.filter((e) => e.jobs === null).length : 0;

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return all
      .filter((c) => tab === 'all' || c.badge.tone === tab)
      .filter((c) => format === 'all' || formatsOf(c.job).includes(format))
      .filter((c) => !term || c.product.title.toLowerCase().includes(term))
      .sort((a, b) => {
        const d = Date.parse(b.job.created_at) - Date.parse(a.job.created_at);
        return order === 'desc' ? d : -d;
      });
  }, [all, q, tab, format, order]);

  const retry = () => {
    setLoad({ state: 'loading' });
    loadEntries(LIMIT).then(setLoad);
  };

  return (
    <DashShell>
      <main className="px-5 pb-10 lg:pr-8 lg:pl-9">
        <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em]">My Projects</h1>
        <p className="mt-1.5 text-[14px] text-studio-muted">
          Manage and review every ad generated with TrendED.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-[240px]">
            <label htmlFor="creative-search" className="sr-only">
              Search ads
            </label>
            <input
              id="creative-search"
              type="search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search ads..."
              className={`${control} w-full pr-10 pl-3 placeholder:text-studio-meta`}
            />
            <Search
              className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-studio-muted"
              aria-hidden
            />
          </div>
          <Select
            label="Platform"
            value="all"
            disabled
            options={[{ value: 'all', label: 'All platforms' }]}
          />
          <Select
            label="Format"
            value={format}
            onChange={setFormat}
            options={[
              { value: 'all', label: 'All formats' },
              ...FORMATS.map((f) => ({ value: f, label: f })),
            ]}
          />
          <Select
            label="Performance"
            value="all"
            disabled
            options={[{ value: 'all', label: 'All performance' }]}
          />
          <Link
            href="/product-input"
            className={`inline-flex h-[38px] items-center gap-2 rounded-[8px] bg-ember px-4 text-[13px] font-semibold text-white transition hover:bg-ember-strong active:scale-[0.98] sm:ml-auto ${focusRing}`}
          >
            <Plus className="size-4" aria-hidden />
            Create ad
          </Link>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 border-b border-dash-line">
          <div role="tablist" aria-label="Filter by status" className="flex gap-6 overflow-x-auto">
            {TABS.map((t) => (
              <button
                key={t.key}
                type="button"
                role="tab"
                aria-selected={tab === t.key}
                onClick={() => setTab(t.key)}
                className={`-mb-px border-b-2 pb-2.5 text-[13px] whitespace-nowrap transition ${
                  tab === t.key
                    ? 'border-ember-text text-white'
                    : 'border-transparent text-studio-muted hover:text-white'
                } ${focusRing}`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="mb-2 ml-auto flex items-center gap-3">
            <span className="text-[12.5px] text-studio-muted tabular-nums">
              {load.state === 'ready' ? `${shown.length} ad${shown.length === 1 ? '' : 's'}` : '…'}
            </span>
            <Select
              label="Sort"
              value={order}
              onChange={(v) => setOrder(v as 'desc' | 'asc')}
              className="w-[140px]"
              options={[
                { value: 'desc', label: 'Newest first' },
                { value: 'asc', label: 'Oldest first' },
              ]}
            />
            <div className="flex overflow-hidden rounded-[8px] border border-[#2a2a2a]">
              {(['grid', 'list'] as const).map((v) => {
                const Icon = v === 'grid' ? LayoutGrid : List;
                return (
                  <button
                    key={v}
                    type="button"
                    aria-label={v === 'grid' ? 'Grid view' : 'List view'}
                    aria-pressed={view === v}
                    onClick={() => setView(v)}
                    className={`flex size-[36px] items-center justify-center transition ${
                      view === v
                        ? 'bg-ember/20 text-ember-text'
                        : 'text-studio-muted hover:text-white'
                    } ${focusRing}`}
                  >
                    <Icon className="size-4" aria-hidden />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {failedLoads > 0 && (
          <p className="mt-4 text-[12.5px] text-warning">
            The ads of {failedLoads} product{failedLoads === 1 ? '' : 's'} could not be loaded.{' '}
            <button type="button" onClick={retry} className="underline">
              Retry
            </button>
          </p>
        )}

        <div className="mt-5">
          {load.state === 'loading' ? (
            <ul
              aria-busy="true"
              aria-label="Loading ads"
              className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            >
              {Array.from({ length: 8 }, (_, i) => (
                <li key={i} className="h-[262px] animate-pulse rounded-[10px] bg-white/[0.03]" />
              ))}
            </ul>
          ) : load.state === 'error' ? (
            <p className="text-[13px] text-studio-muted">
              Your ads could not be loaded.{' '}
              <button type="button" onClick={retry} className="text-ember-text hover:underline">
                Retry
              </button>
            </p>
          ) : all.length === 0 ? (
            <Link
              href="/product-input"
              className="flex h-[220px] flex-col items-center justify-center gap-2 rounded-[10px] border border-dashed border-[#333] text-[13px] text-studio-muted transition hover:text-white"
            >
              <Film className="size-7" strokeWidth={1.25} aria-hidden />
              No ad yet. Paste a product link: your first ad lands here.
            </Link>
          ) : shown.length === 0 ? (
            <p className="py-16 text-center text-[13px] text-studio-muted">
              No ad matches these filters.
            </p>
          ) : view === 'grid' ? (
            <ul className="grid grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {shown.map((c) => (
                <Card key={c.job.id} c={c} />
              ))}
            </ul>
          ) : (
            <ul className="flex flex-col gap-2">
              {shown.map((c) => (
                <Row key={c.job.id} c={c} />
              ))}
            </ul>
          )}
        </div>
      </main>
    </DashShell>
  );
}
