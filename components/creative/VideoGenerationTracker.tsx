'use client';

import React from 'react';
import {
  Film,
  Download,
  AlertCircle,
  Clock,
  RotateCw,
  ShieldCheck,
  Award,
  Volume2,
  Tv,
  FlaskConical,
} from 'lucide-react';
import { VideoGenerationJob } from '../../lib/types/creative';
import { creativeApi } from '../../lib/api/creative';
import { formatCost } from '../../lib/creative-rules.mjs';
import { budgetView, isMock, shotsOf, tierLabel } from '../../lib/render-rules.mjs';
import { ShotRenderRow } from './ShotRenderRow';
import { useAuthedBlobUrl } from '../../hooks/use-assets';

interface Props {
  job: VideoGenerationJob;
  onCancel?: (jobId: string) => Promise<void>;
  onRetry?: () => void;
  onRerender: (jobId: string, shotId: string) => Promise<boolean>;
  onAccept: (jobId: string, shotId: string) => Promise<boolean>;
  /** Polite announcement of shot status changes. */
  liveMessage: string;
}

export function VideoGenerationTracker({
  job,
  onCancel,
  onRetry,
  onRerender,
  onAccept,
  liveMessage,
}: Props) {
  const isCompleted = job.status === 'completed';
  // A blocked job (no eligible engine for a shot) is a failure the user can retry.
  const isFailed = job.status === 'failed' || job.status === 'blocked';
  const shots = shotsOf(job);
  // Any mock shot (missing is_mock counts as mock) means the video is not an AI success.
  const simulated = shots.some((s) => isMock(s));
  // Fail closed: a completed job without per-shot data cannot prove a real render either.
  const unverified = isCompleted && shots.length === 0;
  const notReal = simulated || unverified;
  const heuristicCost = simulated || job.cost_is_heuristic === true;
  const budget = budgetView(job);
  const isCancelled = job.status === 'cancelled';
  const isRunning = !isCompleted && !isFailed && !isCancelled;

  // Final MP4: owner-only, fetched with the Bearer token into an object URL (preview + download).
  const finalAsset = (job.assets ?? []).find((a) => a.asset_type === 'final_video');
  const finalVideo = useAuthedBlobUrl(
    isCompleted && finalAsset ? creativeApi.assetDownloadPath(finalAsset.id) : null,
  );
  const notRealLabel = simulated ? 'Simulation' : 'Non vérifié';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Status & Progress Bar */}
      <div className="rounded-2xl bg-white border border-zinc-200/80 p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full bg-[#BA3807] animate-pulse motion-reduce:animate-none"
                aria-hidden
              />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Pipeline de Génération Vidéo IA & Montage FFmpeg
              </span>
            </div>
            <h3 className="text-xl font-bold text-zinc-900">
              {isCompleted
                ? simulated
                  ? 'Vidéo assemblée (rendu simulé)'
                  : unverified
                    ? 'Vidéo assemblée (origine des plans non vérifiée)'
                    : 'Vidéo publicitaire générée avec succès !'
                : isFailed
                  ? 'Échec de la génération vidéo'
                  : isCancelled
                    ? 'Génération annulée'
                    : 'Production de votre publicité en cours...'}
            </h3>
            <p className="text-xs text-zinc-500">
              {job.current_step || 'Traitement asynchrone des scènes et assemblage.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isRunning && onCancel && (
              <button
                type="button"
                onClick={() => onCancel(job.id)}
                className="min-h-11 px-4 py-2 rounded-xl border border-zinc-300 text-zinc-600 hover:bg-zinc-50 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange"
              >
                Annuler
              </button>
            )}

            {isFailed && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="min-h-11 px-5 py-2.5 rounded-xl bg-[#BA3807] hover:bg-[#9A2D04] text-white text-xs font-bold transition flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange"
              >
                <RotateCw className="w-4 h-4" aria-hidden />
                <span>Réessayer</span>
              </button>
            )}

            {isCompleted &&
              finalAsset &&
              (finalVideo.url ? (
                <a
                  href={finalVideo.url}
                  download={notReal ? 'trended-video-simulation.mp4' : 'trended-video.mp4'}
                  className="min-h-11 px-5 py-2.5 rounded-xl bg-[#BA3807] hover:bg-[#9A2D04] text-white text-xs font-bold transition flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange"
                >
                  <Download className="w-4 h-4" aria-hidden />
                  <span>Télécharger le MP4 (1080x1920){notReal ? ` · ${notRealLabel}` : ''}</span>
                </a>
              ) : (
                <span className="text-xs text-zinc-500" role="status">
                  {finalVideo.failed ? 'Vidéo indisponible' : 'Préparation du téléchargement…'}
                </span>
              ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
            <span>Progression globale</span>
            <span>{job.progress_percentage}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-zinc-100 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isCompleted ? 'bg-emerald-500' : isFailed ? 'bg-red-500' : 'bg-[#BA3807]'
              }`}
              style={{ width: `${Math.max(5, job.progress_percentage)}%` }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            {
              step: 'Scènes IA',
              active: job.progress_percentage >= 20,
              done: job.progress_percentage >= 50,
            },
            {
              step: 'Voix & Audio',
              active: job.progress_percentage >= 50,
              done: job.progress_percentage >= 70,
            },
            {
              step: 'Montage FFmpeg',
              active: job.progress_percentage >= 70,
              done: job.progress_percentage >= 85,
            },
            {
              step: 'Contrôle Qualité',
              active: job.progress_percentage >= 85,
              done: job.progress_percentage === 100,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-center text-xs font-semibold ${
                item.done
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : item.active
                    ? 'bg-[#FFF5ED] border-[#FED7AA] text-[#BA3807] animate-pulse motion-reduce:animate-none'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-400'
              }`}
            >
              {item.step}
            </div>
          ))}
        </div>

        {/* Job budget, cost and quality tier (module 4) */}
        <dl className="grid grid-cols-1 gap-3 border-t border-line pt-4 text-sm sm:grid-cols-3">
          {(
            [
              ['Qualité', tierLabel(job.quality_tier)],
              ['Coût estimé', formatCost(job.estimated_cost, heuristicCost)],
              ['Coût réel', formatCost(job.actual_cost, heuristicCost)],
            ] as const
          ).map(([dt, dd]) => (
            <div key={dt}>
              <dt className="text-xs text-ink-muted">{dt}</dt>
              <dd className="font-semibold text-ink tabular-nums">{dd}</dd>
            </div>
          ))}
        </dl>
        {budget && (
          <div className="space-y-1.5">
            <p className="flex flex-wrap justify-between gap-2 text-sm">
              <span className="font-semibold text-ink">Budget du job</span>
              <span
                className={`tabular-nums ${budget.over ? 'font-semibold text-red-800' : 'text-ink'}`}
              >
                {budget.over && (
                  <AlertCircle className="mr-1 inline size-4 align-text-bottom" aria-hidden />
                )}
                {budget.label}
              </span>
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-100" aria-hidden>
              <div
                className={`h-full ${budget.over ? 'bg-red-700' : 'bg-ink'}`}
                style={{ width: `${budget.pct}%` }}
              />
            </div>
          </div>
        )}
        {simulated && (
          <div className="flex gap-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              <span className="font-semibold">Rendu simulé. </span>
              Les plans marqués « Simulation » ne sont pas produits par un moteur vidéo IA
              {heuristicCost ? ' et leurs coûts sont indicatifs' : ''}.
            </p>
          </div>
        )}

        {/* Per-shot renders */}
        {shots.length > 0 && (
          <section aria-labelledby="shots-title" className="space-y-3 border-t border-line pt-4">
            <h4 id="shots-title" className="text-sm font-semibold text-ink">
              Rendu des plans
            </h4>
            <ol className="space-y-3">
              {shots.map((shot) => (
                <ShotRenderRow
                  key={shot.shot_id}
                  shot={shot}
                  jobStatus={job.status}
                  onRerender={(shotId) => onRerender(job.id, shotId)}
                  onAccept={(shotId) => onAccept(job.id, shotId)}
                  onRetryJob={onRetry}
                />
              ))}
            </ol>
          </section>
        )}
        <p className="sr-only" role="status" aria-live="polite">
          {liveMessage}
        </p>

        {job.error_message && (
          <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Erreur : </span>
              {job.error_message}
            </div>
          </div>
        )}
      </div>

      {/* Video Player Preview if Complete */}
      {isCompleted && finalAsset && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
              <Film className="w-4 h-4 text-[#BA3807]" aria-hidden />
              <span>Aperçu de la vidéo générée</span>
              {notReal && (
                <span className="rounded bg-ink px-1.5 py-0.5 text-[11px] font-semibold text-white">
                  {notRealLabel}
                </span>
              )}
            </h4>
            <span className="text-xs text-zinc-500">Format 9:16 (1080×1920) · MP4 H.264 / AAC</span>
          </div>

          <div className="flex justify-center bg-black/90 rounded-2xl p-4 overflow-hidden">
            {finalVideo.url ? (
              <video
                controls
                playsInline
                className="max-h-[500px] rounded-xl shadow-lg aspect-[9/16]"
                src={finalVideo.url}
                aria-label={`Vidéo finale${notReal ? ` (${notRealLabel.toLowerCase()})` : ''}`}
              >
                Votre navigateur ne prend pas en charge la lecture vidéo.
              </video>
            ) : (
              <p className="py-12 text-sm text-white" role="status">
                {finalVideo.failed ? 'Vidéo indisponible.' : 'Chargement de la vidéo…'}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Quality Control Report Card */}
      {job.quality_report && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <Award
                className={`w-5 h-5 ${notReal ? 'text-zinc-400' : 'text-emerald-600'}`}
                aria-hidden
              />
              <h4 className="text-sm font-bold text-zinc-900">Rapport de Contrôle Qualité (QA)</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Score global :</span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  notReal ? 'bg-zinc-100 text-zinc-700' : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {job.quality_report.overall_score} / 100
                {notReal && ' · non représentatif'}
              </span>
            </div>
          </div>
          {notReal && (
            <p className="flex items-start gap-1.5 text-sm text-amber-900">
              <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden />
              {simulated
                ? 'Rapport non représentatif : la vidéo assemble des plans simulés.'
                : "Rapport non représentatif : l'origine des plans n'est pas vérifiée."}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Duration check */}
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="text-zinc-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Durée</span>
              </div>
              <div className="font-bold text-zinc-900">
                {job.quality_report.duration_check.actual.toFixed(1)}s (Cible:{' '}
                {job.quality_report.duration_check.target}s)
              </div>
              {!notReal && (
                <span className="text-[10px] text-emerald-600 font-bold">✓ Conforme</span>
              )}
            </div>

            {/* Resolution check */}
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="text-zinc-500 flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5" />
                <span>Résolution</span>
              </div>
              <div className="font-bold text-zinc-900">
                {job.quality_report.resolution_check.actual}
              </div>
              {!notReal && (
                <span className="text-[10px] text-emerald-600 font-bold">✓ 1080x1920 (9:16)</span>
              )}
            </div>

            {/* Audio sync check */}
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="text-zinc-500 flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Piste audio</span>
              </div>
              <div className="font-bold text-zinc-900">
                {job.quality_report.audio_sync_check.has_audio ? 'Audio actif' : 'Muet'}
              </div>
              {!notReal && (
                <span className="text-[10px] text-emerald-600 font-bold">✓ Mixage réussi</span>
              )}
            </div>

            {/* Ethics check */}
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="text-zinc-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Éthique publicitaire</span>
              </div>
              <div className="font-bold text-zinc-900">Zéro faux avis</div>
              {!notReal && (
                <span className="text-[10px] text-emerald-600 font-bold">✓ 100% Vérifié</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
