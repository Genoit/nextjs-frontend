'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Check,
  Clock,
  FlaskConical,
  ImageOff,
  Loader2,
  RotateCw,
  ShieldAlert,
} from 'lucide-react';
import { ScenePlan, SourceMode } from '../../lib/types/assets';
import { ROLE_LABELS } from '../../lib/creative-rules.mjs';
import {
  FALLBACK_REASONS,
  assetStatusView,
  decisionLabel,
  fallbackReason,
  fidelityView,
  hasReason,
  isSimulated,
  licenceWarning,
  overrideBlockReason,
  planCostText,
  reasonText,
  usedSource,
} from '../../lib/asset-rules.mjs';
import { useMediaUrl } from '../../hooks/use-assets';
import { SourceModeControl } from './SourceModeControl';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange';

const PILL: Record<string, { className: string; Icon: typeof Check }> = {
  pending: { className: 'border-line bg-zinc-100 text-zinc-700', Icon: Clock },
  processing: { className: 'border-line bg-zinc-100 text-zinc-700', Icon: Loader2 },
  direct: { className: 'border-ink bg-ink text-white', Icon: Check },
  processed: { className: 'border-emerald-200 bg-emerald-50 text-emerald-800', Icon: Check },
  simulated: { className: 'border-amber-300 bg-amber-100 text-amber-900', Icon: FlaskConical },
  fallback: { className: 'border-amber-300 bg-amber-100 text-amber-900', Icon: ShieldAlert },
  failed: { className: 'border-red-200 bg-red-50 text-red-800', Icon: AlertTriangle },
  missing_original: { className: 'border-red-200 bg-red-50 text-red-800', Icon: ImageOff },
  unverified: { className: 'border-line bg-zinc-100 text-zinc-700', Icon: ShieldAlert },
};

const LICENCE_LABELS: Record<string, string> = {
  commercial: 'commerciale',
  non_commercial: 'non commerciale',
  unknown: 'inconnue',
  internal: 'interne (simulation)',
};

export function sceneMeta(role: string | null | undefined, duration: number | string) {
  const label = (role && (ROLE_LABELS as Record<string, string>)[role]) || 'Plan';
  const seconds = Number(duration);
  const d = Number.isFinite(seconds) ? `${seconds.toFixed(1).replace('.', ',')} s` : '';
  return [label, d].filter(Boolean).join(' · ');
}

