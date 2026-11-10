'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { AlertTriangle, Check, Loader2, PenLine, Send, Store } from 'lucide-react';
import {
  shopifyApi,
  shopifyErrorCode,
  type ListingView,
  type ShopifyListing,
  type ShopifyStore,
  type StorePreview,
} from '../../lib/api/shopify';
import { productApi } from '../../lib/api/product';
import type { Product } from '../../lib/types/product';
import { STORE_STATUS_LABEL, sendBlocker, shopifyErrorText } from '../../lib/shopify-rules.mjs';
import { SyncBadges } from './SyncBadges';
import { ConflictPanel } from './ConflictPanel';
import { Notice, field, labelText, panel, secondaryBtn } from './ui';

const LANGUAGES: [string, string][] = [
  ['en', 'English'],
  ['fr', 'French'],
  ['de', 'German'],
  ['es', 'Spanish'],
  ['it', 'Italian'],
  ['pt', 'Portuguese'],
  ['nl', 'Dutch'],
];

const COST = /^\d+(\.\d{1,4})?$/;

type Form = {
  title: string;
  description: string;
  language: string;
  cost: string;
  currency: string;
  variantCosts: Record<string, string>;
};

const formFrom = (v: ListingView): Form => ({
  title: v.title ?? '',
  description: v.description ?? '',
  language: v.language,
  cost: v.purchase_costs.default ?? '',
  currency: v.currency ?? '',
  variantCosts: Object.fromEntries(
    Object.entries(v.purchase_costs)
      .filter(([k]) => k !== 'default')
      .map(([k, c]) => [k, c ?? '']),
  ),
});

type Data = {
  view: ListingView;
  stores: ShopifyStore[];
  listings: ShopifyListing[];
  product: Product | null;
};

type Result = { tone: 'success' | 'danger'; text: string } | null;

const errorText = (err: unknown) => shopifyErrorText(shopifyErrorCode(err));

