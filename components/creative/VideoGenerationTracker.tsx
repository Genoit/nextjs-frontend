'use client';

import React from 'react';
import {
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
import { FinalVideoPanel } from './FinalVideoPanel';
import { RATIO_DIMENSIONS } from '../../lib/finishing-rules.mjs';
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
  const notRealLabel = simulated ? 'Simulation' : 'Unverified';
  const primaryDims = finalAsset?.aspect_ratio
    ? (RATIO_DIMENSIONS as Record<string, string>)[finalAsset.aspect_ratio]
    : undefined;

  return (
    <div className="space-y-6 w-full max-w-5xl">
      {/* Status & Progress Bar */}
      <div className="rounded-2xl bg-studio-ground border border-line/80 p-6 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span
                className="w-2.5 h-2.5 rounded-full bg-trend-orange animate-pulse motion-reduce:animate-none"
                aria-hidden
              />
              <span className="text-xs font-bold uppercase tracking-wider text-ink-muted">
                AI video studio
              </span>
            </div>
            <h3 className="text-lg font-semibold text-ink">
              {isCompleted
                ? simulated
                  ? 'Video assembled (simulated render)'
                  : unverified
                    ? 'Video assembled (shot source unverified)'
                    : 'Your ad video is ready!'
                : isFailed
                  ? 'Video generation failed'
                  : isCancelled
                    ? 'Generation cancelled'
                    : 'Making your ad…'}
            </h3>
            <p className="text-xs text-ink-muted">
              {job.current_step || 'Rendering scenes and assembling the video.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {isRunning && onCancel && (
              <button
                type="button"
                onClick={() => onCancel(job.id)}
                className="min-h-11 px-4 py-2 rounded-xl border border-line text-ink-soft hover:bg-studio-surface text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange"
              >
                Cancel
              </button>
            )}

            {isFailed && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="min-h-11 px-5 py-2.5 rounded-[10px] bg-trend-orange hover:bg-trend-orange-strong text-on-accent text-xs font-semibold transition flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange"
              >
                <RotateCw className="w-4 h-4" aria-hidden />
                <span>Retry</span>
              </button>
            )}

            {isCompleted &&
              finalAsset &&
              (finalVideo.url ? (
                <a
                  href={finalVideo.url}
                  download={notReal ? 'trended-video-simulation.mp4' : 'trended-video.mp4'}
                  className="min-h-11 px-5 py-2.5 rounded-[10px] bg-trend-orange hover:bg-trend-orange-strong text-on-accent text-xs font-semibold transition flex items-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange"
                >
                  <Download className="w-4 h-4" aria-hidden />
                  <span>
                    Download MP4{primaryDims ? ` (${primaryDims})` : ''}
                    {notReal ? ` · ${notRealLabel}` : ''}
                  </span>
                </a>
              ) : (
                <span className="text-xs text-ink-muted" role="status">
                  {finalVideo.failed ? 'Video unavailable' : 'Preparing download…'}
                </span>
              ))}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-ink-soft">
            <span>Overall progress</span>
            <span>{job.progress_percentage}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-studio-raised overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isCompleted ? 'bg-success' : isFailed ? 'bg-danger' : 'bg-trend-orange'
              }`}
              style={{ width: `${Math.max(5, job.progress_percentage)}%` }}
            />
          </div>
        </div>

        {/* Step indicators */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            {
              step: 'AI scenes',
              active: job.progress_percentage >= 20,
              done: job.progress_percentage >= 50,
            },
            {
              step: 'Voice & audio',
              active: job.progress_percentage >= 50,
              done: job.progress_percentage >= 70,
            },
            {
              step: 'Assembly & effects',
              active: job.progress_percentage >= 70,
              done: job.progress_percentage >= 85,
            },
            {
              step: 'Quality check',
              active: job.progress_percentage >= 85,
              done: job.progress_percentage === 100,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-xl border text-center text-xs font-semibold ${
                item.done
                  ? 'bg-success-soft border-success/30 text-success'
                  : item.active
                    ? 'bg-cream border-trend-orange/30 text-trend-orange animate-pulse motion-reduce:animate-none'
                    : 'bg-studio-surface border-line text-ink-muted'
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
              ['Quality', tierLabel(job.quality_tier)],
              ['Estimated cost', formatCost(job.estimated_cost, heuristicCost)],
              ['Actual cost', formatCost(job.actual_cost, heuristicCost)],
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
              <span className="font-semibold text-ink">Job budget</span>
              <span
                className={`tabular-nums ${budget.over ? 'font-semibold text-danger' : 'text-ink'}`}
              >
                {budget.over && (
                  <AlertCircle className="mr-1 inline size-4 align-text-bottom" aria-hidden />
                )}
                {budget.label}
              </span>
            </p>
            <div className="h-2 w-full overflow-hidden rounded-full bg-studio-raised" aria-hidden>
              <div
                className={`h-full ${budget.over ? 'bg-danger' : 'bg-ink'}`}
                style={{ width: `${budget.pct}%` }}
              />
            </div>
          </div>
        )}
        {simulated && (
          <div className="flex gap-3 rounded-xl border border-warning/30 bg-warning-soft p-4 text-sm text-warning">
            <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden />
            <p>
              <span className="font-semibold">Simulated render. </span>
              Shots marked “Simulation” were not made by an AI video engine
              {heuristicCost ? ' and their costs are estimates' : ''}.
            </p>
          </div>
        )}

        {/* Per-shot renders */}
        {shots.length > 0 && (
          <section aria-labelledby="shots-title" className="space-y-3 border-t border-line pt-4">
            <h4 id="shots-title" className="text-sm font-semibold text-ink">
              Shot renders
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
          <div className="p-4 rounded-xl bg-danger-soft border border-danger/30 text-xs text-danger flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Error: </span>
              {job.error_message}
            </div>
          </div>
        )}
      </div>

      {/* Final video: poster, formats on demand, finishing report (module 6) */}
      {isCompleted && finalAsset && (
        <FinalVideoPanel
          job={job}
          finalAsset={finalAsset}
          videoUrl={finalVideo.url}
          videoFailed={finalVideo.failed}
          notRealLabel={notReal ? notRealLabel : null}
        />
      )}

      {/* Legacy QA card (pre-module 6); the finishing report replaces it and has no score. */}
      {job.quality_report && !job.finishing_report && (
        <div className="bg-studio-ground rounded-[13px] border border-studio-rule bg-studio-surface p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-3">
            <div className="flex items-center gap-2">
              <Award
                className={`w-5 h-5 ${notReal ? 'text-ink-muted' : 'text-success'}`}
                aria-hidden
              />
              <h4 className="text-sm font-bold text-ink">Quality report (QA)</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-ink-muted">Overall score:</span>
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                  notReal ? 'bg-studio-raised text-ink-soft' : 'bg-success-soft text-success'
                }`}
              >
                {job.quality_report.overall_score} / 100
                {notReal && ' · not representative'}
              </span>
            </div>
          </div>
          {notReal && (
            <p className="flex items-start gap-1.5 text-sm text-warning">
              <FlaskConical className="mt-0.5 size-4 shrink-0" aria-hidden />
              {simulated
                ? 'Not representative: the video assembles simulated shots.'
                : 'Not representative: the shot source is unverified.'}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Duration check */}
            <div className="p-3 rounded-xl bg-studio-surface border border-line space-y-1">
              <div className="text-ink-muted flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                <span>Duration</span>
              </div>
              <div className="font-bold text-ink">
                {job.quality_report.duration_check.actual.toFixed(1)}s (target:{' '}
                {job.quality_report.duration_check.target}s)
              </div>
              {!notReal && <span className="text-[10px] text-success font-bold">✓ On target</span>}
            </div>

            {/* Resolution check */}
            <div className="p-3 rounded-xl bg-studio-surface border border-line space-y-1">
              <div className="text-ink-muted flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5" />
                <span>Resolution</span>
              </div>
              <div className="font-bold text-ink">{job.quality_report.resolution_check.actual}</div>
              {!notReal && (
                <span className="text-[10px] text-success font-bold">✓ 1080x1920 (9:16)</span>
              )}
            </div>

            {/* Audio sync check */}
            <div className="p-3 rounded-xl bg-studio-surface border border-line space-y-1">
              <div className="text-ink-muted flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5" />
                <span>Audio track</span>
              </div>
              <div className="font-bold text-ink">
                {job.quality_report.audio_sync_check.has_audio ? 'Audio on' : 'Muted'}
              </div>
              {!notReal && <span className="text-[10px] text-success font-bold">✓ Mixed</span>}
            </div>

            {/* Ethics check */}
            <div className="p-3 rounded-xl bg-studio-surface border border-line space-y-1">
              <div className="text-ink-muted flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Ad ethics</span>
              </div>
              <div className="font-bold text-ink">Zero fake reviews</div>
              {!notReal && (
                <span className="text-[10px] text-success font-bold">✓ 100% verified</span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