export function StatusPill({ statusKey, label }: { statusKey: string; label: string }) {
  const { className, Icon } = PILL[statusKey] ?? PILL.unverified;
  const spinning = statusKey === 'processing';
  return (
    <span
      className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold ${className}`}
    >
      {spinning ? (
        <>
          <Loader2 className="size-3.5 animate-spin motion-reduce:hidden" aria-hidden />
          <Clock className="hidden size-3.5 motion-reduce:inline" aria-hidden />
        </>
      ) : (
        <Icon className="size-3.5" aria-hidden />
      )}
      {label}
    </span>
  );
}

interface ThumbProps {
  url: string | null;
  failed: boolean;
  loading: boolean;
  alt: string;
  caption: string;
  used: boolean;
  overlay?: string;
  size: 'row' | 'compare';
}

/** One product image: grey block while loading, dashed box when there is none. */
function Thumb({ url, failed, loading, alt, caption, used, overlay, size }: ThumbProps) {
  const box =
    size === 'row'
      ? 'aspect-square w-full max-w-40 xl:size-22 xl:max-w-none'
      : 'aspect-square w-full max-w-80';
  return (
    <figure className="min-w-0 flex-1 space-y-1.5 xl:flex-none">
      <div
        className={`relative overflow-hidden rounded-lg ${box} ${
          used ? 'ring-2 ring-ink ring-offset-2' : ''
        } ${url ? 'bg-cream' : loading ? 'bg-zinc-100' : 'border border-dashed border-line'}`}
      >
        {url ? (
          // Blob URL of an authenticated asset: next/image cannot optimise it.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={alt} className="size-full object-contain" />
        ) : (
          <span className="flex size-full items-center justify-center text-sm text-ink-muted">
            <span aria-hidden>{loading ? '' : '—'}</span>
            <span className="sr-only">
              {loading
                ? `${alt} : chargement`
                : failed
                  ? `${alt} : image indisponible`
                  : 'Pas encore de résultat'}
            </span>
          </span>
        )}
        {overlay && (
          <span className="absolute bottom-1 left-1 rounded bg-ink px-1.5 py-0.5 text-[11px] font-semibold text-white">
            {overlay}
          </span>
        )}
      </div>
      <figcaption className="text-xs text-ink-muted">
        {caption}
        {used && <span className="font-semibold text-ink"> · Utilisée</span>}
      </figcaption>
    </figure>
  );
}

interface Props {
  plan: ScenePlan;
  busy: boolean;
  anyBusy: boolean;
  productId: string;
  onOverride: (planId: string, mode: SourceMode) => Promise<boolean>;
  onRetry: (planId: string) => Promise<void>;
}

export function ShotAssetRow({ plan, busy, anyBusy, productId, onOverride, onRetry }: Props) {
  const [comparing, setComparing] = useState(false);
  const original = useMediaUrl(plan.source_asset_id);
  const result = useMediaUrl(plan.result_asset_id);

  const n = plan.scene_order;
  const status = assetStatusView(plan);
  const used = usedSource(plan);
  const simulated = plan.status === 'completed' && isSimulated(plan);
  const rejected = !!plan.result_asset_id && used !== 'processed';
  const fidelity = fidelityView(plan);
  const licence = licenceWarning(plan);
  const fbReason = fallbackReason(plan);
  // Another row's save only pauses this control (busy); it does not print a reason here.
  const blockReason = overrideBlockReason(plan);
  const cmpId = `cmp-${plan.id}`;
  const meta = sceneMeta(plan.persuasive_role, plan.duration_seconds);

  if (status.key === 'not_required') {
    return (
      <li className="flex min-h-14 flex-wrap items-center gap-x-2 rounded-xl border border-line bg-zinc-50 px-5 py-3 text-sm text-ink-muted">
        <h3 className="font-semibold text-ink">Plan {n}</h3>
        <span aria-hidden>·</span>
        <span>{reasonText('no_product_reference')}</span>
      </li>
    );
  }

  const missing = status.key === 'missing_original';
  const resultAlt = `Plan ${n} — résultat du traitement${
    simulated ? ' (simulé)' : rejected ? ' (rejeté)' : ''
  }`;
  const thumbs = (size: 'row' | 'compare') => ({
    original: {
      ...original,
      loading: !!plan.source_asset_id && !original.url && !original.failed,
      alt: `Plan ${n} — image d'origine du produit`,
      used: size === 'row' && used === 'original',
      size,
    },
    result: {
      ...result,
      loading:
        plan.status === 'processing' || (!!plan.result_asset_id && !result.url && !result.failed),
      alt: resultAlt,
      used: size === 'row' && used === 'processed',
      overlay: simulated ? 'Simulation' : rejected ? 'Rejeté' : undefined,
      size,
    },
  });
  const rowThumbs = thumbs('row');
  const cmpThumbs = thumbs('compare');

  const reasonLine = (() => {
    if (fbReason && (plan.status === 'fallback' || plan.status === 'unknown')) {
      return reasonText(fbReason, FALLBACK_REASONS);
    }
    if (plan.status === 'failed') {
      return plan.error ?? reasonText('engine_error', FALLBACK_REASONS);
    }
    const code = plan.reasons.find((r) => r !== 'low_resolution');
    return code ? reasonText(code) : null;
  })();

  const provenance = (
    <dl className="space-y-1 text-xs">
      {(
        [
          ['Source :', used === 'processed' ? 'image traitée' : missing ? '—' : "image d'origine"],
          [
            'Moteur :',
            plan.provider
              ? `${plan.model ?? plan.provider}${isSimulated(plan) ? ' (simulation)' : ''}`
              : "aucun (image d'origine)",
          ],
          ['Coût estimé :', planCostText(plan, 'estimated_cost_usd')],
          ['Coût réel :', planCostText(plan, 'actual_cost_usd')],
          ['Licence :', plan.licence ? LICENCE_LABELS[plan.licence] : '—'],
        ] as const
      ).map(([dt, dd]) => (
        <div key={dt} className="flex gap-1.5">
          <dt className="shrink-0 text-ink-muted">{dt}</dt>
          <dd className="min-w-0 font-semibold break-words text-ink tabular-nums">{dd}</dd>
        </div>
      ))}
    </dl>
  );

  return (
    <li className="rounded-xl border border-line bg-white p-5">
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[120px_196px_minmax(0,1fr)_200px_208px]">
        {/* Identity */}
        <div className="flex items-start justify-between gap-3 xl:block xl:space-y-0.5">
          <div>
            <h3 className="text-base font-semibold text-ink">Plan {n}</h3>
            <p className="text-sm text-ink-muted">{meta}</p>
          </div>
          <div className="xl:hidden">
            <StatusPill statusKey={status.key} label={status.label} />
          </div>
        </div>

        {/* Images */}
        <div className="flex items-start gap-3 xl:gap-2">
          <Thumb {...rowThumbs.original} caption="Origine" />
          {!missing && status.key !== 'direct' && (
            <>
              <ArrowRight
                className="mt-9 hidden size-4 shrink-0 text-ink-muted xl:block"
                aria-hidden
              />
              <Thumb {...rowThumbs.result} caption="Résultat" />
            </>
          )}
        </div>

        {/* Decision + fidelity */}
        <div className="min-w-0 space-y-2">
          <p className="text-sm font-semibold text-ink">{decisionLabel(plan)}</p>
          <div className="hidden xl:block">
            <StatusPill statusKey={status.key} label={status.label} />
          </div>
          {reasonLine && <p className="text-sm text-ink">{reasonLine}</p>}
          {hasReason(plan, 'low_resolution') && (
            <p className="flex items-start gap-1.5 text-sm text-amber-900">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {reasonText('low_resolution')}
            </p>
          )}
          {fidelity && (
            <p
              className={`flex items-start gap-1.5 text-sm tabular-nums ${
                fidelity.tone === 'ok'
                  ? 'text-emerald-800'
                  : fidelity.tone === 'warn'
                    ? 'text-amber-900'
                    : 'text-ink-muted'
              }`}
            >
              {fidelity.tone === 'ok' && <Check className="mt-0.5 size-4 shrink-0" aria-hidden />}
              {fidelity.tone === 'warn' && (
                <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              )}
              {fidelity.label}
            </p>
          )}
          {licence && (
            <p className="flex items-start gap-1.5 text-sm font-semibold text-red-800">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {licence}
            </p>
          )}
        </div>

        {/* Provenance (desktop column) */}
        <div className="hidden xl:block">{provenance}</div>

        {/* Actions */}
        <div className="space-y-3">
          {missing ? (
            <Link
              href={`/products/${productId}/edit`}
              className={`inline-flex min-h-11 items-center rounded-lg font-semibold text-trend-orange hover:text-trend-orange-strong ${focusRing}`}
            >
              Ajouter une image produit
            </Link>
          ) : (
            <>
              <SourceModeControl
                name={`source-${plan.id}`}
                value={plan.source_mode}
                disabledReason={blockReason}
                busy={anyBusy}
                estimatedCost={plan.estimated_cost_usd}
                simulated={!!plan.provider && isSimulated(plan)}
                onChange={(mode) => onOverride(plan.id, mode)}
              />
              {(plan.status === 'failed' || plan.status === 'unknown') && (
                <button
                  type="button"
                  onClick={() => onRetry(plan.id)}
                  disabled={anyBusy}
                  aria-busy={busy}
                  className={`inline-flex min-h-11 items-center gap-2 rounded-lg border border-line px-3 text-sm font-semibold text-ink hover:bg-zinc-50 disabled:opacity-60 ${focusRing}`}
                >
                  <RotateCw
                    className={`size-4 ${busy ? 'animate-spin motion-reduce:animate-none' : ''}`}
                    aria-hidden
                  />
                  Réessayer le traitement
                </button>
              )}
              <button
                type="button"
                onClick={() => setComparing((v) => !v)}
                aria-expanded={comparing}
                aria-controls={cmpId}
                className={`-mx-2 inline-flex min-h-11 items-center rounded-lg px-2 text-sm font-semibold text-trend-orange hover:text-trend-orange-strong ${focusRing}`}
              >
                {comparing ? 'Masquer la comparaison' : 'Comparer'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Provenance (phone/tablet: collapsed) */}
      <details className="mt-4 xl:hidden">
        <summary
          className={`inline-flex min-h-11 cursor-pointer items-center rounded-lg text-sm font-semibold text-ink ${focusRing}`}
        >
          Provenance et coût
        </summary>
        <div className="pt-1">{provenance}</div>
      </details>

      <div id={cmpId} hidden={!comparing} className="mt-4 border-t border-line pt-4">
        {comparing &&
          (plan.result_asset_id ? (
            <div className="space-y-3">
              <div className="flex flex-col gap-4 sm:flex-row">
                <Thumb {...cmpThumbs.original} caption="Avant (origine)" />
                <Thumb {...cmpThumbs.result} caption="Après (traitement)" />
              </div>
              {fidelity && <p className="text-sm text-ink tabular-nums">{fidelity.label}</p>}
            </div>
          ) : (
            <p className="text-sm text-ink-muted">Aucun résultat de traitement à comparer.</p>
          ))}
      </div>
    </li>
  );
}
