'use client';

import { useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowUpDown,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  Sparkles,
} from 'lucide-react';
import {
  focusRing,
  loadEntries,
  menuItem,
  Popover,
  productImage,
  RowMenu,
  Thumb,
  type Entry,
  type Load,
} from '../../components/dashboard/DashShell';
import { discountPct, jobBadge, latestJob } from '../../lib/dashboard-rules.mjs';
import type { AvailabilityStatus, Product } from '../../lib/types/product';

const LIMIT = 100; // the products API maximum page size

type Tone = 'idle' | 'active' | 'ready' | 'simulated' | 'failed';
type Status = { key: Tone | 'none'; label: string };
type ChipKey = 'all' | Status['key'];

const CHIPS: { key: ChipKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'ready', label: 'Ready' },
  { key: 'active', label: 'Generating' },
  { key: 'simulated', label: 'Simulated' },
  { key: 'failed', label: 'Failed' },
  { key: 'none', label: 'No ad yet' },
];
const DOT: Record<Status['key'], string> = {
  ready: 'bg-dash-green/15 text-dash-green',
  active: 'bg-warning/15 text-warning',
  simulated: 'bg-white/10 text-studio-muted',
  failed: 'bg-danger/15 text-danger',
  idle: 'bg-white/5 text-studio-meta',
  none: 'bg-white/5 text-[#d4d4d4]',
};
const AVAILABILITY: { value: AvailabilityStatus; label: string }[] = [
  { value: 'in_stock', label: 'In stock' },
  { value: 'limited', label: 'Limited' },
  { value: 'preorder', label: 'Preorder' },
  { value: 'backorder', label: 'Backorder' },
  { value: 'out_of_stock', label: 'Out of stock' },
  { value: 'discontinued', label: 'Discontinued' },
];
const SORTS = [
  { key: 'new', label: 'Newest first' },
  { key: 'old', label: 'Oldest first' },
  { key: 'price-asc', label: 'Price: low to high' },
  { key: 'price-desc', label: 'Price: high to low' },
  { key: 'rating', label: 'Best rated' },
  { key: 'title', label: 'Name A to Z' },
] as const;
type SortKey = (typeof SORTS)[number]['key'];
const PAGE_SIZES = [10, 20, 50];
const NOT_A_TAG = ['null', 'unknown', 'generic', 'manual', 'custom', 'other'];

function statusOf(e: Entry): Status {
  if (e.jobs === null) return { key: 'idle', label: 'Status unavailable' };
  if (e.jobs.length === 0) return { key: 'none', label: 'No ad yet' };
  const b = jobBadge(latestJob(e.jobs)) as { tone: Tone; label: string };
  return { key: b.tone, label: b.label };
}

function money(n: number | null, currency: string) {
  if (n === null || n === undefined) return '—';
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(n);
  } catch {
    return `${n} ${currency}`;
  }
}

function sorter(key: SortKey) {
  return (a: Entry, b: Entry) => {
    switch (key) {
      case 'old':
        return Date.parse(a.product.created_at) - Date.parse(b.product.created_at);
      case 'price-asc':
        return (a.product.price ?? Infinity) - (b.product.price ?? Infinity);
      case 'price-desc':
        return (b.product.price ?? -Infinity) - (a.product.price ?? -Infinity);
      case 'rating':
        return (b.product.rating ?? -1) - (a.product.rating ?? -1);
      case 'title':
        return a.product.title.localeCompare(b.product.title);
      default:
        return Date.parse(b.product.created_at) - Date.parse(a.product.created_at);
    }
  };
}

