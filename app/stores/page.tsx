'use client';

import { useCallback, useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import Link from 'next/link';
import { Loader2, Pause, Play, Plus, Trash2 } from 'lucide-react';
import { storesApi, type StoreOut } from '../../lib/api/stores';
import { countLabel, isSettling, readAgo, storeState } from '../../lib/stores-rules.mjs';
import { field } from '../../components/ads/AdFilters';
import { EmptyState, Monogram } from '../../components/ads/AdvertiserRow';
import { focusRing } from '../../components/dashboard/DashShell';
import { primaryBtn } from '../../components/shopify/ui';
import { StateBadge, StoresError, listBox } from '../../components/stores/StoreUi';

const POLL_MS = 4000;
const POLL_MAX = 45; // three minutes, then the user reloads

const iconBtn = `inline-flex size-[34px] shrink-0 items-center justify-center rounded-[10px] border border-dash-edge text-dash-soft transition hover:border-dash-edge-hover hover:text-white active:scale-[0.96] disabled:cursor-wait ${focusRing}`;

function StoreRow({ store, onChanged }: { store: StoreOut; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const [error, setError] = useState<unknown>(null);
  const name = store.title || store.domain;
  const state = storeState(store.status, store.paused);

  const run = async (action: () => Promise<unknown>) => {
    setBusy(true);
    setError(null);
    try {
      await action();
      onChanged();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
      setConfirm(false);
    }
  };

  return (
    <li className="px-4 py-3.5">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <Monogram name={name} />
        <div className="min-w-0 flex-1 basis-[200px]">
          <Link
            href={`/stores/${store.id}`}
            className={`block truncate rounded text-[14px] font-semibold text-white hover:underline ${focusRing}`}
          >
            {name}
          </Link>
          <p className="mt-0.5 truncate text-[12.5px] text-studio-muted">
            {store.domain}
            {store.status === 'ok' && (
              <>
                {' · '}
                {countLabel(store.product_count, 'product', 'products')}
                {' · '}
                {readAgo(store.last_fetched_at)}
              </>
            )}
          </p>
        </div>
        {store.changes_7d > 0 && (
          <p className="text-[13px] font-medium text-ember-text tabular-nums">
            {countLabel(store.changes_7d, 'change', 'changes')} this week
          </p>
        )}
        <StateBadge store={store} />
        <div className="flex items-center gap-2">
          {confirm ? (
            <>
              <span className="text-[13px] text-dash-soft">Stop following?</span>
              <button
                type="button"
                disabled={busy}
                onClick={() => run(() => storesApi.unfollow(store.id))}
                className={`h-[34px] rounded-[10px] border border-danger/50 px-3 text-[13px] font-medium text-danger transition hover:bg-danger-soft ${focusRing}`}
              >
                Yes, stop
              </button>
              <button
                type="button"
                onClick={() => setConfirm(false)}
                className={`h-[34px] rounded-[10px] px-2 text-[13px] text-dash-soft hover:text-white ${focusRing}`}
              >
                Keep
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={busy}
                aria-label={`${store.paused ? 'Resume' : 'Pause'} ${name}`}
                title={store.paused ? 'Resume' : 'Pause'}
                onClick={() =>
                  run(() => (store.paused ? storesApi.resume(store.id) : storesApi.pause(store.id)))
                }
                className={iconBtn}
              >
                {busy ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden />
                ) : store.paused ? (
                  <Play className="size-4" aria-hidden />
                ) : (
                  <Pause className="size-4" aria-hidden />
                )}
              </button>
              <button
                type="button"
                aria-label={`Stop following ${name}`}
                title="Stop following"
                onClick={() => setConfirm(true)}
                className={iconBtn}
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </>
          )}
        </div>
      </div>
      {state.hint && (
        <p className="mt-2 max-w-[70ch] text-[12.5px] text-studio-muted sm:pl-14">{state.hint}</p>
      )}
      {error != null && <StoresError error={error} className="mt-2 sm:pl-14" />}
    </li>
  );
}

export default function StoresPage() {
  const [stores, setStores] = useState<StoreOut[] | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [url, setUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<unknown>(null);
  const [polls, setPolls] = useState(0);

  const load = useCallback(
    () =>
      storesApi.list().then(
        (list) => {
          setStores(list);
          setError(null);
        },
        (e) => setError(e),
      ),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  // A first reading runs in the background: refresh until it lands.
  const settling = stores?.some(isSettling) ?? false;
  useEffect(() => {
    if (!settling || polls >= POLL_MAX) return;
    const timer = setTimeout(() => {
      setPolls((n) => n + 1);
      void load();
    }, POLL_MS);
    return () => clearTimeout(timer);
  }, [settling, polls, load, stores]);

  const add = async (e: FormEvent) => {
    e.preventDefault();
    const value = url.trim();
    if (!value || adding) return;
    setAdding(true);
    setAddError(null);
    try {
      await storesApi.follow(value);
      setUrl('');
      setPolls(0);
      await load();
    } catch (err) {
      setAddError(err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
      <form onSubmit={add} className="flex max-w-[640px] flex-col gap-2 sm:flex-row">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Store address</span>
          <input
            type="text"
            inputMode="url"
            autoComplete="off"
            spellCheck={false}
            value={url}
            maxLength={500}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Store address, like acme.com"
            aria-invalid={addError != null}
            className={field}
          />
        </label>
        <button type="submit" disabled={adding || !url.trim()} className={primaryBtn}>
          {adding ? (
            <Loader2 className="size-4 animate-spin" aria-hidden />
          ) : (
            <Plus className="size-4" aria-hidden />
          )}
          Follow store
        </button>
      </form>
      {addError != null && <StoresError error={addError} className="mt-2" />}

      <div className="mt-6">
        {error && !stores ? (
          <StoresError error={error} />
        ) : !stores ? (
          <div className="h-[240px] animate-pulse rounded-[14px] bg-dash-panel" aria-busy="true" />
        ) : stores.length === 0 ? (
          <EmptyState title="You don't follow any store yet">
            <p>
              Paste the address of a competitor&apos;s Shopify store above. Its products today
              become your starting point.
            </p>
            <p>
              From then on you see each new product, price change, discount and app it adds, with
              the date. You also get an alert in the app and by e-mail.
            </p>
          </EmptyState>
        ) : (
          <ul className={listBox}>
            {stores.map((s) => (
              <StoreRow key={s.id} store={s} onChanged={load} />
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
