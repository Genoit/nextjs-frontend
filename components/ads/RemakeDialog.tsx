'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronRight, Package, Plus, Search, X } from 'lucide-react';
import { productApi } from '../../lib/api/product';
import { adsErrorCode, type AdOut } from '../../lib/api/ads';
import { adsErrorText } from '../../lib/ads-rules.mjs';
import type { Product } from '../../lib/types/product';
import { useModal } from '../product-input/dialogs';
import { focusRing } from '../dashboard/DashShell';

// The products API caps a page at 100; beyond that the search narrows what is listed.
const PAGE_SIZE = 100;
const SEARCH_FROM = 7;

const remakeHref = (ad: AdOut, productId?: string) =>
  productId
    ? `/product-input?product=${encodeURIComponent(productId)}&ref_ad=${encodeURIComponent(ad.ad_archive_id)}`
    : `/product-input?ref_ad=${encodeURIComponent(ad.ad_archive_id)}`;

const rowClass = `flex min-h-[64px] items-center gap-3 rounded-xl px-2.5 py-2 transition hover:bg-studio-raised ${focusRing}`;

/**
 * Pick the product a competitor ad is remade for. Picking a row goes straight to the strategy
 * step, so no row is a primary button. Native modal dialog: focus trap, Escape, labelled.
 */
export function RemakeDialog({ ad, onClose }: { ad: AdOut | null; onClose: () => void }) {
  const ref = useModal(ad !== null, onClose);
  return (
    <dialog
      ref={ref}
      aria-labelledby="remake-title"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-0 mt-auto max-h-[85dvh] w-full max-w-none rounded-t-2xl border border-dash-line bg-dash-panel p-0 text-white shadow-[0_24px_64px_-12px_rgb(0_0_0/0.7)] backdrop:bg-black/60 sm:m-auto sm:max-h-[min(640px,85dvh)] sm:w-[calc(100%-2rem)] sm:max-w-[520px] sm:rounded-2xl"
    >
      {ad && <Picker key={ad.ad_archive_id} ad={ad} onClose={onClose} />}
    </dialog>
  );
}

function Picker({ ad, onClose }: { ad: AdOut; onClose: () => void }) {
  const [products, setProducts] = useState<Product[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [term, setTerm] = useState('');

  useEffect(() => {
    let alive = true;
    productApi.getProducts({ page: 1, page_size: PAGE_SIZE }).then(
      (res) => alive && setProducts(res.products),
      (e) => alive && setError(adsErrorText(adsErrorCode(e))),
    );
    return () => {
      alive = false;
    };
  }, []);

  const needle = term.trim().toLowerCase();
  const shown = products?.filter((p) => p.title.toLowerCase().includes(needle)) ?? [];

  return (
    <div className="flex max-h-[inherit] flex-col">
      <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4">
        <div className="min-w-0">
          <h2 id="remake-title" className="text-lg font-semibold tracking-[-0.01em]">
            Remake this ad
          </h2>
          <p className="mt-1 text-[13px] leading-[1.5] text-studio-muted">
            Pick the product to advertise. Your ad follows the structure of{' '}
            <span className="text-dash-soft">{ad.page_name}</span>&apos;s ad, never its words or
            footage.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className={`-mt-1 -mr-2 inline-flex size-10 shrink-0 items-center justify-center rounded-lg text-studio-muted transition hover:bg-studio-raised hover:text-white ${focusRing}`}
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      {products && products.length >= SEARCH_FROM && (
        <div className="px-5 pb-3">
          <label className="relative block">
            <span className="sr-only">Search your products</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-studio-meta"
              aria-hidden
            />
            <input
              type="search"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search your products"
              className="h-10 w-full rounded-[10px] border border-dash-edge bg-dash-field pr-3 pl-9 text-sm text-white placeholder:text-studio-meta focus:border-dash-edge-hover focus:outline-none"
            />
          </label>
        </div>
      )}

      <div className="min-h-0 flex-1 overflow-y-auto px-2.5">
        {error ? (
          <p role="alert" className="px-2.5 py-6 text-sm text-danger">
            {error}
          </p>
        ) : products === null ? (
          <ul aria-label="Loading your products" className="space-y-1 pb-2">
            {[0, 1, 2].map((i) => (
              <li key={i} className="flex min-h-[64px] items-center gap-3 px-2.5">
                <span className="size-12 animate-pulse rounded-lg bg-dash-raised" />
                <span className="h-3.5 w-2/3 animate-pulse rounded bg-dash-raised" />
              </li>
            ))}
          </ul>
        ) : products.length === 0 ? (
          <p className="px-2.5 py-6 text-sm text-studio-muted">
            You have no products yet. Import one to remake this ad for it.
          </p>
        ) : shown.length === 0 ? (
          <p className="px-2.5 py-6 text-sm text-studio-muted">No product matches “{term}”.</p>
        ) : (
          <ul aria-label="Your products" className="space-y-0.5 pb-2">
            {shown.map((p) => {
              const img = p.images?.find((i) => i.is_primary)?.url || p.main_image_url;
              return (
                <li key={p.id}>
                  <Link href={remakeHref(ad, p.id)} className={rowClass}>
                    <span className="flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-dash-raised">
                      {img ? (
                        // eslint-disable-next-line @next/next/no-img-element -- remote shop images
                        <img src={img} alt="" className="size-full object-cover" />
                      ) : (
                        <Package className="size-5 text-studio-meta" aria-hidden />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-white">
                        {p.title}
                      </span>
                      {p.price != null && (
                        <span className="mt-0.5 block text-[12.5px] text-studio-muted tabular-nums">
                          {p.price} {p.currency}
                        </span>
                      )}
                    </span>
                    <ChevronRight className="size-4 shrink-0 text-studio-meta" aria-hidden />
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="border-t border-dash-line px-2.5 py-2.5">
        <Link href={remakeHref(ad)} className={rowClass}>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-lg border border-dashed border-dash-edge-strong">
            <Plus className="size-5 text-dash-soft" aria-hidden />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-medium text-white">Import a product</span>
            <span className="mt-0.5 block text-[12.5px] text-studio-muted">
              From a link, photos or your own words
            </span>
          </span>
          <ChevronRight className="size-4 shrink-0 text-studio-meta" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
