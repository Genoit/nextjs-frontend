'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ExternalLink, Loader2, Plus } from 'lucide-react';
import { STORE_CAPTURE_EVENT, takeStoreCapture } from '../../../lib/extension-capture';
import { storesApi, type InspectOut } from '../../../lib/api/stores';
import { bestSellersUrl, countLabel, listingInfo } from '../../../lib/stores-rules.mjs';
import { EmptyState, Monogram } from '../../../components/ads/AdvertiserRow';
import { focusRing } from '../../../components/dashboard/DashShell';
import { primaryBtn, secondaryBtn } from '../../../components/shopify/ui';
import { StoresError, listBox } from '../../../components/stores/StoreUi';

const WAIT_MS = 4000; // the extension writes right after the page loads

function Chips({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="min-w-0">
      <h3 className="text-[12.5px] text-studio-muted">{label}</h3>
      {items.length === 0 ? (
        <p className="mt-2 text-[13px] text-studio-meta">None found on this page</p>
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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[12.5px] text-studio-muted">{label}</dt>
      <dd className="mt-1 truncate text-[17px] font-semibold text-white tabular-nums">{value}</dd>
    </div>
  );
}

function HowTo() {
  return (
    <EmptyState title="Look into a store with the extension">
      <ol className="list-decimal space-y-1.5 pl-5">
        <li>Install the “Send to TrendED” browser extension.</li>
        <li>
          Open a Shopify store. For its best sellers, open its “all products” page sorted by best
          selling.
        </li>
        <li>Click the extension icon. The store&apos;s tools and products show up here.</li>
      </ol>
      <p>
        The extension reads only the page you opened, in your own browser. It makes no request to
        the store.
      </p>
    </EmptyState>
  );
}

export default function InspectPage() {
  const [page, setPage] = useState<InspectOut | null>(null);
  const [state, setState] = useState<'waiting' | 'reading' | 'none' | 'done'>('waiting');
  const [error, setError] = useState<unknown>(null);
  const [following, setFollowing] = useState(false);
  const [followError, setFollowError] = useState<unknown>(null);
  const [storeId, setStoreId] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const run = () => {
      const capture = takeStoreCapture();
      if (!capture) return false;
      setState('reading');
      storesApi.inspect(capture.url, capture.html).then(
        (out) => {
          if (!alive) return;
          setPage(out);
          setStoreId(out.store_id);
          setState('done');
        },
        (e) => {
          if (!alive) return;
          setError(e);
          setState('done');
        },
      );
      return true;
    };
    if (run()) return;
    window.addEventListener(STORE_CAPTURE_EVENT, run, { once: true });
    const timer = setTimeout(
      () => alive && setState((s) => (s === 'waiting' ? 'none' : s)),
      WAIT_MS,
    );
    return () => {
      alive = false;
      clearTimeout(timer);
      window.removeEventListener(STORE_CAPTURE_EVENT, run);
    };
  }, []);

  const follow = async () => {
    if (!page || following) return;
    setFollowing(true);
    setFollowError(null);
    try {
      const store = await storesApi.follow(page.domain);
      setStoreId(store.id);
    } catch (e) {
      setFollowError(e);
    } finally {
      setFollowing(false);
    }
  };

  const back = (
    <Link
      href="/stores"
      className={`inline-flex items-center gap-1.5 rounded text-[13px] text-studio-muted hover:text-white ${focusRing}`}
    >
      <ArrowLeft className="size-4" aria-hidden />
      All stores
    </Link>
  );

  if (state === 'waiting' || state === 'reading') {
    return (
      <>
        {back}
        <div
          className="mt-4 h-[220px] animate-pulse rounded-[14px] bg-dash-panel"
          aria-busy="true"
          aria-label="Reading the store page"
        />
      </>
    );
  }
  if (error) {
    return (
      <>
        {back}
        <StoresError error={error} className="mt-4" />
      </>
    );
  }
  if (!page) {
    return (
      <>
        {back}
        <div className="mt-4">
          <HowTo />
        </div>
      </>
    );
  }

  const name = page.title || page.domain;
  const listing = listingInfo(page);

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
              href={`https://${page.domain}`}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-1 inline-flex items-center gap-1 rounded text-[12.5px] text-studio-muted hover:text-white ${focusRing}`}
            >
              {page.domain}
              <ExternalLink className="size-3.5" aria-hidden />
            </a>
          </div>
          {!page.is_shopify ? null : storeId ? (
            <Link href={`/stores/${storeId}`} className={secondaryBtn}>
              Open its daily changes
              <ArrowRight className="size-4" aria-hidden />
            </Link>
          ) : (
            <button type="button" onClick={follow} disabled={following} className={primaryBtn}>
              {following ? (
                <Loader2 className="size-4 animate-spin" aria-hidden />
              ) : (
                <Plus className="size-4" aria-hidden />
              )}
              Follow store
            </button>
          )}
        </div>
        {followError != null && <StoresError error={followError} className="mt-3" />}
        {!page.is_shopify ? (
          <p className="mt-4 max-w-[70ch] text-[13px] text-studio-muted">
            This page does not look like a Shopify store. We can only read Shopify stores for now.
          </p>
        ) : (
          <>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4">
              <Stat label="Theme" value={page.theme ?? '—'} />
              <Stat label="Currency" value={page.currency ?? '—'} />
              <Stat label="Products on the page" value={String(page.products.length)} />
              <Stat label="Ads in our index" value={page.ads_count.toLocaleString('en-US')} />
            </dl>
            <p className="mt-4 text-[12.5px] text-studio-meta">
              Read from the page you opened, just now. Nothing was requested from the store.
            </p>
          </>
        )}
      </section>

      {page.is_shopify && (
        <>
          <section className="mt-4 grid gap-5 rounded-[14px] border border-dash-line bg-dash-panel p-5 sm:grid-cols-2 sm:p-6">
            <Chips label="Ad pixels" items={page.pixels} />
            <Chips label="Apps" items={page.apps} />
          </section>

          <div className="mt-8 flex flex-wrap items-end justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-[15px] font-semibold text-white">
                {listing.heading}{' '}
                {page.products.length > 0 && (
                  <span className="font-normal text-studio-meta tabular-nums">
                    {page.products.length}
                  </span>
                )}
              </h2>
              <p className="mt-1 max-w-[70ch] text-[12.5px] text-studio-muted">{listing.note}</p>
            </div>
            {listing.suggestBestSellers && (
              <a
                href={bestSellersUrl(page.domain)}
                target="_blank"
                rel="noopener noreferrer"
                className={secondaryBtn}
              >
                Open its best sellers
                <ExternalLink className="size-4" aria-hidden />
              </a>
            )}
          </div>
          {listing.suggestBestSellers && (
            <p className="mt-2 max-w-[70ch] text-[12.5px] text-studio-muted">
              Then click the extension icon again on that page.
            </p>
          )}
          {page.products.length > 0 && (
            <ol className={`mt-4 ${listBox}`}>
              {page.products.map((p) => (
                <li key={p.handle} className="flex items-center gap-3 px-4 py-3">
                  {page.best_selling && (
                    <span
                      className="w-7 shrink-0 text-right text-[13px] font-semibold text-studio-muted tabular-nums"
                      aria-label={`Rank ${p.rank}`}
                    >
                      {p.rank}
                    </span>
                  )}
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`min-w-0 flex-1 truncate rounded text-[13.5px] font-medium text-white hover:underline ${focusRing}`}
                  >
                    {p.title || p.handle}
                  </a>
                </li>
              ))}
            </ol>
          )}
          {page.store_id && page.best_selling && page.products.length > 0 && (
            <p className="mt-3 max-w-[70ch] text-[12.5px] text-studio-muted">
              You follow this store: our next daily reading starts with the first{' '}
              {countLabel(Math.min(10, page.products.length), 'best seller', 'best sellers')} for
              their prices.
            </p>
          )}
        </>
      )}
    </>
  );
}