/** Product page: review the Shopify listing (copy, costs, prices per store), send it, follow its sync. */
export function SendToShopify({ productId }: { productId: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [form, setForm] = useState<Form | null>(null);
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState<'save' | 'copy' | 'send' | null>(null);
  const [result, setResult] = useState<Result>(null);

  const load = useCallback(async () => {
    setLoadError(null);
    try {
      const [view, stores, listings, product] = await Promise.all([
        shopifyApi.listing(productId),
        shopifyApi.stores(),
        shopifyApi.listings(productId),
        productApi.getProduct(productId).catch(() => null), // only used for variant names
      ]);
      setData({ view, stores, listings, product });
      setForm(formFrom(view));
      const active = stores.filter((s) => s.status === 'active');
      setPicked(active.length === 1 ? [active[0].id] : []);
    } catch (err) {
      setLoadError(errorText(err));
    }
  }, [productId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount
    load();
  }, [load]);

  // Follow pushes in flight until they settle.
  const syncing = data?.listings.some((l) => l.state === 'syncing') ?? false;
  useEffect(() => {
    if (!syncing) return;
    const t = window.setInterval(() => {
      shopifyApi
        .listings(productId)
        .then((listings) => setData((d) => (d ? { ...d, listings } : d)))
        .catch(() => undefined); // the next tick retries
    }, 4000);
    return () => window.clearInterval(t);
  }, [syncing, productId]);

  if (loadError) {
    return (
      <section className={panel} aria-labelledby="shopify-panel">
        <PanelHead />
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Notice tone="danger" icon={<AlertTriangle className="size-3.5" aria-hidden />}>
            Couldn’t load the Shopify listing. {loadError}
          </Notice>
          <button type="button" onClick={load} className={secondaryBtn}>
            Retry
          </button>
        </div>
      </section>
    );
  }

  if (!data || !form) {
    return (
      <section className={panel} aria-labelledby="shopify-panel" aria-busy="true">
        <PanelHead />
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {[0, 1].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-4 w-24 rounded bg-studio-raised-2" />
              <div className="h-[38px] rounded-[10px] bg-studio-raised" />
              <div className="h-24 rounded-[10px] bg-studio-raised" />
            </div>
          ))}
        </div>
      </section>
    );
  }

  const { view, stores, listings, product } = data;

  if (stores.length === 0) {
    return (
      <section className={panel} aria-labelledby="shopify-panel">
        <PanelHead />
        <div className="mt-5 flex flex-wrap items-center justify-between gap-4 rounded-[10px] border border-dashed border-studio-rule-strong px-4 py-4">
          <p className="text-[13px] text-studio-muted">
            Connect a Shopify store to send this product as a draft.
          </p>
          <Link href="/settings#stores" className={secondaryBtn}>
            <Store className="size-4" aria-hidden />
            Connect a store
          </Link>
        </div>
      </section>
    );
  }

  const variants = product?.variants ?? [];
  const variantName = (key: string) =>
    key === 'default' ? 'Default' : (variants.find((v) => v.id === key)?.title ?? 'Variant');
  const dirty = JSON.stringify(form) !== JSON.stringify(formFrom(view));
  const costs = [form.cost, ...Object.values(form.variantCosts)];
  const badCost = costs.some((c) => c !== '' && !COST.test(c.trim()));
  const badCurrency = form.currency !== '' && !/^[A-Za-z]{3}$/.test(form.currency);
  const invalid = badCost
    ? 'Costs are numbers like 4.20.'
    : badCurrency
      ? 'The currency is a 3-letter code, like CNY.'
      : null;
  const blocker = sendBlocker(view, { dirty, picked });
  const prefilled = view.missing_costs.length > 0 && form.cost !== '' && !dirty;
  const set = (patch: Partial<Form>) => {
    setForm((f) => (f ? { ...f, ...patch } : f));
    setResult(null);
  };

  const save = async () => {
    setBusy('save');
    setResult(null);
    try {
      const next = await shopifyApi.saveListing(productId, {
        title: form.title.trim(),
        description: form.description,
        language: form.language,
        purchase_cost: form.cost.trim() || null,
        purchase_cost_currency: form.currency.trim().toUpperCase() || null,
        variant_costs: Object.fromEntries(
          Object.entries(form.variantCosts).map(([k, c]) => [k, c.trim() || null]),
        ),
        pricing_override: view.pricing_override,
      });
      setForm(formFrom(next));
      // A saved edit marks sent listings `syncing`: show it, which also starts the poll.
      const fresh = await shopifyApi.listings(productId).catch(() => null);
      setData((d) => (d ? { ...d, view: next, listings: fresh ?? d.listings } : d));
      setResult({ tone: 'success', text: 'Listing saved.' });
    } catch (err) {
      setResult({ tone: 'danger', text: errorText(err) });
    } finally {
      setBusy(null);
    }
  };

  const writeCopy = async () => {
    setBusy('copy');
    setResult(null);
    try {
      const next = await shopifyApi.generateCopy(productId, form.language);
      setData((d) => (d ? { ...d, view: next } : d));
      // The copy is saved server side; unsaved cost edits stay in the form.
      setForm({
        ...form,
        title: next.title ?? '',
        description: next.description ?? '',
        language: next.language,
      });
    } catch (err) {
      setResult({ tone: 'danger', text: errorText(err) });
    } finally {
      setBusy(null);
    }
  };

  const send = async () => {
    setBusy('send');
    setResult(null);
    try {
      await shopifyApi.send(productId, picked);
      const fresh = await shopifyApi.listings(productId);
      setData((d) => (d ? { ...d, listings: fresh } : d));
      setResult({
        tone: 'success',
        text: `Sent as a draft to ${picked.length} store${picked.length === 1 ? '' : 's'}. Publish it from Shopify when you are ready.`,
      });
    } catch (err) {
      setResult({ tone: 'danger', text: errorText(err) });
    } finally {
      setBusy(null);
    }
  };

  const setListing = (next: ShopifyListing) =>
    setData((d) =>
      d ? { ...d, listings: d.listings.map((x) => (x.id === next.id ? next : x)) } : d,
    );
  const reloadListings = () =>
    shopifyApi
      .listings(productId)
      .then((fresh) => setData((d) => (d ? { ...d, listings: fresh } : d)))
      .catch(() => undefined); // the panel keeps its error line

  const languages = LANGUAGES.some(([c]) => c === form.language)
    ? LANGUAGES
    : [[form.language, form.language] as [string, string], ...LANGUAGES];

  return (
    <section className={panel} aria-labelledby="shopify-panel">
      <PanelHead />

      {listings.length > 0 && (
        <div className="mt-5 space-y-3">
          <h3 className="text-[13px] font-semibold text-studio-text">Sent to</h3>
          <SyncBadges listings={listings} onChange={setListing} />
          {listings
            .filter((l) => l.state === 'conflict')
            .map((l) => (
              <ConflictPanel
                // A new set of diffs (after a poll or a reload) starts the choices over.
                key={`${l.id}:${(l.diffs ?? []).map((d) => d.field).join(',')}`}
                listing={l}
                variantName={variantName}
                onResolved={setListing}
                onStale={reloadListings}
              />
            ))}
        </div>
      )}

      <div className="mt-7 grid gap-x-8 gap-y-7 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        <div>
          <h3 className="text-[13px] font-semibold text-studio-text">Listing copy</h3>
          <p className="mt-0.5 text-[12.5px] text-studio-muted">
            Shared by every store. Writing it costs no credits.
          </p>
          <div className="mt-4 space-y-4">
            <label className="block">
              <span className={labelText}>Title</span>
              <input
                className={field}
                value={form.title}
                maxLength={255}
                onChange={(e) => set({ title: e.target.value })}
                placeholder="Write a title or let TrendED write one"
              />
            </label>
            <label className="block">
              <span className={labelText}>Description</span>
              <textarea
                className={`${field} h-auto min-h-[132px] resize-y py-2.5 leading-relaxed`}
                value={form.description}
                onChange={(e) => set({ description: e.target.value })}
              />
            </label>
            <div className="flex flex-wrap items-end gap-3">
              <label className="block w-[180px]">
                <span className={labelText}>Language</span>
                <select
                  className={`${field} cursor-pointer`}
                  value={form.language}
                  onChange={(e) => set({ language: e.target.value })}
                >
                  {languages.map(([code, name]) => (
                    <option key={code} value={code}>
                      {name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="button"
                onClick={writeCopy}
                disabled={busy !== null}
                className={secondaryBtn}
              >
                {busy === 'copy' ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : (
                  <PenLine className="size-4" aria-hidden />
                )}
                {view.title ? 'Rewrite copy' : 'Write copy'}
              </button>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-[13px] font-semibold text-studio-text">Purchase cost</h3>
          <p className="mt-0.5 text-[12.5px] text-studio-muted">
            What you pay the supplier per unit. Prices are computed from it.
          </p>
          <div className="mt-4 grid grid-cols-[minmax(0,1fr)_96px] gap-3">
            <label className="block">
              <span className={labelText}>
                {variants.length ? 'Cost for every variant' : 'Cost'}
              </span>
              <input
                className={`${field} tabular-nums`}
                inputMode="decimal"
                value={form.cost}
                onChange={(e) => set({ cost: e.target.value })}
                placeholder="4.20"
              />
            </label>
            <label className="block">
              <span className={labelText}>Currency</span>
              <input
                className={`${field} uppercase`}
                value={form.currency}
                maxLength={3}
                onChange={(e) => set({ currency: e.target.value.toUpperCase() })}
                placeholder="CNY"
              />
            </label>
          </div>
          {prefilled && (
            <p className="mt-2 flex items-start gap-1.5 text-[12.5px] text-warning">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              Prefilled from the supplier price, not saved yet. Check it, then save.
            </p>
          )}
          {variants.length > 0 && (
            <ul className="mt-4 divide-y divide-studio-rule">
              {variants.map((v) => (
                <li key={v.id} className="flex items-center gap-3 py-2">
                  <span className="min-w-0 flex-1 truncate text-[13px] text-studio-text">
                    {v.title}
                  </span>
                  <div className="w-[120px] shrink-0">
                    <input
                      aria-label={`Cost for ${v.title}`}
                      className={`${field} tabular-nums`}
                      inputMode="decimal"
                      value={form.variantCosts[v.id] ?? ''}
                      onChange={(e) =>
                        set({ variantCosts: { ...form.variantCosts, [v.id]: e.target.value } })
                      }
                      placeholder={form.cost || 'Same'}
                    />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-[13px] font-semibold text-studio-text">Send to</h3>
        <div className="mt-3 flex flex-wrap gap-2">
          {stores.map((s) => {
            const active = s.status === 'active';
            const on = picked.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                aria-pressed={on}
                disabled={!active}
                title={active ? undefined : STORE_STATUS_LABEL[s.status]}
                onClick={() => {
                  setPicked((p) => (on ? p.filter((x) => x !== s.id) : [...p, s.id]));
                  setResult(null);
                }}
                className="studio-chip max-w-full disabled:cursor-not-allowed disabled:opacity-60"
              >
                {on ? (
                  <Check className="size-3.5" aria-hidden />
                ) : (
                  <Store className="size-3.5" aria-hidden />
                )}
                <span className="truncate">{s.shop_domain}</span>
                {!active && (
                  <span className="text-studio-meta">
                    · {STORE_STATUS_LABEL[s.status] ?? s.status}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {picked.length > 0 && (
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {stores
              .filter((s) => picked.includes(s.id))
              .map((s) => (
                <PricePreview
                  key={s.id}
                  store={s}
                  preview={view.previews[s.id]}
                  variantName={variantName}
                  stale={dirty}
                />
              ))}
          </div>
        )}
      </div>

      <div className="mt-8 flex flex-col gap-3 border-t border-studio-rule pt-5 sm:flex-row sm:items-center">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={save}
            disabled={busy !== null || invalid !== null || !form.title.trim()}
            className={secondaryBtn}
          >
            {busy === 'save' && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Save listing
          </button>
          <button
            type="button"
            onClick={send}
            disabled={busy !== null || blocker !== null}
            aria-describedby="send-reason"
            className={`${secondaryBtn} font-semibold`}
          >
            {busy === 'send' ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Send className="size-4" aria-hidden />
            )}
            Validate and send
          </button>
        </div>
        <p id="send-reason" className="text-[12.5px] text-studio-muted sm:ml-1">
          {invalid ??
            blocker ??
            'Creates a draft product in each picked store. Nothing goes live until you publish it.'}
        </p>
      </div>

      {result && (
        <div className="mt-4">
          <Notice
            tone={result.tone}
            icon={
              result.tone === 'success' ? (
                <Check className="size-3.5" aria-hidden />
              ) : (
                <AlertTriangle className="size-3.5" aria-hidden />
              )
            }
          >
            {result.text}
          </Notice>
        </div>
      )}
    </section>
  );
}

function PanelHead() {
  return (
    <div>
      <h2 id="shopify-panel" className="text-[16px] font-semibold text-studio-text">
        Shopify
      </h2>
      <p className="mt-1 text-[13px] text-studio-muted">
        Review the listing, check the price in each store, then send it as a draft.
      </p>
    </div>
  );
}

/** One store's prices as the rule computes them, from the saved costs. */
function PricePreview({
  store,
  preview,
  variantName,
  stale,
}: {
  store: ShopifyStore;
  preview: StorePreview | undefined;
  variantName: (key: string) => string;
  stale: boolean;
}) {
  const cur = store.currency ?? '';
  const rule = `×${Number(store.multiplier)} · ${store.rounding === 'none' ? 'no rounding' : `ends in ${store.rounding}`}`;
  return (
    <div className="min-w-0 rounded-[10px] bg-studio-raised p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
        <p className="min-w-0 truncate text-[13px] font-medium text-studio-text">
          {store.shop_domain}
        </p>
        <p className="text-[12px] text-studio-meta">{rule}</p>
      </div>
      {!preview ? (
        <p className="mt-3 text-[12.5px] text-studio-muted">No preview for this store.</p>
      ) : !Array.isArray(preview) ? (
        <p className="mt-3 flex items-start gap-1.5 text-[12.5px] text-warning">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {preview.error === 'fx_unavailable'
            ? `No exchange rate for ${preview.currency} yet, so prices cannot be computed.`
            : 'Save a purchase cost for every variant to see prices.'}
        </p>
      ) : (
        <>
          <ul className={`mt-3 divide-y divide-studio-rule ${stale ? 'opacity-50' : ''}`}>
            {preview.map((p) => (
              <li key={p.variant_key} className="py-2 first:pt-0 last:pb-0">
                <div className="flex items-baseline gap-3">
                  <span className="min-w-0 flex-1 truncate text-[13px] text-studio-text">
                    {variantName(p.variant_key)}
                  </span>
                  <span className="text-[14px] font-semibold text-studio-text tabular-nums">
                    {p.price}{' '}
                    <span className="text-[11.5px] font-normal text-studio-meta">{cur}</span>
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] text-studio-muted tabular-nums">
                  Cost {p.cost} {p.cost_currency}
                  {p.cost_currency !== cur && ` = ${p.converted_cost} ${cur}`} · margin {p.margin}{' '}
                  {cur}
                  {p.compare_at && ` · compare-at ${p.compare_at}`}
                </p>
              </li>
            ))}
          </ul>
          {preview[0] && preview[0].cost_currency !== cur && (
            <p className="mt-3 text-[12px] text-studio-meta tabular-nums">
              1 {preview[0].cost_currency} = {preview[0].fx_rate} {cur}, ECB rate of{' '}
              {preview[0].fx_date}
            </p>
          )}
          {stale && (
            <p className="mt-2 text-[12px] text-studio-meta">Save to update these prices.</p>
          )}
        </>
      )}
    </div>
  );
}
