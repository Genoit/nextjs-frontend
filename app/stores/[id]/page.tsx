'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, ExternalLink } from 'lucide-react';
import type { AdOut } from '../../../lib/api/ads';
import {
  storesApi,
  type ChangePage,
  type ProductPage,
  type ProductSort,
  type StoreDetail,
} from '../../../lib/api/stores';
import {
  CHANGE_FILTERS,
  countLabel,
  isSettling,
  readAgo,
  storeState,
} from '../../../lib/stores-rules.mjs';
import { ColumnChart } from '../../../components/admin/charts';
import { AdGrid } from '../../../components/ads/AdCard';
import { Select } from '../../../components/ads/AdFilters';
import { EmptyState, LoadMore, Monogram } from '../../../components/ads/AdvertiserRow';
import { RemakeDialog } from '../../../components/ads/RemakeDialog';
import { focusRing } from '../../../components/dashboard/DashShell';
import {
  ChangeRow,
  ProductRow,
  StateBadge,
  StoresError,
  listBox,
} from '../../../components/stores/StoreUi';

type Tab = 'changes' | 'products' | 'ads';
const POLL_MS = 4000;
const POLL_MAX = 45;

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[12.5px] text-studio-muted">{label}</dt>
      <dd className="mt-1 truncate text-[17px] font-semibold text-white tabular-nums">{value}</dd>
    </div>
  );
}

