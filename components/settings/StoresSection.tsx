'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  Check,
  CheckCircle2,
  CirclePause,
  GitCompare,
  Loader2,
  Plug,
  Unplug,
} from 'lucide-react';
import {
  shopifyApi,
  shopifyErrorCode,
  type Rounding,
  type ShopifyAlert,
  type ShopifyStore,
} from '../../lib/api/shopify';
import { STORE_STATUS_LABEL, shopifyErrorText, storeLimitText } from '../../lib/shopify-rules.mjs';
import {
  Badge,
  Notice,
  field,
  labelText,
  panel,
  primaryBtn,
  secondaryBtn,
  textBtn,
  type Tone,
} from '../shopify/ui';

export type StoresNotice = { tone: 'success' | 'danger'; text: string } | null;

const errorText = (err: unknown) => shopifyErrorText(shopifyErrorCode(err));
const ic = 'size-3.5';

function StoreBadge({ status }: { status: string }) {
  const look: { tone: Tone; icon: React.ReactNode } =
    status === 'active'
      ? { tone: 'success', icon: <CheckCircle2 className={ic} aria-hidden /> }
      : status === 'paused_over_limit'
        ? { tone: 'warning', icon: <CirclePause className={ic} aria-hidden /> }
        : { tone: 'danger', icon: <Unplug className={ic} aria-hidden /> };
  return (
    <Badge tone={look.tone} icon={look.icon}>
      {STORE_STATUS_LABEL[status] ?? status}
    </Badge>
  );
}

/** Settings → Stores: the connected Shopify stores, their pricing rule, and listings needing attention. */
export function StoresSection({ notice }: { notice: StoresNotice }) {
  const [stores, setStores] = useState<ShopifyStore[] | null>(null);
  // From the backend: limit is null when plan limits are not enforced.
  const [limit, setLimit] = useState<{ limit: number | null; used: number } | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoadError(null);
    Promise.all([shopifyApi.stores(), shopifyApi.storeLimit()]).then(
      ([s, l]) => {
        setStores(s);
        setLimit(l);
      },
      (err) => setLoadError(errorText(err)),
    );
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch on mount and after a confirmed install
    load();
  }, [load, notice]);

  return (
    <div className="space-y-5">
      <section className={panel} aria-labelledby="stores-title">
        <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
          <div className="min-w-0">
            <h2 id="stores-title" className="text-[16px] font-semibold text-studio-text">
              Stores
            </h2>
            <p className="mt-1 text-[13px] text-studio-muted">
              Connect Shopify stores to send products as drafts and keep them in sync.
            </p>
          </div>
          {limit && limit.limit !== null && (
            <p className="text-[13px] text-studio-muted tabular-nums">
              {limit.limit > 0 ? storeLimitText(limit.used, limit.limit) : 'Free plan'}
            </p>
          )}
        </div>

        {notice && (
          <div className="mt-5">
            <Notice
              tone={notice.tone}
              icon={
                notice.tone === 'success' ? (
                  <Check className={ic} aria-hidden />
                ) : (
                  <AlertTriangle className={ic} aria-hidden />
                )
              }
            >
              {notice.text}
            </Notice>
          </div>
        )}

        <ConnectForm limit={limit} />

        <div className="mt-7">
          {loadError ? (
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-[13px] text-danger">Couldn’t load your stores. {loadError}</p>
              <button type="button" onClick={load} className={secondaryBtn}>
                Retry
              </button>
            </div>
          ) : !stores ? (
            <ul aria-busy="true" className="space-y-3">
              {[0, 1].map((i) => (
                <li key={i} className="h-[92px] rounded-[10px] bg-studio-raised" />
              ))}
            </ul>
          ) : stores.length === 0 ? (
            <p className="rounded-[10px] border border-dashed border-studio-rule-strong px-4 py-3.5 text-[13px] text-studio-muted">
              No store connected yet. Enter your store address above to connect it.
            </p>
          ) : (
            <ul className="space-y-3">
              {stores.map((s) => (
                <StoreRow
                  key={s.id}
                  store={s}
                  onChange={(next) =>
                    setStores((all) =>
                      next === null
                        ? (all ?? []).filter((x) => x.id !== s.id)
                        : (all ?? []).map((x) => (x.id === next.id ? next : x)),
                    )
                  }
                />
              ))}
            </ul>
          )}
        </div>
      </section>

      <AlertsPanel />
    </div>
  );
}

