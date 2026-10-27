'use client';

import React from 'react';
import { FlaskConical, Play, RotateCw } from 'lucide-react';
import { Storyboard } from '../../lib/types/creative';
import { AssetBoard as AssetBoardData, SourceMode } from '../../lib/types/assets';
import { boardCostText, boardSummary, launchBlockReason } from '../../lib/asset-rules.mjs';
import { ShotAssetRow, StatusPill, sceneMeta } from './ShotAssetRow';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange';
const primaryClass = `inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-trend-orange px-5 text-sm font-semibold text-white hover:bg-trend-orange-strong disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto ${focusRing}`;

interface Props {
  storyboard: Storyboard;
  board: AssetBoardData | null;
  /** Workflow-level reason the video cannot start (duration mismatch, operation in flight). */
  launchDisabledReason: string | null;
  isLoading: boolean;
  loadError: string | null;
  isPreparing: boolean;
  isLaunching: boolean;
  busyPlanId: string | null;
  liveMessage: string;
  productId: string;
  onPrepare: () => void;
  onReload: () => void;
  onOverride: (planId: string, mode: SourceMode) => Promise<boolean>;
  onRetry: (planId: string) => Promise<void>;
  onLaunchVideo: () => void;
}

/** Step 5: which product image each shot uses, and whether it can be trusted. */
export function AssetBoard({
  storyboard,
  board: boardProp,
  launchDisabledReason,
  isLoading,
  loadError,
  isPreparing,
  isLaunching,
  busyPlanId,
  liveMessage,
  productId,
  onPrepare,
  onReload,
  onOverride,
  onRetry,
  onLaunchVideo,
}: Props) {
  const scenes = [...storyboard.scenes].sort((a, b) => a.scene_order - b.scene_order);
  const noProduct = scenes.every((s) => !s.reference_urls?.length);
  // A board of another storyboard (stale answer) is never shown.
  const board = boardProp?.storyboard_id === storyboard.id ? boardProp : null;
  const launchReason = launchDisabledReason ?? launchBlockReason(board, scenes);
  const summary = board ? boardSummary(board) : null;
  const plans = board ? [...board.plans].sort((a, b) => a.scene_order - b.scene_order) : [];
  // Before the first plan, the only action is to prepare (explicit: it may cost money).
  const needsPrepare = !board && !noProduct && !loadError;
  const showLaunch = !needsPrepare && !loadError && !(isLoading && !board);

  return (
    <section
      aria-labelledby="assets-title"
      className="space-y-5 rounded-2xl border border-line bg-white p-4 sm:p-6"
    >
      {/* A. Title row */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h2 id="assets-title" className="text-xl font-semibold text-ink sm:text-2xl">
            Visuels produit
          </h2>
          <p className="text-sm text-ink-muted tabular-nums">
            {summary
              ? summary.line
              : noProduct
                ? 'Aucun plan ne montre le produit : aucun visuel à préparer.'
                : "Les visuels de ce storyboard n'ont pas encore été préparés."}
          </p>
        </div>
        {needsPrepare && (
          <button
            type="button"
            onClick={onPrepare}
            disabled={isPreparing || isLoading}
            aria-busy={isPreparing}
            className={primaryClass}
          >
            {isPreparing && (
              <RotateCw className="size-4 animate-spin motion-reduce:animate-none" aria-hidden />
            )}
            {isPreparing ? 'Préparation…' : 'Préparer les visuels'}
          </button>
        )}
        {showLaunch && (
          <div className="flex w-full flex-col gap-1.5 sm:w-auto sm:items-end">
            <button
              type="button"
              onClick={onLaunchVideo}
              disabled={launchReason !== null || isLaunching}
              aria-busy={isLaunching}
              aria-describedby={launchReason ? 'launch-reason' : undefined}
              className={primaryClass}
            >
              <Play className="size-4" aria-hidden />
              {isLaunching ? 'Lancement…' : 'Générer la vidéo'}
            </button>
            {launchReason && (
              <p id="launch-reason" className="max-w-64 text-xs text-ink-muted sm:text-right">
                {launchReason}
              </p>
            )}
          </div>
        )}
      </div>

      {/* B. Simulation notice */}
      {board?.is_heuristic && (
        <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden />
          <div className="space-y-1">
            <p className="font-semibold">Traitement simulé</p>
            <p>
              Aucun moteur de traitement d&apos;image n&apos;est branché pour l&apos;instant. Les
              résultats marqués « Simulation » ne sont pas produits par une IA ; la fidélité
              n&apos;est pas évaluée et l&apos;image d&apos;origine reste la référence.
            </p>
          </div>
        </div>
      )}

      {/* C. Summary strip */}
      {board && summary && (
        <dl className="grid grid-cols-2 overflow-hidden rounded-xl border border-line sm:grid-cols-4">
          {(
            [
              ['Plans prêts', `${summary.ready} / ${summary.required}`],
              ['Coût estimé', boardCostText(board, 'total_estimated_usd')],
              ['Coût réel', boardCostText(board, 'total_actual_usd')],
              ['Licences', summary.licences],
            ] as const
          ).map(([label, value], i) => (
            <div
              key={label}
              className={`space-y-0.5 border-line px-4 py-3 ${i % 2 ? 'border-l' : ''} ${
                i >= 2 ? 'border-t sm:border-t-0' : ''
              } ${i === 2 ? 'sm:border-l' : ''}`}
            >
              <dt className="text-xs text-ink-muted">{label}</dt>
              <dd className="text-base font-semibold text-ink tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* D. Shot board */}
      {loadError ? (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-line p-5 text-sm text-ink">
          <p>{loadError}</p>
          <button
            type="button"
            onClick={onReload}
            className={`min-h-11 rounded-lg border border-line px-4 font-semibold hover:bg-zinc-50 ${focusRing}`}
          >
            Réessayer
          </button>
        </div>
      ) : isLoading && !board ? (
        <div role="status" className="space-y-3">
          <span className="sr-only">Chargement des visuels…</span>
          {scenes.map((s) => (
            <div
              key={s.id}
              aria-hidden
              className="flex items-center gap-4 rounded-xl border border-line p-5"
            >
              <div className="h-4 w-20 rounded bg-zinc-100" />
              <div className="size-22 rounded-lg bg-zinc-100" />
              <div className="h-4 flex-1 rounded bg-zinc-100" />
            </div>
          ))}
        </div>
      ) : board ? (
        <ol aria-label="Visuels par plan" className="space-y-4">
          {plans.map((plan) => (
            <ShotAssetRow
              key={plan.id}
              plan={plan}
              busy={busyPlanId === plan.id}
              anyBusy={busyPlanId !== null || isPreparing}
              productId={productId}
              onOverride={onOverride}
              onRetry={onRetry}
            />
          ))}
        </ol>
      ) : (
        <ol aria-label="Visuels par plan" className="space-y-2">
          {scenes.map((s) => (
            <li
              key={s.id}
              className="flex min-h-14 flex-wrap items-center justify-between gap-2 rounded-xl border border-line px-5 py-3 text-sm"
            >
              <div className="flex flex-wrap items-baseline gap-x-2">
                <h3 className="font-semibold text-ink">Plan {s.scene_order}</h3>
                <span className="text-ink-muted">
                  {sceneMeta(s.persuasive_role, s.duration_seconds)}
                </span>
              </div>
              {s.reference_urls?.length ? (
                <StatusPill statusKey="pending" label="En attente" />
              ) : (
                <span className="text-ink-muted">Aucun produit dans ce plan</span>
              )}
            </li>
          ))}
        </ol>
      )}

      <p aria-live="polite" className="sr-only">
        {liveMessage}
      </p>
    </section>
  );
}
