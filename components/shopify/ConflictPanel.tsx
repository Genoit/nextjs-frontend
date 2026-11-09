'use client';

import { useState } from 'react';
import { AlertTriangle, Info, Loader2 } from 'lucide-react';
import {
  shopifyApi,
  shopifyErrorCode,
  type ResolveChoice,
  type ShopifyListing,
} from '../../lib/api/shopify';
import { conflictChoices, diffLabel, shopifyErrorText } from '../../lib/shopify-rules.mjs';
import { Notice, secondaryBtn } from './ui';

/** A diff value as one readable line: HTML stripped, lists joined, missing as a dash. */
function show(v: unknown): string {
  if (v === null || v === undefined || v === '') return '—';
  if (Array.isArray(v)) return v.map(show).join(', ');
  if (typeof v === 'object') {
    return Object.entries(v as Record<string, unknown>)
      .map(([k, x]) => `${k}: ${show(x)}`)
      .join(' · ');
  }
  const text = String(v)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.length > 180 ? `${text.slice(0, 177)}…` : text || '—';
}

const SIDE: Record<ResolveChoice, string> = { trended: 'Keep TrendED', shopify: 'Keep Shopify' };

/**
 * Field-by-field choice for a listing edited on both sides. Options can only keep TrendED;
 * variants added in Shopify are shown for information and left alone.
 */
export function ConflictPanel({
  listing,
  variantName,
  onResolved,
  onStale,
}: {
  listing: ShopifyListing;
  variantName: (key: string) => string;
  onResolved: (next: ShopifyListing) => void;
  /** Shopify changed since these diffs were read: reload them. */
  onStale: () => void;
}) {
  const fields = listing.diffs.filter((d) => conflictChoices(d.field).length > 0);
  const added = listing.diffs.filter((d) => conflictChoices(d.field).length === 0);
  const [picked, setPicked] = useState<Record<string, ResolveChoice>>(() =>
    Object.fromEntries(
      fields.filter((d) => conflictChoices(d.field).length === 1).map((d) => [d.field, 'trended']),
    ),
  );
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const missing = fields.filter((d) => !picked[d.field]).length;

  // A price with no Shopify value means the variant was deleted there (422 variant_missing_in_shopify);
  // a missing compare-at or description is a real value and stays choosable.
  const gone = (d: { field: string; shopify: unknown }) =>
    d.field.startsWith('price:') && d.shopify == null;

  const label = (field: string) => {
    const i = field.indexOf(':');
    return i < 0
      ? diffLabel(field)
      : diffLabel(`${field.slice(0, i)}:${variantName(field.slice(i + 1))}`);
  };

  const apply = async () => {
    setBusy(true);
    setError(null);
    try {
      onResolved(await shopifyApi.resolve(listing.id, picked));
    } catch (err) {
      const code = shopifyErrorCode(err);
      setError(shopifyErrorText(code));
      setBusy(false);
      if (code === 'missing_choices' || code === 'not_in_conflict') onStale();
    }
  };

  return (
    <section
      aria-label={`Conflict on ${listing.shop_domain}`}
      className="rounded-[12px] border border-studio-rule bg-studio-raised p-4 sm:p-5"
    >
      <div className="flex items-start gap-2.5">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" aria-hidden />
        <div className="min-w-0">
          <h3 className="text-[14px] font-semibold text-studio-text">
            Edited in Shopify and in TrendED
          </h3>
          <p className="mt-0.5 text-[12.5px] break-words text-studio-muted">
            {listing.shop_domain} changed since the last send. Choose which version each field
            keeps.
          </p>
        </div>
      </div>

      {listing.diffs.length === 0 && (
        <p className="mt-4 text-[13px] text-studio-muted">
          Shopify could not be reached to show the differences. Reload the page in a minute.
        </p>
      )}

      <div className="mt-4 space-y-4">
        {fields.map((d) => {
          const sides = conflictChoices(d.field);
          return (
            <fieldset key={d.field}>
              <legend className="mb-2 text-[13px] font-medium text-studio-text">
                {label(d.field)}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {(['trended', 'shopify'] as const).map((side) => {
                  const allowed = sides.includes(side) && !(side === 'shopify' && gone(d));
                  const on = picked[d.field] === side;
                  return (
                    <label
                      key={side}
                      className={`flex min-w-0 gap-2.5 rounded-[10px] border p-3 transition has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ember-text ${
                        !allowed
                          ? 'cursor-not-allowed border-studio-rule text-studio-meta'
                          : on
                            ? 'cursor-pointer border-studio-muted bg-studio-raised-2'
                            : 'cursor-pointer border-studio-rule-strong hover:bg-studio-raised-2'
                      }`}
                    >
                      <input
                        type="radio"
                        name={`${listing.id}-${d.field}`}
                        checked={on}
                        disabled={!allowed}
                        onChange={() => setPicked((p) => ({ ...p, [d.field]: side }))}
                        className="sr-only"
                      />
                      <span
                        aria-hidden
                        className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${
                          on ? 'border-studio-text' : 'border-studio-rule-strong'
                        }`}
                      >
                        {on && <span className="size-2 rounded-full bg-studio-text" />}
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[12.5px] font-medium text-studio-text">
                          {SIDE[side]}
                        </span>
                        <span className="mt-0.5 block text-[12.5px] break-words text-studio-muted">
                          {allowed
                            ? show(side === 'trended' ? d.trended : d.shopify)
                            : gone(d)
                              ? 'Deleted in Shopify.'
                              : 'Shopify’s options cannot be kept yet.'}
                        </span>
                      </span>
                    </label>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

        {added.map((d) => (
          <p key={d.field} className="flex items-start gap-2 text-[12.5px] text-studio-muted">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            <span className="min-w-0 break-words">
              {diffLabel(d.field)}: {show(d.shopify)}. Left as it is in Shopify.
            </span>
          </p>
        ))}
      </div>

      {fields.length > 0 && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={apply}
            disabled={busy || missing > 0}
            className={secondaryBtn}
          >
            {busy && <Loader2 className="size-4 animate-spin" aria-hidden />}
            Apply and sync
          </button>
          {missing > 0 && (
            <span className="text-[12.5px] text-studio-muted">
              Choose a version for {missing} more field{missing === 1 ? '' : 's'}.
            </span>
          )}
        </div>
      )}
      {error && (
        <div className="mt-3">
          <Notice tone="danger" icon={<AlertTriangle className="size-3.5" aria-hidden />}>
            {error}
          </Notice>
        </div>
      )}
    </section>
  );
}
