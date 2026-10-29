'use client';

import React, { useRef, useState } from 'react';
import { AlertTriangle, Check, Clock, Download, Film, Loader2, ShieldCheck } from 'lucide-react';
import {
  ExportAspectRatio,
  FinishingReport,
  GeneratedAsset,
  VideoExport,
  VideoGenerationJob,
} from '../../lib/types/creative';
import { creativeApi } from '../../lib/api/creative';
import { fetchBlobWithAuth, getApiBaseUrl } from '../../lib/api/core';
import { formatCost } from '../../lib/creative-rules.mjs';
import {
  EXPORT_STATUS_LABELS,
  RATIO_ASPECT_CLASS,
  RATIO_DIMENSIONS,
  exportRows,
  finishingCheckLabel,
  finishingView,
  isExportInFlight,
  mediaSource,
} from '../../lib/finishing-rules.mjs';
import { useApiMediaUrl } from '../../hooks/use-assets';
import { useVideoExports } from '../../hooks/use-video-exports';
import { CheckItem } from './ShotRenderRow';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange';
const secondaryClass = `inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-zinc-50 disabled:opacity-60 ${focusRing}`;
const summaryClass = `inline-flex min-h-11 cursor-pointer items-center rounded-lg text-sm font-semibold text-ink ${focusRing}`;
const badgeClass =
  'inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-xs font-semibold text-amber-900';

const lookup = (map: Record<string, string>, key: string | null | undefined) =>
  key ? map[key] : undefined;