/** Store rating out of 5 as a ring, in the place of the mockup's trend score. */
function RatingRing({ rating }: { rating: number | null }) {
  if (rating === null || rating === undefined) return <span className="text-studio-meta">—</span>;
  const r = 15;
  const c = 2 * Math.PI * r;
  const share = Math.max(0, Math.min(1, rating / 5));
  const tone = rating >= 4 ? 'text-dash-green' : rating >= 3 ? 'text-coin' : 'text-danger';
  return (
    <span className={`relative inline-flex size-[36px] items-center justify-center ${tone}`}>
      <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden>
        <circle cx="18" cy="18" r={r} fill="none" stroke="#262626" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${share * c} ${c}`}
        />
      </svg>
      <span className="text-[11px] font-semibold text-white tabular-nums">{rating.toFixed(1)}</span>
      <span className="sr-only">out of 5</span>
    </span>
  );
}

function ToolButton({ Icon, children }: { Icon: typeof Filter; children: ReactNode }) {
  return (
    <span className="inline-flex h-[38px] items-center gap-2 rounded-[8px] border border-[#2a2a2a] bg-[#141414] px-4 text-[13px] text-white">
      <Icon className="size-4 text-studio-muted" aria-hidden />
      {children}
    </span>
  );
}

function Choice({
  on,
  onClick,
  children,
}: {
  on: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`${menuItem} justify-between ${on ? 'text-white' : ''}`}
    >
      {children}
      {on && <Check className="size-4 text-ember-text" aria-hidden />}
    </button>
  );
}

function NextStep({ entries }: { entries: Entry[] }) {
  const waiting = entries.filter((e) => e.jobs !== null && e.jobs.length === 0);
  const first = waiting[0]?.product;
  return (
    <aside
      aria-label="Next step"
      className="flex items-center gap-4 rounded-[12px] border border-ember/30 bg-ember/[0.08] px-4 py-3.5"
    >
      <div className="min-w-0 flex-1">
        <p className="flex items-center gap-2 text-[12px] font-medium text-white">
          <Sparkles className="size-4 text-coin" aria-hidden />
          Next step
        </p>
        <p className="mt-1.5 text-[13px] font-semibold text-white">
          {waiting.length > 0
            ? `${waiting.length} product${waiting.length === 1 ? ' has' : 's have'} no ad yet.`
            : 'Every product has an ad.'}
        </p>
        <p className="mt-0.5 text-[11.5px] text-studio-muted">
          {waiting.length > 0
            ? 'Turn them into video ads in the ad studio.'
            : 'Review and download them in My Projects.'}
        </p>
        <Link
          href={first ? `/products/${first.id}/creative` : '/projects'}
          className={`mt-2.5 inline-flex h-[26px] max-w-full items-center truncate rounded-md bg-ember/20 px-2.5 text-[11.5px] text-ember-text transition hover:bg-ember/30 ${focusRing}`}
        >
          {first ? `Create an ad for ${first.title}` : 'Open My Projects'}
        </Link>
      </div>
      <div className="hidden shrink-0 gap-2 sm:flex">
        {waiting.slice(0, 2).map((e) => (
          <Thumb
            key={e.product.id}
            src={productImage(e.product)}
            className="size-[58px] rounded-[8px]"
            iconSize="size-5"
          />
        ))}
      </div>
    </aside>
  );
}

function pageList(page: number, pages: number) {
  const start = Math.max(1, Math.min(page - 2, pages - 4));
  return Array.from({ length: Math.min(5, pages) }, (_, i) => start + i);
}

// The dashboard search lands here as ?search=.
function searchParam() {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('search')?.trim() ?? '';
}

export default function ProductsPage() {
  const [load, setLoad] = useState<Load>({ state: 'loading' });
  const [q, setQ] = useState(searchParam);
  const [chip, setChip] = useState<ChipKey>('all');
  const [avail, setAvail] = useState<AvailabilityStatus | null>(null);
  const [sort, setSort] = useState<SortKey>('new');
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);

  useEffect(() => {
    let alive = true;
    loadEntries(LIMIT).then((next) => alive && setLoad(next));
    return () => {
      alive = false;
    };
  }, []);

  const entries = useMemo(() => (load.state === 'ready' ? load.entries : []), [load]);
  const statuses = useMemo(
    () => new Map(entries.map((e) => [e.product.id, statusOf(e)])),
    [entries],
  );
  const counts = useMemo(() => {
    const n: Partial<Record<ChipKey, number>> = { all: entries.length };
    statuses.forEach((s) => (n[s.key] = (n[s.key] ?? 0) + 1));
    return n;
  }, [entries, statuses]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return entries
      .filter((e) => chip === 'all' || statuses.get(e.product.id)?.key === chip)
      .filter((e) => !avail || e.product.availability === avail)
      .filter(
        (e) =>
          !term ||
          [e.product.title, e.product.brand, e.product.category]
            .filter(Boolean)
            .some((t) => String(t).toLowerCase().includes(term)),
      )
      .sort(sorter(sort));
  }, [entries, statuses, chip, avail, q, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / size));
  const current = Math.min(page, pages);
  const rows = filtered.slice((current - 1) * size, current * size);
  const from = filtered.length ? (current - 1) * size + 1 : 0;
  // Any change of filter, search, sort or page size starts again from page 1.
  const reset =
    <T,>(set: (v: T) => void) =>
    (v: T) => {
      set(v);
      setPage(1);
    };

  const retry = () => {
    setLoad({ state: 'loading' });
    loadEntries(LIMIT).then(setLoad);
  };

  return (
    <main className="px-5 pb-10 lg:pr-8 lg:pl-9">
      <div className="flex flex-wrap items-start gap-x-6 gap-y-4">
        <div className="mr-auto">
          <h1 className="text-[28px] leading-tight font-bold tracking-[-0.02em]">
            Product Library
          </h1>
          <p className="mt-1.5 text-[14px] text-studio-muted">
            Every product you turn into ads, with the state of its latest ad.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative w-full sm:w-[255px]">
            <Search
              className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-studio-muted"
              aria-hidden
            />
            <label htmlFor="product-search" className="sr-only">
              Search products
            </label>
            <input
              id="product-search"
              type="search"
              value={q}
              onChange={(e) => reset(setQ)(e.target.value)}
              placeholder="Search products..."
              className="h-[38px] w-full rounded-[8px] border border-[#2a2a2a] bg-[#141414] pr-3 pl-10 text-[13px] text-white outline-none placeholder:text-studio-meta focus:border-ember-text/60"
            />
          </div>
          <Popover
            label={avail ? 'Filter (1 active)' : 'Filter'}
            className="top-11 left-0 w-52"
            button={
              <ToolButton Icon={Filter}>
                Filter
                {avail && <span className="size-1.5 rounded-full bg-ember-text" aria-hidden />}
              </ToolButton>
            }
          >
            {(close) => (
              <>
                <p className="px-3 pt-1.5 pb-1 text-[11px] text-studio-meta">Availability</p>
                <Choice
                  on={avail === null}
                  onClick={() => {
                    reset(setAvail)(null);
                    close();
                  }}
                >
                  Any
                </Choice>
                {AVAILABILITY.map((a) => (
                  <Choice
                    key={a.value}
                    on={avail === a.value}
                    onClick={() => {
                      reset(setAvail)(a.value);
                      close();
                    }}
                  >
                    {a.label}
                  </Choice>
                ))}
              </>
            )}
          </Popover>
          <Popover
            label="Sort"
            className="top-11 left-0 w-52"
            button={<ToolButton Icon={ArrowUpDown}>Sort</ToolButton>}
          >
            {(close) =>
              SORTS.map((s) => (
                <Choice
                  key={s.key}
                  on={sort === s.key}
                  onClick={() => {
                    reset(setSort)(s.key);
                    close();
                  }}
                >
                  {s.label}
                </Choice>
              ))
            }
          </Popover>
          <Link
            href="/product-input"
            className={`inline-flex h-[38px] items-center gap-2 rounded-[8px] bg-ember px-4 text-[13px] font-semibold text-white transition hover:bg-ember-strong active:scale-[0.98] ${focusRing}`}
          >
            <Plus className="size-4" aria-hidden />
            Add product
          </Link>
        </div>
      </div>

      <div className="mt-7 grid items-center gap-5 xl:grid-cols-[minmax(0,1fr)_330px]">
        <div role="group" aria-label="Filter by ad status" className="flex flex-wrap gap-2">
          {CHIPS.map((c) => {
            const on = chip === c.key;
            return (
              <button
                key={c.key}
                type="button"
                aria-pressed={on}
                onClick={() => reset(setChip)(c.key)}
                className={`flex items-center gap-1.5 rounded-[8px] ${focusRing}`}
              >
                <span
                  className={`flex h-[32px] items-center rounded-[8px] border px-3 text-[13px] transition ${
                    on
                      ? 'border-ember-text bg-ember/10 text-white'
                      : 'border-[#2a2a2a] text-[#d4d4d4] hover:text-white'
                  }`}
                >
                  {c.label}
                </span>
                <span className="flex h-[32px] min-w-[32px] items-center justify-center rounded-[8px] border border-[#2a2a2a] px-2 text-[12px] text-studio-muted tabular-nums">
                  {load.state === 'ready' ? (counts[c.key] ?? 0) : '…'}
                </span>
              </button>
            );
          })}
        </div>
        {load.state === 'ready' && entries.length > 0 && <NextStep entries={entries} />}
      </div>

      {load.state === 'ready' && load.total > entries.length && (
        <p className="mt-4 text-[12.5px] text-warning">
          Showing your {entries.length} newest products out of {load.total}.
        </p>
      )}

      <section
        aria-label="Products"
        className="mt-5 overflow-hidden rounded-[12px] border border-dash-line bg-dash-panel"
      >
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] text-left text-[13px]">
            <thead className="border-b border-dash-line text-[12px] text-studio-muted">
              <tr>
                <th scope="col" className="py-3 pl-4 font-medium">
                  Product
                </th>
                <th scope="col" className="font-medium">
                  Ad status
                </th>
                <th scope="col" className="text-right font-medium">
                  Price
                </th>
                <th scope="col" className="text-right font-medium">
                  Compare at
                </th>
                <th scope="col" className="text-right font-medium">
                  Discount
                </th>
                <th scope="col" className="text-center font-medium">
                  Rating
                </th>
                <th scope="col" className="text-right font-medium">
                  Reviews
                </th>
                <th scope="col" className="text-right font-medium">
                  Ads
                </th>
                <th scope="col" className="pr-4 text-right font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-dash-line">
              {load.state === 'loading' ? (
                Array.from({ length: 6 }, (_, i) => (
                  <tr key={i} aria-hidden>
                    <td colSpan={9} className="px-4 py-2.5">
                      <div className="h-[36px] animate-pulse rounded-md bg-white/[0.03]" />
                    </td>
                  </tr>
                ))
              ) : load.state === 'error' ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-studio-muted">
                    Your products could not be loaded.{' '}
                    <button
                      type="button"
                      onClick={retry}
                      className="text-ember-text hover:underline"
                    >
                      Retry
                    </button>
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-studio-muted">
                    {entries.length === 0 ? (
                      <Link href="/product-input" className="text-ember-text hover:underline">
                        No product yet. Add your first product.
                      </Link>
                    ) : (
                      'No product matches these filters.'
                    )}
                  </td>
                </tr>
              ) : (
                rows.map((e) => {
                  const p: Product = e.product;
                  const s = statuses.get(p.id) ?? statusOf(e);
                  const off = discountPct(p.price, p.compare_at_price);
                  const tag = [p.category, p.brand].find(
                    (t) => t && !NOT_A_TAG.includes(String(t)),
                  );
                  return (
                    <tr key={p.id} className="transition hover:bg-white/[0.02]">
                      <td className="py-2.5 pl-4">
                        <Link
                          href={`/products/${p.id}`}
                          className={`flex items-center gap-3 rounded-md ${focusRing}`}
                        >
                          <Thumb
                            src={productImage(p)}
                            className="size-[38px] rounded-[7px]"
                            iconSize="size-4"
                          />
                          <span className="min-w-0">
                            <span className="block max-w-[240px] truncate font-medium text-white hover:underline">
                              {p.title}
                            </span>
                            <span className="block text-[11.5px] text-studio-muted capitalize">
                              {tag || 'No category'}
                            </span>
                          </span>
                        </Link>
                      </td>
                      <td>
                        <span
                          className={`inline-flex h-[22px] items-center gap-1.5 rounded-[6px] px-2 text-[11.5px] whitespace-nowrap ${DOT[s.key]}`}
                        >
                          <span className="size-1.5 rounded-full bg-current" aria-hidden />
                          {s.label}
                        </span>
                      </td>
                      <td className="text-right text-white tabular-nums">
                        {money(p.price, p.currency)}
                      </td>
                      <td className="text-right text-studio-muted tabular-nums">
                        {money(p.compare_at_price, p.currency)}
                      </td>
                      <td
                        className={`text-right tabular-nums ${off === null ? 'text-studio-meta' : 'text-dash-green'}`}
                      >
                        {off === null ? '—' : `${off}%`}
                      </td>
                      <td className="text-center">
                        <RatingRing rating={p.rating} />
                      </td>
                      <td className="text-right text-white tabular-nums">
                        {p.reviews_count === null || p.reviews_count === undefined
                          ? '—'
                          : p.reviews_count.toLocaleString('en-US')}
                      </td>
                      <td className="text-right text-white tabular-nums">
                        {e.jobs === null ? '—' : e.jobs.length}
                      </td>
                      <td className="pr-4">
                        <span className="ml-auto flex size-[32px] items-center justify-center rounded-[7px] border border-[#2a2a2a] text-studio-muted">
                          <RowMenu product={p} />
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-dash-line px-4 py-3 text-[12.5px] text-studio-muted">
          <span className="mr-auto tabular-nums">
            {load.state === 'ready'
              ? `Showing ${from} to ${from ? from + rows.length - 1 : 0} of ${filtered.length} products`
              : '…'}
          </span>
          <nav aria-label="Pages" className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage(current - 1)}
              disabled={current <= 1}
              aria-label="Previous page"
              className={`flex size-[32px] items-center justify-center rounded-[7px] hover:text-white disabled:opacity-30 ${focusRing}`}
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            {pageList(current, pages).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                aria-current={n === current ? 'page' : undefined}
                className={`flex size-[32px] items-center justify-center rounded-[7px] tabular-nums transition ${
                  n === current
                    ? 'border border-ember-text bg-ember/10 text-white'
                    : 'hover:text-white'
                } ${focusRing}`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage(current + 1)}
              disabled={current >= pages}
              aria-label="Next page"
              className={`flex size-[32px] items-center justify-center rounded-[7px] hover:text-white disabled:opacity-30 ${focusRing}`}
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </nav>
          <div className="relative">
            <select
              aria-label="Products per page"
              value={size}
              onChange={(e) => reset(setSize)(Number(e.target.value))}
              className="h-[32px] appearance-none rounded-[7px] border border-[#2a2a2a] bg-[#141414] pr-8 pl-3 text-[12.5px] text-white outline-none focus:border-ember-text/60"
            >
              {PAGE_SIZES.map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>
            <ChevronDown
              className="pointer-events-none absolute top-1/2 right-2.5 size-3.5 -translate-y-1/2"
              aria-hidden
            />
          </div>
        </div>
      </section>
    </main>
  );
}