function ConnectForm({
  limit: storeLimit,
}: {
  limit: { limit: number | null; used: number } | null;
}) {
  const [shop, setShop] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = storeLimit?.limit ?? null;
  if (limit === 0) {
    return (
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 rounded-[10px] bg-studio-raised px-4 py-4">
        <p className="text-[13px] text-studio-muted">
          Store connections start with the Starter plan.
        </p>
        <Link href="/billing" className={primaryBtn}>
          Upgrade to connect a store
        </Link>
      </div>
    );
  }
  const full = limit !== null && (storeLimit?.used ?? 0) >= limit;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { url } = await shopifyApi.connect(shop.trim());
      window.location.assign(url);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="mt-6">
      <label htmlFor="shop-domain" className={labelText}>
        Store address
      </label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          id="shop-domain"
          className={`${field} sm:max-w-[360px]`}
          value={shop}
          onChange={(e) => setShop(e.target.value)}
          placeholder="my-store.myshopify.com"
          autoComplete="off"
          spellCheck={false}
          required
          disabled={full}
        />
        <button type="submit" disabled={busy || full || !shop.trim()} className={primaryBtn}>
          {busy ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Plug className="size-4" aria-hidden />
          )}
          Connect store
        </button>
      </div>
      <p className="mt-2 text-[12.5px] text-studio-muted">
        {full ? (
          <>
            Every store slot on your plan is used.{' '}
            <Link href="/billing" className="text-studio-text underline underline-offset-2">
              Upgrade
            </Link>{' '}
            or disconnect a store first.
          </>
        ) : (
          'You approve the connection in Shopify, then come back here.'
        )}
      </p>
      {error && <p className="mt-2 text-[12.5px] text-danger">{error}</p>}
    </form>
  );
}

const ROUNDING: { value: Rounding; label: string }[] = [
  { value: '.99', label: 'Ends in .99' },
  { value: '.95', label: 'Ends in .95' },
  { value: 'none', label: 'No rounding' },
];

