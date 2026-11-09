'use client';

import React, { useEffect, useState } from 'react';
import { Film, History, X, ChevronRight } from 'lucide-react';
import { VideoGenerationJob } from '../../lib/types/creative';
import { creativeApi } from '../../lib/api/creative';
import { formatCost } from '../../lib/creative-rules.mjs';
import { historyView } from '../../lib/finishing-rules.mjs';
import { useApiMediaUrl } from '../../hooks/use-assets';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange';

const STATUS: Record<string, { label: string; badge: string }> = {
  completed: { label: 'Done', badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  failed: { label: 'Failed', badge: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  blocked: { label: 'Blocked', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  cancelled: { label: 'Cancelled', badge: 'bg-white/5 text-studio-muted border-white/10' },
};

function Thumb({
  url,
  className = 'size-14 rounded-lg',
}: {
  url: string | null;
  className?: string;
}) {
  const media = useApiMediaUrl(url);
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-white/5 border border-white/10 ${className}`}
    >
      {media.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- object/presigned URL, not optimisable
        <img src={media.url} alt="" className="size-full object-cover" />
      ) : (
        <Film className="size-4 text-studio-muted" aria-hidden />
      )}
    </div>
  );
}

interface Props {
  productId: string;
  /** Changes when the shown job changes or settles: the list is refetched. */
  refreshKey: string;
  activeJobId: string | null;
  onOpen: (job: VideoGenerationJob) => void;
}

/**
 * Modern minimalist video history drawer.
 * Discloses past video jobs in a clean slide-over panel without crowding
 * or squeezing the main ad creation workspace.
 */
export function VideoHistory({ productId, refreshKey, activeJobId, onOpen }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [state, setState] = useState<{ jobs: VideoGenerationJob[] | null; error: boolean }>({
    jobs: null,
    error: false,
  });

  useEffect(() => {
    let cancelled = false;
    creativeApi
      .listVideoJobs(productId)
      .then((jobs) => {
        if (!cancelled) setState({ jobs, error: false });
      })
      .catch(() => {
        if (!cancelled) setState((s) => ({ ...s, error: true }));
      });
    return () => {
      cancelled = true;
    };
  }, [productId, refreshKey]);

  const { jobs, error } = state;
  if (!error && (!jobs || jobs.length === 0)) return null;

  const count = jobs?.length ?? 0;

  return (
    <>
      {/* Floating unobtrusive history trigger pill */}
      <div className="fixed top-20 right-4 z-40 sm:right-6">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={`flex items-center gap-2 rounded-full border border-white/10 bg-studio-ground/90 px-3.5 py-2 text-xs font-semibold text-white shadow-2xl backdrop-blur-md transition-all duration-200 hover:border-trend-orange hover:bg-white/10 hover:shadow-trend-orange/10 ${focusRing}`}
          aria-expanded={isOpen}
          aria-controls="video-history-drawer"
        >
          <History className="size-3.5 text-trend-orange" aria-hidden />
          <span>History</span>
          <span className="flex size-4.5 items-center justify-center rounded-full bg-trend-orange/20 text-[10px] font-bold text-trend-orange">
            {count}
          </span>
        </button>
      </div>

      {/* Slide-over backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-over drawer */}
      <aside
        id="video-history-drawer"
        aria-label="Video history"
        className={`fixed top-0 right-0 bottom-0 z-50 flex w-full max-w-md flex-col border-l border-white/10 bg-studio-ground/95 shadow-2xl backdrop-blur-2xl transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full pointer-events-none'
        }`}
      >
        {/* Drawer header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-lg bg-trend-orange/10 text-trend-orange">
              <History className="size-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Video history</h3>
              <p className="text-xs text-studio-muted">
                {count} version{count > 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            aria-label="Close history"
            className={`flex size-8 items-center justify-center rounded-lg text-studio-muted transition hover:bg-white/5 hover:text-white ${focusRing}`}
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Drawer content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {error && (
            <p className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-xs text-rose-400">
              Could not load the video history.
            </p>
          )}

          {!jobs && !error && (
            <p className="p-4 text-center text-xs text-studio-muted">Loading history…</p>
          )}

          {jobs && jobs.length > 0 && (
            <div className="space-y-2.5">
              {jobs.map((job) => {
                const v = historyView(job);
                const date = new Date(job.created_at).toLocaleString('en-GB', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                });
                const open = job.id === activeJobId;
                const statusMeta = STATUS[job.status] ?? {
                  label: 'Rendering',
                  badge: 'bg-trend-orange/10 text-trend-orange border-trend-orange/20',
                };

                return (
                  <div
                    key={job.id}
                    className={`group relative flex items-center gap-3.5 rounded-2xl border p-3.5 transition-all duration-200 ${
                      open
                        ? 'border-trend-orange/60 bg-trend-orange/[0.06] shadow-[0_0_20px_-5px_rgba(255,98,45,0.2)]'
                        : 'border-white/[0.08] bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                    }`}
                  >
                    <Thumb url={v.thumbnailUrl} className="aspect-[9/16] h-18 w-auto rounded-xl" />

                    <div className="min-w-0 flex-1 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${statusMeta.badge}`}
                        >
                          {statusMeta.label}
                        </span>
                        <span className="text-[11px] text-studio-muted tabular-nums">
                          {formatCost(v.cost, job.cost_is_heuristic === true)}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-white truncate">{date}</p>

                      <div className="flex flex-wrap items-center gap-1">
                        {v.formats.length > 0 ? (
                          v.formats.map((f) => (
                            <span
                              key={f}
                              className="rounded-md border border-white/10 bg-white/5 px-1.5 py-0.5 text-[10px] font-medium text-studio-muted"
                            >
                              {f}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-studio-muted">No format</span>
                        )}
                      </div>
                    </div>

                    <div className="shrink-0 pl-1">
                      {open ? (
                        <span className="rounded-full bg-trend-orange/20 px-2.5 py-1 text-[11px] font-bold text-trend-orange">
                          Showing
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => {
                            onOpen(job);
                            setIsOpen(false);
                          }}
                          className={`flex size-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-studio-muted transition hover:border-trend-orange hover:bg-trend-orange hover:text-black ${focusRing}`}
                          title="Show this video"
                        >
                          <ChevronRight className="size-4" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