/** Saves an owner-only file through the protected download (s3: 302 to a presigned URL). */
async function saveFile(source: ReturnType<typeof mediaSource>, filename: string) {
  if (!source) throw new Error('missing');
  const a = document.createElement('a');
  let objectUrl: string | null = null;
  if (source.kind === 'direct') {
    a.href = source.url;
  } else {
    objectUrl = URL.createObjectURL(await fetchBlobWithAuth(source.endpoint));
    a.href = objectUrl;
  }
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  if (objectUrl) setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

function DownloadButton({
  exp,
  fallbackAssetId,
  ratio,
  filenameSuffix,
}: {
  exp: VideoExport | null;
  fallbackAssetId: string | null;
  ratio: string;
  filenameSuffix: string;
}) {
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const assetId = exp?.asset_id ?? fallbackAssetId;
  // The existing protected download by asset id; download_url only when no id is given.
  const source = assetId
    ? { kind: 'authed' as const, endpoint: creativeApi.assetDownloadPath(assetId) }
    : mediaSource(exp?.download_url, getApiBaseUrl());
  if (!source) return <span className="text-sm text-ink-muted">Fichier indisponible</span>;
  const onClick = async () => {
    setBusy(true);
    setFailed(false);
    try {
      await saveFile(source, `trended-video-${ratio.replace(':', 'x')}${filenameSuffix}.mp4`);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };
  return (
    <span className="inline-flex flex-wrap items-center gap-2">
      <button
        type="button"
        onClick={() => void onClick()}
        disabled={busy}
        aria-busy={busy}
        className={secondaryClass}
      >
        <Download className="size-4" aria-hidden />
        {busy ? 'Téléchargement…' : `Télécharger ${ratio}`}
      </button>
      {failed && (
        <span role="alert" className="text-sm text-red-800">
          Téléchargement impossible, réessayez.
        </span>
      )}
    </span>
  );
}

function ExportStatus({ exp }: { exp: VideoExport }) {
  const label = lookup(EXPORT_STATUS_LABELS, exp.status) ?? 'Statut inconnu';
  const tone =
    exp.status === 'completed'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
      : exp.status === 'failed'
        ? 'border-red-200 bg-red-50 text-red-800'
        : 'border-line bg-cream text-ink';
  return (
    <span
      className={`inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 text-xs font-semibold ${tone}`}
    >
      {isExportInFlight(exp) ? (
        <>
          <Loader2 className="size-3.5 animate-spin motion-reduce:hidden" aria-hidden />
          <Clock className="hidden size-3.5 motion-reduce:inline" aria-hidden />
        </>
      ) : exp.status === 'completed' ? (
        <Check className="size-3.5" aria-hidden />
      ) : (
        <AlertTriangle className="size-3.5" aria-hidden />
      )}
      {label}
    </span>
  );
}

/** Module 6 final QA: issues listed, passed checks collapsed, no score. */
function FinishingReportPanel({ report }: { report: FinishingReport }) {
  const view = finishingView(report);
  if (!view) return null;
  const mockVoice = report.voiceover?.is_mock === true;
  return (
    <section
      aria-labelledby="finishing-title"
      className={`space-y-3 rounded-xl border p-4 text-sm ${
        view.passed ? 'border-emerald-200 bg-emerald-50' : 'border-amber-300 bg-amber-50'
      }`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <ShieldCheck className="size-4 text-ink" aria-hidden />
        <h5 id="finishing-title" className="font-semibold text-ink">
          Contrôle final :{' '}
          {view.passed
            ? 'conforme'
            : view.blockingFails > 0
              ? 'non conforme'
              : 'conforme avec réserves'}
        </h5>
        {view.badges.map((b) => (
          <span key={b} className={badgeClass}>
            {b}
          </span>
        ))}
      </div>
      {view.issues.length > 0 && (
        <ul className="space-y-2">
          {view.issues.map((c) => (
            <CheckItem key={c.name} check={c} label={finishingCheckLabel(c.name)} />
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
              <CheckItem key={c.name} check={c} label={finishingCheckLabel(c.name)} />
            ))}
          </ul>
        </details>
      )}
      {report.music && (
        <p className="text-ink">
          Musique : {report.music.title}{' '}
          <span className="text-ink-muted">· licence {report.music.licence}</span>
        </p>
      )}
      <p className="text-ink">
        <span className="text-ink-muted">Coût de finition : </span>
        <span className="font-semibold tabular-nums">{formatCost(report.cost_usd, mockVoice)}</span>
      </p>
      <p className="text-xs text-ink-muted">
        Le contrôle final ne donne pas de score : seulement des mesures et des seuils.
      </p>
    </section>
  );
}

interface Props {
  job: VideoGenerationJob;
  finalAsset: GeneratedAsset;
  /** Object URL of the primary MP4 (fetched with the token by the tracker). */
  videoUrl: string | null;
  videoFailed: boolean;
  /** "Simulation" / "Non vérifié" when the shots cannot prove a real render. */
  notRealLabel: string | null;
}

export function FinalVideoPanel({ job, finalAsset, videoUrl, videoFailed, notRealLabel }: Props) {
  const { exports, creating, error, liveMessage, create } = useVideoExports(job.id, job.exports);
  const poster = useApiMediaUrl(job.thumbnail_url);
  const statusRefs = useRef<Record<string, HTMLElement | null>>({});

  const primaryRatio =
    finalAsset.aspect_ratio ??
    [...exports].sort((a, b) => a.created_at.localeCompare(b.created_at))[0]?.aspect_ratio ??
    null;
  const rows = exportRows(exports, primaryRatio);
  const suffix = notRealLabel ? '-simulation' : '';

  const onExport = async (ratio: ExportAspectRatio) => {
    // The button is replaced by the status: move focus to it so it is not lost.
    if (await create(ratio)) statusRefs.current[ratio]?.focus();
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
          <Film className="w-4 h-4 text-[#BA3807]" aria-hidden />
          <span>Vidéo finale</span>
          {notRealLabel && (
            <span className="rounded bg-ink px-1.5 py-0.5 text-[11px] font-semibold text-white">
              {notRealLabel}
            </span>
          )}
        </h4>
        <span className="text-xs text-zinc-500">
          {primaryRatio
            ? `Format ${primaryRatio}${lookup(RATIO_DIMENSIONS, primaryRatio) ? ` (${lookup(RATIO_DIMENSIONS, primaryRatio)})` : ''}`
            : 'Format inconnu'}{' '}
          · MP4 H.264 / AAC
        </span>
      </div>

      <div className="flex justify-center bg-black/90 rounded-2xl p-4 overflow-hidden">
        {videoUrl ? (
          <video
            controls
            playsInline
            preload="metadata"
            poster={poster.url ?? undefined}
            className={`max-h-[500px] max-w-full rounded-xl shadow-lg ${lookup(RATIO_ASPECT_CLASS, primaryRatio) ?? ''}`}
            src={videoUrl}
            aria-label={`Vidéo finale${notRealLabel ? ` (${notRealLabel.toLowerCase()})` : ''}`}
          >
            Votre navigateur ne prend pas en charge la lecture vidéo.
          </video>
        ) : (
          <p className="py-12 text-sm text-white" role="status">
            {videoFailed ? 'Vidéo indisponible.' : 'Chargement de la vidéo…'}
          </p>
        )}
      </div>

      <section aria-labelledby="formats-title" className="space-y-3">
        <h5 id="formats-title" className="text-sm font-semibold text-ink">
          Formats
        </h5>
        <ul className="divide-y divide-line rounded-xl border border-line">
          {rows.map(({ ratio, exp, canExport }) => {
            const isPrimary = ratio === primaryRatio;
            // Jobs from before module 6 have no export rows: the primary asset still downloads.
            const done = exp?.status === 'completed' || (isPrimary && !exp);
            return (
              <li key={ratio} className="flex flex-wrap items-center justify-between gap-3 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    ref={(el) => {
                      statusRefs.current[ratio] = el;
                    }}
                    tabIndex={-1}
                    className={`font-semibold text-ink tabular-nums ${focusRing}`}
                  >
                    {ratio}
                    {lookup(RATIO_DIMENSIONS, ratio) && (
                      <span className="font-normal text-ink-muted">
                        {' '}
                        · {lookup(RATIO_DIMENSIONS, ratio)}
                      </span>
                    )}
                    {isPrimary && <span className="font-normal text-ink-muted"> · principal</span>}
                  </span>
                  {exp && <ExportStatus exp={exp} />}
                  {exp?.cost_usd && (
                    <span className="text-xs text-ink-muted tabular-nums">
                      {formatCost(exp.cost_usd, false)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {done && (
                    <DownloadButton
                      exp={exp}
                      fallbackAssetId={isPrimary ? finalAsset.id : null}
                      ratio={ratio}
                      filenameSuffix={suffix}
                    />
                  )}
                  {!done && canExport && (
                    <button
                      type="button"
                      onClick={() => void onExport(ratio as ExportAspectRatio)}
                      disabled={creating !== null}
                      aria-busy={creating === ratio}
                      className={secondaryClass}
                    >
                      {creating === ratio && (
                        <Loader2
                          className="size-4 animate-spin motion-reduce:animate-none"
                          aria-hidden
                        />
                      )}
                      {exp?.status === 'failed'
                        ? `Relancer l'export ${ratio}`
                        : `Exporter en ${ratio}`}
                    </button>
                  )}
                </div>
                {exp?.status === 'failed' && (
                  <p className="w-full text-sm text-red-800">
                    {exp.error || "L'export a échoué sans message d'erreur."}
                  </p>
                )}
              </li>
            );
          })}
        </ul>
        {error && (
          <p role="alert" className="flex items-start gap-1.5 text-sm text-red-800">
            <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
            {error}
          </p>
        )}
        <p className="sr-only" role="status" aria-live="polite">
          {liveMessage}
        </p>
      </section>

      {job.finishing_report ? (
        <FinishingReportPanel report={job.finishing_report} />
      ) : (
        <p className="text-sm text-ink-muted">Rapport de finition indisponible pour cette vidéo.</p>
      )}
    </div>
  );
}