function StoreRow({
  store,
  onChange,
}: {
  store: ShopifyStore;
  onChange: (next: ShopifyStore | null) => void;
}) {
  const [multiplier, setMultiplier] = useState(String(Number(store.multiplier)));
  const [rounding, setRounding] = useState<Rounding>(store.rounding);
  const [compareAt, setCompareAt] = useState(
    store.compare_at_pct === null ? '' : String(Number(store.compare_at_pct)),
  );
  const [state, setState] = useState<'idle' | 'saving' | 'saved' | 'removing'>('idle');
  const [error, setError] = useState<string | null>(null);

  const m = Number(multiplier);
  const pct = compareAt.trim() === '' ? null : Number(compareAt);
  const invalid = !(m > 0)
    ? 'The multiplier is above 0.'
    : pct !== null && !(pct >= 0)
      ? 'Compare-at is 0 or more.'
      : null;
  const dirty =
    m !== Number(store.multiplier) ||
    rounding !== store.rounding ||
    pct !== (store.compare_at_pct === null ? null : Number(store.compare_at_pct));
  const example = m > 0 ? (10 * m).toFixed(2) : null;

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setState('saving');
    setError(null);
    try {
      onChange(
        await shopifyApi.updateStore(store.id, { multiplier, rounding, compare_at_pct: pct }),
      );
      setState('saved');
    } catch (err) {
      setError(errorText(err));
      setState('idle');
    }
  };

  const disconnect = async () => {
    if (
      !window.confirm(
        `Disconnect ${store.shop_domain}? Products already sent stay in Shopify, but TrendED stops syncing them. If you reconnect this store later, sending a product again creates a new copy in Shopify.`,
      )
    )
      return;
    setState('removing');
    try {
      await shopifyApi.disconnect(store.id);
      onChange(null);
    } catch (err) {
      setError(errorText(err));
      setState('idle');
    }
  };

  return (
    <li className="rounded-[10px] bg-studio-raised p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <p className="w-full min-w-0 text-[14px] font-medium break-all text-studio-text sm:w-auto sm:flex-1">
          {store.shop_domain}
        </p>
        <StoreBadge status={store.status} />
      </div>
      <p className="mt-1 text-[12.5px] text-studio-muted">
        Sells in {store.currency ?? 'an unknown currency'} · copy language{' '}
        {store.primary_locale ?? 'not set'}
      </p>

      <form onSubmit={save} className="mt-4">
        <div className="grid grid-cols-2 gap-3 items-end sm:grid-cols-[120px_160px_120px_auto]">
          <label className="block">
            <span className={labelText}>Multiplier</span>
            <input
              className={`${field} tabular-nums`}
              inputMode="decimal"
              value={multiplier}
              onChange={(e) => {
                setMultiplier(e.target.value);
                setState('idle');
              }}
            />
          </label>
          <label className="block">
            <span className={labelText}>Rounding</span>
            <select
              className={`${field} cursor-pointer`}
              value={rounding}
              onChange={(e) => {
                setRounding(e.target.value as Rounding);
                setState('idle');
              }}
            >
              {ROUNDING.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelText}>Compare-at %</span>
            <input
              className={`${field} tabular-nums`}
              inputMode="decimal"
              value={compareAt}
              placeholder="None"
              onChange={(e) => {
                setCompareAt(e.target.value);
                setState('idle');
              }}
            />
          </label>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!dirty || invalid !== null || state === 'saving'}
              className={secondaryBtn}
            >
              {state === 'saving' && <Loader2 className="size-4 animate-spin" aria-hidden />}
              Save rule
            </button>
          </div>
        </div>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12.5px] text-studio-muted" role="status">
            {invalid ??
              (state === 'saved' ? (
                <span className="inline-flex items-center gap-1.5 text-success">
                  <Check className={ic} aria-hidden /> Saved. Sent products are repriced.
                </span>
              ) : (
                example &&
                `A cost of 10.00 sells near ${example} ${store.currency ?? ''} before rounding${pct ? `, compare-at ${pct}% above` : ''}.`
              ))}
            {error && <span className="block text-danger">{error}</span>}
          </p>
          <button
            type="button"
            onClick={disconnect}
            disabled={state === 'removing'}
            className={`${textBtn} -mr-2 text-danger hover:bg-danger-soft`}
          >
            {state === 'removing' ? (
              <Loader2 className="size-4 animate-spin" aria-hidden />
            ) : (
              <Unplug className="size-4" aria-hidden />
            )}
            Disconnect
          </button>
        </div>
      </form>
    </li>
  );
}

function AlertsPanel() {
  const [alerts, setAlerts] = useState<ShopifyAlert[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    shopifyApi.alerts().then(setAlerts, (err) => setError(errorText(err)));
  }, []);

  return (
    <section className={panel} aria-labelledby="alerts-title">
      <h2 id="alerts-title" className="text-[16px] font-semibold text-studio-text">
        Needs attention
      </h2>
      <p className="mt-1 text-[13px] text-studio-muted">
        Products whose last sync failed or that were edited in Shopify too.
      </p>
      <div className="mt-5">
        {error ? (
          <p className="text-[13px] text-danger">Couldn’t load sync alerts. {error}</p>
        ) : !alerts ? (
          <div aria-busy="true" className="h-[52px] rounded-[10px] bg-studio-raised" />
        ) : alerts.length === 0 ? (
          <p className="flex items-center gap-2 text-[13px] text-studio-muted">
            <CheckCircle2 className="size-4 text-success" aria-hidden />
            Every sent product is in sync.
          </p>
        ) : (
          <ul className="divide-y divide-studio-rule">
            {alerts.map((a) => (
              <li
                key={a.listing_id}
                className="flex flex-wrap items-center gap-x-3 gap-y-1 py-3 first:pt-0 last:pb-0"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/products/${a.product_id}`}
                    className="block truncate text-[13.5px] font-medium text-studio-text hover:underline"
                  >
                    {a.product_title}
                  </Link>
                  <p className="mt-0.5 text-[12.5px] break-words text-studio-muted">
                    {a.shop_domain}
                    {a.state === 'error' && a.last_error ? ` · ${a.last_error}` : ''}
                  </p>
                </div>
                {a.state === 'conflict' ? (
                  <Badge tone="warning" icon={<GitCompare className={ic} aria-hidden />}>
                    Conflict
                  </Badge>
                ) : (
                  <Badge tone="danger" icon={<AlertTriangle className={ic} aria-hidden />}>
                    Error
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
