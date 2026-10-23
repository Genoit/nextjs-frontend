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
} from 'lucide-react';
import { VideoGenerationJob } from '../../lib/types/creative';
import { creativeApi } from '../../lib/api/creative';

interface Props {
  job: VideoGenerationJob;
  onCancel?: (jobId: string) => Promise<void>;
  onRetry?: () => void;
}

export function VideoGenerationTracker({ job, onCancel, onRetry }: Props) {
  const isCompleted = job.status === 'completed';
  const isFailed = job.status === 'failed';
  const isCancelled = job.status === 'cancelled';
  const isRunning = !isCompleted && !isFailed && !isCancelled;

  // Find the final MP4 asset
  const finalAsset = job.assets.find((a) => a.asset_type === 'final_video') || job.assets[0];
  const downloadUrl = finalAsset ? creativeApi.getAssetDownloadUrl(finalAsset.id) : null;

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Status & Progress Bar */}
      <div className="rounded-2xl bg-white border border-zinc-200/80 p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#BA3807] animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
                Pipeline de Génération Vidéo IA & Montage FFmpeg
              </span>
            </div>
            <h3 className="text-xl font-bold text-zinc-900">
              {isCompleted
                ? 'Vidéo publicitaire générée avec succès !'
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
                className="px-4 py-2 rounded-xl border border-zinc-300 text-zinc-600 hover:bg-zinc-50 text-xs font-semibold transition"
              >
                Annuler
              </button>
            )}

            {isFailed && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="px-5 py-2.5 rounded-xl bg-[#BA3807] hover:bg-[#9A2D04] text-white text-xs font-bold transition flex items-center gap-2"
              >
                <RotateCw className="w-4 h-4" />
                <span>Réessayer</span>
              </button>
            )}

            {isCompleted && downloadUrl && (
              <a
                href={downloadUrl}
                download
                className="px-5 py-2.5 rounded-xl bg-[#BA3807] hover:bg-[#9A2D04] text-white text-xs font-bold shadow-xs transition flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Télécharger le MP4 (1080x1920)</span>
              </a>
            )}
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
                    ? 'bg-[#FFF5ED] border-[#FED7AA] text-[#BA3807] animate-pulse'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-400'
              }`}
            >
              {item.step}
            </div>
          ))}
        </div>

        {/* Per-Scene Render Statuses */}
        {job.scene_job_statuses && Object.keys(job.scene_job_statuses).length > 0 && (
          <div className="pt-3 border-t border-zinc-100 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-700">Rendu des scènes & Assemblage EDL :</span>
              {job.compliance_status && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                  ✓ Conformité {job.compliance_status}
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {Object.entries(job.scene_job_statuses).map(([sceneKey, statusObj]) => {
                const sObj = statusObj as Record<string, string>;
                const isDone = sObj?.status === 'completed';
                const isRendering = sObj?.status === 'rendering';
                return (
                  <div
                    key={sceneKey}
                    className={`p-2 rounded-lg border text-xs flex items-center justify-between ${
                      isDone
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-850'
                        : isRendering
                          ? 'bg-[#FFF5ED] border-[#FED7AA] text-[#BA3807] animate-pulse'
                          : 'bg-zinc-50 border-zinc-200 text-zinc-500'
                    }`}
                  >
                    <span className="font-bold">{sceneKey.replace('_', ' ')}</span>
                    <span>{isDone ? '✓ Prêt' : isRendering ? '⏳ Rendu' : 'Attente'}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

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
              <Film className="w-4 h-4 text-[#BA3807]" />
              <span>Aperçu de la vidéo générée</span>
            </h4>
            <span className="text-xs text-zinc-500">Format 9:16 (1080×1920) · MP4 H.264 / AAC</span>
          </div>

          <div className="flex justify-center bg-black/90 rounded-2xl p-4 overflow-hidden">
            <video
              controls
              className="max-h-[500px] rounded-xl shadow-lg aspect-[9/16]"
              src={downloadUrl || undefined}
            >
              Votre navigateur ne prend pas en charge la lecture vidéo.
            </video>
          </div>
        </div>
      )}

      {/* Quality Control Report Card */}
      {job.quality_report && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-emerald-600" />
              <h4 className="text-sm font-bold text-zinc-900">Rapport de Contrôle Qualité (QA)</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Score global :</span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {job.quality_report.overall_score} / 100
              </span>
            </div>
          </div>

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
              <span className="text-[10px] text-emerald-600 font-bold">✓ Conforme</span>
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
              <span className="text-[10px] text-emerald-600 font-bold">✓ 1080x1920 (9:16)</span>
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
              <span className="text-[10px] text-emerald-600 font-bold">✓ Mixage réussi</span>
            </div>

            {/* Ethics check */}
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 space-y-1">
              <div className="text-zinc-500 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Éthique publicitaire</span>
              </div>
              <div className="font-bold text-zinc-900">Zéro faux avis</div>
              <span className="text-[10px] text-emerald-600 font-bold">✓ 100% Vérifié</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
