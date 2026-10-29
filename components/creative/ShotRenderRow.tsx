'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Ban,
  Check,
  CircleSlash,
  Clock,
  Eye,
  Hand,
  HelpCircle,
  Loader2,
  RotateCw,
  X,
} from 'lucide-react';
import { QualityCheck, RenderAttempt, ShotQuality, ShotRender } from '../../lib/types/creative';
import { formatCost } from '../../lib/creative-rules.mjs';
import {
  durationText,
  isMock,
  CHECK_STATUS_LABELS,
  checkLabel,
  isPossiblyBilled,
  measuredText,
  possiblyBilledText,
  qualityView,
  routeReasonText,
  shotAction,
  shotStatusView,
  shotTitle,
  successRateText,
} from '../../lib/render-rules.mjs';
import { useMediaUrl } from '../../hooks/use-assets';
import { HeuristicBadge } from './CreativeStatus';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange';
const secondaryClass = `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-zinc-50 disabled:opacity-60 ${focusRing}`;
const primaryClass = `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-trend-orange px-4 text-sm font-semibold text-white hover:bg-trend-orange-strong disabled:opacity-60 ${focusRing}`;
const summaryClass = `inline-flex min-h-11 cursor-pointer items-center rounded-lg text-sm font-semibold text-ink ${focusRing}`;

const PILL: Record<string, { className: string; Icon: typeof Check }> = {
  pending: { className: 'border-line bg-zinc-100 text-zinc-700', Icon: Clock },
  routing: { className: 'border-line bg-zinc-100 text-zinc-700', Icon: Loader2 },
  rendering: { className: 'border-line bg-cream text-ink', Icon: Loader2 },
  checking: { className: 'border-line bg-cream text-ink', Icon: Loader2 },
  quality_review: { className: 'border-amber-300 bg-amber-100 text-amber-900', Icon: Eye },
  completed: { className: 'border-emerald-200 bg-emerald-50 text-emerald-800', Icon: Check },
  failed: { className: 'border-red-200 bg-red-50 text-red-800', Icon: AlertTriangle },
  blocked: { className: 'border-red-200 bg-red-50 text-red-800', Icon: Ban },
  needs_action: { className: 'border-amber-300 bg-amber-100 text-amber-900', Icon: Hand },
  cancelled: { className: 'border-line bg-zinc-100 text-zinc-700', Icon: CircleSlash },
  unknown: { className: 'border-line bg-zinc-100 text-zinc-700', Icon: HelpCircle },
};

const ATTEMPT_STATUS: Record<string, string> = {
  pending: 'en attente',
  submitted: 'envoyé',
  running: 'en cours',
  rendering: 'en cours',
  completed: 'terminé',
  failed: 'échec',
  unknown: 'issue inconnue',
  cancelled: 'annulé',
  rejected: 'refusé',
};