function Chips({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="min-w-0">
      <h3 className="text-[12.5px] text-studio-muted">{label}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-[13px] text-studio-meta">None found on the home page</p>
      ) : (
        <ul className="mt-2 flex flex-wrap gap-1.5">
          {items.map((item) => (
            <li
              key={item}
              className="rounded-[6px] bg-dash-raised px-2 py-1 text-[12.5px] text-dash-soft"
            >
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const skeleton = (
  <div className="h-[220px] animate-pulse rounded-[14px] bg-dash-panel" aria-busy="true" />
);

function Changes({ store }: { store: StoreDetail }) {
  const [kind, setKind] = useState('');
  const [page, setPage] = useState<ChangePage | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    storesApi.changes(store.id, kind).then(
      (p) => {
        if (!alive) return;
        setPage(p);
        setError(null);
      },
      (e) => alive && setError(e),
    );
    return () => {
      alive = false;
    };
  }, [store.id, kind, store.last_fetched_at]);

  const more = async () => {
    if (page?.next_offset == null) return;
    setBusy(true);
    try {
      const next = await storesApi.changes(store.id, kind, page.next_offset);
      setPage({ ...next, items: [...page.items, ...next.items] });
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="mb-3 w-[200px]">
        <Select label="Kind of change" value={kind} onChange={setKind}>
          {CHANGE_FILTERS.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </Select>
      </div>
      {error != null && <StoresError error={error} className="mb-3" />}
      {!page ? (
        !error && skeleton
      ) : page.items.length === 0 ? (
        <EmptyState title={kind ? 'No change of this kind yet' : 'No change recorded yet'}>
          <p>
            The first reading is the starting point. Changes appear here from the next daily reading
            on, each with its date.
          </p>
        </EmptyState>
      ) : (
        <>
          <ul className={listBox}>
            {page.items.map((c) => (
              <ChangeRow key={c.id} change={c} currency={store.currency} />
            ))}
          </ul>
          {page.next_offset != null && <LoadMore busy={busy} onClick={more} />}
        </>
      )}
    </>
  );
}

function Products({ store }: { store: StoreDetail }) {
  const [sort, setSort] = useState<ProductSort>('recent');
  const [page, setPage] = useState<ProductPage | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let alive = true;
    storesApi.products(store.id, sort).then(
      (p) => {
        if (!alive) return;
        setPage(p);
        setError(null);
      },
      (e) => alive && setError(e),
    );
    return () => {
      alive = false;
    };
  }, [store.id, sort, store.last_fetched_at]);

  const more = async () => {
    if (page?.next_offset == null) return;
    setBusy(true);
    try {
      const next = await storesApi.products(store.id, sort, page.next_offset);
      setPage({ ...next, items: [...page.items, ...next.items] });
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <div className="mb-3 w-[200px]">
        <Select label="Sort products" value={sort} onChange={(v) => setSort(v as ProductSort)}>
          <option value="recent">Newest first</option>
          <option value="price_desc">Highest price</option>
          <option value="price_asc">Lowest price</option>
        </Select>
      </div>
      {error != null && <StoresError error={error} className="mb-3" />}
      {!page ? (
        !error && skeleton
      ) : page.items.length === 0 ? (
        <EmptyState title="No product read yet">
          <p>Products appear after the first reading of the store.</p>
        </EmptyState>
      ) : (
        <>
          <p className="mb-3 max-w-[70ch] text-[12.5px] text-studio-muted">
            We read a few product pages a day per store, the most recently updated first. A large
            catalogue fills in over a few days.
          </p>
          <ul className={listBox}>
            {page.items.map((p) => (
              <ProductRow key={p.id} product={p} />
            ))}
          </ul>
          {page.next_offset != null && <LoadMore busy={busy} onClick={more} />}
        </>
      )}
    </>
  );
}

function Ads({ store }: { store: StoreDetail }) {
  const [ads, setAds] = useState<AdOut[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [remake, setRemake] = useState<AdOut | null>(null);

  useEffect(() => {
    let alive = true;
    storesApi.ads(store.id).then(
      (r) => alive && setAds(r.items),
      (e) => alive && setError(e),
    );
    return () => {
      alive = false;
    };
  }, [store.id]);

  if (error) return <StoresError error={error} />;
  if (!ads) return skeleton;
  if (ads.length === 0) {
    return (
      <EmptyState title="No ad in our index points to this store">
        <p>
          We link an ad to a store when the ad&apos;s link shows {store.domain}. The index covers
          ads delivered in the EU.{' '}
          <Link href="/ads" className={`rounded text-white underline ${focusRing}`}>
            Search the ad library
          </Link>{' '}
          for this brand to bring its ads in.
        </p>
      </EmptyState>
    );
  }
  return (
    <>
      <AdGrid ads={ads} onRemake={setRemake} />
      <RemakeDialog ad={remake} onClose={() => setRemake(null)} />
    </>
  );
}

export default function StorePage() {
  const { id } = useParams<{ id: string }>();
  const [store, setStore] = useState<StoreDetail | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [tab, setTab] = useState<Tab>('changes');
  const [polls, setPolls] = useState(0);

  useEffect(() => {
    let alive = true;
    storesApi.get(id).then(
      (s) => alive && setStore(s),
      (e) => alive && setError(e),
    );
    return () => {
      alive = false;
    };
  }, [id, polls]);

  const settling = store ? isSettling(store) : false;
  useEffect(() => {
    if (!settling || polls >= POLL_MAX) return;
    const timer = setTimeout(() => setPolls((n) => n + 1), POLL_MS);
    return () => clearTimeout(timer);
  }, [settling, polls, store]);

  const back = (
    <Link
      href="/stores"
      className={`inline-flex items-center gap-1.5 rounded text-[13px] text-studio-muted hover:text-white ${focusRing}`}
    >
      <ArrowLeft className="size-4" aria-hidden />
      All stores
    </Link>
  );

  if (error && !store) {
    return (
      <>
        {back}
        <StoresError error={error} className="mt-4" />
      </>
    );
  }
  if (!store) {
    return (
      <>
        {back}
        <div className="mt-4">{skeleton}</div>
      </>
    );
  }

  const name = store.title || store.domain;
  const state = storeState(store.status, store.paused);
  const points = store.series.map((p) => ({ date: p.day, value: p.product_count }));
  const tabs: [Tab, string][] = [
    ['changes', 'Changes'],
    ['products', `Products ${store.product_count.toLocaleString('en-US')}`],
    ['ads', `Ads ${store.ads_count.toLocaleString('en-US')}`],
  ];

  return (
    <>
      {back}
      <section className="mt-4 rounded-[14px] border border-dash-line bg-dash-panel p-5 sm:p-6">
        <div className="flex flex-wrap items-start gap-4">
          <Monogram name={name} size="size-12" />
          <div className="min-w-0 flex-1 basis-[220px]">
            <h2 className="text-[20px] leading-tight font-semibold break-words text-white">
              {name}
            </h2>
            <a
              href={`https://${store.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-1 inline-flex items-center gap-1 rounded text-[12.5px] text-studio-muted hover:text-white ${focusRing}`}
            >
              {store.domain}
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </div>
          <StateBadge store={store} />
        </div>
        {state.hint && (
          <p className="mt-4 max-w-[70ch] text-[13px] text-studio-muted">{state.hint}</p>
        )}
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
          <Stat label="Products" value={store.product_count.toLocaleString('en-US')} />
          <Stat label="Changes, last 7 days" value={store.changes_7d.toLocaleString('en-US')} />
          <Stat label="Theme" value={store.theme ?? '—'} />
          <Stat label="Currency" value={store.currency ?? '—'} />
        </dl>
        <p className="mt-4 text-[12.5px] text-studio-meta">
          {readAgo(store.last_fetched_at)}
          {store.status === 'ok' && !store.paused && ' · next reading within 24 hours'}
        </p>
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.4fr)]">
        <div className="space-y-5 rounded-[14px] border border-dash-line bg-dash-panel p-5 sm:p-6">
          <h2 className="text-[15px] font-semibold text-white">Tools on the store</h2>
          <Chips label="Ad pixels" items={store.pixels} />
          <Chips label="Apps" items={store.apps} />
        </div>
        <div className="rounded-[14px] border border-dash-line bg-dash-panel p-5 sm:p-6">
          <h2 className="mb-4 text-[15px] font-semibold text-white">
            Products listed, last 30 days
          </h2>
          {points.length < 2 ? (
            <p className="max-w-[52ch] text-[13px] text-studio-muted">
              {points.length === 1
                ? `${countLabel(points[0].value, 'product', 'products')} at the first reading. The chart starts with the second daily reading.`
                : 'The chart starts after the first reading.'}
            </p>
          ) : (
            <ColumnChart
              points={points}
              format={(n) => n.toLocaleString('en-US')}
              label="Products listed"
            />
          )}
        </div>
      </section>

      <div
        role="tablist"
        aria-label="Store data"
        className="mt-8 mb-5 inline-flex max-w-full gap-1 overflow-x-auto rounded-[12px] border border-studio-rule bg-studio-surface p-1 [scrollbar-width:none]"
      >
        {tabs.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            aria-current={tab === key ? 'page' : undefined}
            onClick={() => setTab(key)}
            className={`studio-tab shrink-0 tabular-nums ${focusRing}`}
          >
            {label}
          </button>
        ))}
      </div>
      <div role="tabpanel">
        {tab === 'changes' && <Changes store={store} />}
        {tab === 'products' && <Products store={store} />}
        {tab === 'ads' && <Ads store={store} />}
      </div>
    </>
  );
}