function ShotPill({ statusKey, label }: { statusKey: string; label: string }) {
  const { className, Icon } = PILL[statusKey] ?? PILL.unknown;
  const spinning = statusKey === 'routing' || statusKey === 'rendering' || statusKey === 'checking';
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

/** Authenticated clip, fetched only once the disclosure is opened. */
function ClipPreview({
  assetId,
  title,
  simulated,
}: {
  assetId: string;
  title: string;
  simulated: boolean;
}) {
  const { url, failed } = useMediaUrl(assetId);
  if (failed) return <p className="text-sm text-ink-muted">Clip indisponible.</p>;
  if (!url) {
    return (
      <p className="text-sm text-ink-muted" role="status">
        Chargement du clip…
      </p>
    );
  }
  return (
    <figure className="space-y-1.5">
      <div className="relative w-fit overflow-hidden rounded-lg bg-black">
        <video
          src={url}
          controls
          muted
          playsInline
          preload="metadata"
          aria-label={`${title} — clip rendu${simulated ? ' (simulation)' : ''}`}
          className="max-h-80 w-auto"
        />
        {simulated && (
          <span className="absolute top-1 left-1 rounded bg-ink px-1.5 py-0.5 text-[11px] font-semibold text-white">
            Simulation
          </span>
        )}
      </div>
      <figcaption className="text-xs text-ink-muted">
        {simulated ? 'Clip de simulation, pas une génération IA.' : 'Clip rendu pour ce plan.'}
      </figcaption>
    </figure>
  );
}

function RoutingDetails({ shot }: { shot: ShotRender }) {
  const routing = shot.routing;
  if (!routing) return null;
  return (
    <details className="group">
      <summary className={summaryClass}>Pourquoi ce moteur ?</summary>
      <div className="space-y-3 pt-1">
        <p className="text-sm text-ink">
          {routing.summary || routeReasonText(routing.reason_code)}
        </p>
        {routing.candidates.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Moteurs évalués pour {shotTitle(shot)}</caption>
              <thead className="text-xs text-ink-muted">
                <tr className="border-b border-line">
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Moteur
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Éligible
                  </th>
                  <th scope="col" className="py-2 pr-3 font-semibold">
                    Raison du rejet
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Score
                  </th>
                  <th scope="col" className="py-2 pr-3 text-right font-semibold">
                    Taux de réussite
                  </th>
                  <th scope="col" className="py-2 text-right font-semibold">
                    Coût estimé
                  </th>
                </tr>
              </thead>
              <tbody>
                {routing.candidates.map((c) => {
                  const chosen = c.provider === shot.provider && c.model === shot.model;
                  return (
                    <tr
                      key={`${c.provider}/${c.model}`}
                      className="border-b border-line last:border-0"
                    >
                      <th scope="row" className="py-2 pr-3 font-semibold text-ink">
                        {c.display_name || c.model || c.provider}
                        {chosen && <span className="font-normal text-ink-muted"> (choisi)</span>}
                      </th>
                      <td className="py-2 pr-3">
                        <span className="inline-flex items-center gap-1">
                          {c.eligible ? (
                            <Check className="size-3.5 text-emerald-800" aria-hidden />
                          ) : (
                            <X className="size-3.5 text-red-800" aria-hidden />
                          )}
                          {c.eligible ? 'Oui' : 'Non'}
                        </span>
                      </td>
                      <td className="py-2 pr-3 text-ink">
                        {c.eligible ? '—' : routeReasonText(c.rejected_reason)}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {typeof c.score === 'number' ? c.score.toFixed(2).replace('.', ',') : '—'}
                      </td>
                      <td className="py-2 pr-3 text-right tabular-nums">
                        {successRateText(c.success_rate, c.sample_size)}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {formatCost(c.est_cost_usd, false)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </details>
  );
}

function AttemptItem({ attempt, simulated }: { attempt: RenderAttempt; simulated: boolean }) {
  const billed = isPossiblyBilled(attempt);
  return (
    <li className="space-y-1 rounded-lg bg-zinc-50 p-3 text-sm">
      <p className="font-semibold text-ink">
        Essai {attempt.attempt_no} · {attempt.model || attempt.provider} ·{' '}
        {ATTEMPT_STATUS[attempt.status] ?? attempt.status}
      </p>
      <p className="text-ink-muted tabular-nums">
        Coût estimé {formatCost(attempt.estimated_cost_usd, simulated)} · réel{' '}
        {formatCost(attempt.actual_cost_usd, simulated)}
      </p>
      {attempt.error_text && <p className="text-red-800">{attempt.error_text}</p>}
      {billed && (
        <p className="flex items-start gap-1.5 font-semibold text-amber-900">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          Possiblement facturé : le fournisseur n&apos;a pas confirmé l&apos;issue de cet essai.
        </p>
      )}
    </li>
  );
}

const CHECK_TONE: Record<string, string> = {
  fail: 'text-red-800',
  warn: 'text-amber-900',
  unavailable: 'text-amber-900',
};

/** One check line (module 5 shots, module 6 final report); `label` overrides the name. */
export function CheckItem({
  check,
  label,
}: {
  check: Omit<QualityCheck, 'layer'>;
  label?: string;
}) {
  const measured = measuredText(check);
  const statusLabel = (CHECK_STATUS_LABELS as Record<string, string>)[check.status] ?? check.status;
  return (
    <li className="space-y-0.5">
      <p className="font-semibold text-ink">
        {label ?? checkLabel(check.name)} ·{' '}
        <span className={CHECK_TONE[check.status] ?? 'text-ink-muted'}>{statusLabel}</span>
        {check.blocking && check.status === 'fail' && (
          <span className="font-normal text-ink-muted"> (bloquant)</span>
        )}
      </p>
      {check.detail && <p className="text-ink">{check.detail}</p>}
      {measured && <p className="text-ink-muted tabular-nums">{measured}</p>}
    </li>
  );
}

/** Per-check quality report of the shot's result attempt (module 5). */
function QualityPanel({ quality }: { quality: ShotQuality }) {
  const view = qualityView(quality);
  if (!view) return null;
  const tone =
    view.decision === 'accept'
      ? 'border-emerald-200 bg-emerald-50'
      : view.decision === 'regenerate'
        ? 'border-red-200 bg-red-50'
        : 'border-amber-300 bg-amber-50';
  return (
    <section
      aria-label="Contrôle qualité"
      className={`space-y-2 rounded-lg border p-3 text-sm ${tone}`}
    >
      <p className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-ink">Contrôle qualité : {view.decisionLabel}</span>
        {view.simulated && (
          <span className="rounded bg-ink px-1.5 py-0.5 text-[11px] font-semibold text-white">
            Rendu simulé
          </span>
        )}
      </p>
      {view.overridden && <p className="text-ink">Accepté manuellement malgré les contrôles.</p>}
      {view.issues.length > 0 && (
        <ul className="space-y-2">
          {view.issues.map((c) => (
            <CheckItem key={`${c.layer}-${c.name}`} check={c} />
          ))}
        </ul>
      )}
      {view.others.length > 0 && (
        <details>
          <summary className={summaryClass}>
            {view.passedCount} contrôle{view.passedCount > 1 ? 's' : ''} réussi
            {view.passedCount > 1 ? 's' : ''}
            {view.others.length > view.passedCount &&
              ` · ${view.others.length - view.passedCount} ignoré${view.others.length - view.passedCount > 1 ? 's' : ''}`}
          </summary>
          <ul className="space-y-2 pt-1">
            {view.others.map((c) => (
              <CheckItem key={`${c.layer}-${c.name}`} check={c} />
            ))}
          </ul>
        </details>
      )}
      {view.uncalibrated && (
        <p className="text-xs text-ink-muted">
          Seuils non calibrés : ces contrôles peuvent se tromper.
        </p>
      )}
    </section>
  );
}

type ConfirmKind = 'rerender' | 'accept';

interface Props {
  shot: ShotRender;
  jobStatus: string;
  onRerender: (shotId: string) => Promise<boolean>;
  /** Accept a quality_review shot despite its checks. */
  onAccept: (shotId: string) => Promise<boolean>;
  onRetryJob?: () => void;
}

export function ShotRenderRow({ shot, jobStatus, onRerender, onAccept, onRetryJob }: Props) {
  const [confirming, setConfirming] = useState<ConfirmKind | null>(null);
  const [busy, setBusy] = useState(false);
  const [clipOpen, setClipOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const triggerRefs = useRef<Partial<Record<ConfirmKind, HTMLButtonElement | null>>>({});

  const title = shotTitle(shot);
  const status = shotStatusView(shot);
  const mock = isMock(shot);
  const engineChosen = !!(shot.provider || shot.model || shot.display_name);
  const action = shotAction(shot, jobStatus);
  const duration = durationText(shot);
  const confirmId = `rerender-${shot.shot_id}`;
  const review = shot.status === 'quality_review';

  // Focus follows the inline confirmation in and back out.
  const wasConfirming = useRef<ConfirmKind | null>(null);
  const done = useRef(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  useEffect(() => {
    if (confirming) cancelRef.current?.focus();
    else if (wasConfirming.current) {
      // After a confirmed action the confirm block is gone: land on the row heading.
      (done.current ? headingRef.current : triggerRefs.current[wasConfirming.current])?.focus();
      done.current = false;
    }
    wasConfirming.current = confirming;
  }, [confirming]);

  const confirm = async (kind: ConfirmKind) => {
    setBusy(true);
    const ok = await (kind === 'accept' ? onAccept : onRerender)(shot.shot_id);
    setBusy(false);
    if (ok) {
      done.current = true;
      setConfirming(null);
    }
  };

  const cancelButton = (
    <button
      ref={cancelRef}
      type="button"
      onClick={() => setConfirming(null)}
      disabled={busy}
      className={secondaryClass}
    >
      Annuler
    </button>
  );
  const rerenderButton = (
    <button
      type="button"
      onClick={() => void confirm('rerender')}
      disabled={busy}
      aria-busy={busy}
      className={primaryClass}
    >
      <RotateCw
        className={`size-4 ${busy ? 'animate-spin motion-reduce:animate-none' : ''}`}
        aria-hidden
      />
      Relancer
    </button>
  );

  const attempts = shot.attempts ?? [];
  const rejected = (shot.routing?.candidates ?? []).filter((c) => !c.eligible);

  return (
    <li className="space-y-3 rounded-xl border border-line bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h4
            ref={headingRef}
            tabIndex={-1}
            className={`text-base font-semibold text-ink ${focusRing}`}
          >
            {title}
          </h4>
          <p className="flex flex-wrap items-center gap-2 text-sm text-ink">
            <span>
              <span className="text-ink-muted">Moteur : </span>
              <span className="font-semibold">
                {engineChosen
                  ? shot.display_name || shot.model || shot.provider
                  : 'pas encore choisi'}
              </span>
            </span>
            {(engineChosen || shot.status === 'completed') && mock && (
              <HeuristicBadge entity={{ is_heuristic: true }} />
            )}
          </p>
        </div>
        <ShotPill statusKey={status.key} label={status.label} />
      </div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
        {(
          [
            ['Résolution', shot.resolution || '—'],
            ['Durée', duration || '—'],
            ['Coût estimé', formatCost(shot.estimated_cost_usd, mock)],
            ['Coût réel', formatCost(shot.actual_cost_usd, mock)],
          ] as const
        ).map(([dt, dd]) => (
          <div key={dt}>
            <dt className="text-xs text-ink-muted">{dt}</dt>
            <dd className="font-semibold text-ink tabular-nums">{dd}</dd>
          </div>
        ))}
      </dl>

      {action?.kind === 'confirm_rerender' && (
        <div className="space-y-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="flex items-start gap-1.5">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            L&apos;issue du dernier essai est inconnue : il n&apos;est pas relancé automatiquement.
          </p>
          {confirming ? (
            <div role="group" aria-labelledby={confirmId} className="space-y-2">
              <p id={confirmId} className="font-semibold">
                Ce plan a peut-être déjà été facturé ({possiblyBilledText(shot)}). Relancer quand
                même ?
              </p>
              <div className="flex flex-wrap gap-2">
                {rerenderButton}
                {cancelButton}
              </div>
            </div>
          ) : (
            <button
              ref={(el) => {
                triggerRefs.current.rerender = el;
              }}
              type="button"
              onClick={() => setConfirming('rerender')}
              className={secondaryClass}
            >
              Relancer ce plan…
            </button>
          )}
        </div>
      )}

      {shot.quality && <QualityPanel quality={shot.quality} />}

      {review && (
        <div className="space-y-3 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
          <p className="flex items-start gap-1.5">
            <Eye className="mt-0.5 size-4 shrink-0" aria-hidden />
            Ce plan n&apos;a pas passé le contrôle qualité : il n&apos;est pas utilisé tant que vous
            ne l&apos;acceptez pas ou ne le relancez pas.
          </p>
          {confirming ? (
            <div role="group" aria-labelledby={confirmId} className="space-y-2">
              <p id={confirmId} className="font-semibold">
                {confirming === 'accept'
                  ? 'Le clip sera utilisé tel quel dans la vidéo malgré le contrôle qualité. Accepter quand même ?'
                  : 'Un nouveau rendu de ce plan sera lancé et facturé. Relancer ?'}
              </p>
              <div className="flex flex-wrap gap-2">
                {confirming === 'accept' ? (
                  <button
                    type="button"
                    onClick={() => void confirm('accept')}
                    disabled={busy}
                    aria-busy={busy}
                    className={primaryClass}
                  >
                    <Check className="size-4" aria-hidden />
                    Accepter
                  </button>
                ) : (
                  rerenderButton
                )}
                {cancelButton}
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                ref={(el) => {
                  triggerRefs.current.accept = el;
                }}
                type="button"
                onClick={() => setConfirming('accept')}
                className={secondaryClass}
              >
                <Check className="size-4" aria-hidden />
                Accepter quand même…
              </button>
              <button
                ref={(el) => {
                  triggerRefs.current.rerender = el;
                }}
                type="button"
                onClick={() => setConfirming('rerender')}
                className={secondaryClass}
              >
                <RotateCw className="size-4" aria-hidden />
                Relancer un rendu…
              </button>
            </div>
          )}
        </div>
      )}

      {action?.kind === 'pick_engine' && (
        <div className="space-y-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          <p className="font-semibold">Aucun moteur n&apos;a pu rendre ce plan.</p>
          {rejected.length > 0 && (
            <ul className="list-disc space-y-0.5 pl-5">
              {rejected.map((c) => (
                <li key={`${c.provider}/${c.model}`}>
                  {c.display_name || c.model || c.provider} : {routeReasonText(c.rejected_reason)}
                </li>
              ))}
            </ul>
          )}
          {action.canRetry && onRetryJob ? (
            <button type="button" onClick={onRetryJob} className={secondaryClass}>
              <RotateCw className="size-4" aria-hidden />
              Relancer la génération
            </button>
          ) : (
            <p>Vous pourrez relancer la génération une fois les autres plans terminés.</p>
          )}
        </div>
      )}

      {(shot.status === 'completed' || review) && shot.clip_asset_id && (
        <details onToggle={(e) => setClipOpen(e.currentTarget.open)}>
          <summary className={summaryClass}>Aperçu du clip</summary>
          <div className="pt-1">
            {clipOpen && (
              <ClipPreview assetId={shot.clip_asset_id} title={title} simulated={mock} />
            )}
          </div>
        </details>
      )}

      <RoutingDetails shot={shot} />

      {attempts.length > 0 && (
        <details>
          <summary className={summaryClass}>
            Essais ({attempts.length})
            {attempts.some(isPossiblyBilled) && (
              <span className="ml-2 font-normal text-amber-900">· possiblement facturé</span>
            )}
          </summary>
          <ol className="space-y-2 pt-1">
            {attempts.map((a) => (
              <AttemptItem
                key={a.id}
                attempt={a}
                simulated={mock && a.provider === shot.provider}
              />
            ))}
          </ol>
        </details>
      )}
    </li>
  );
}
