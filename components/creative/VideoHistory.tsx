'use client';

import React, { useEffect, useState } from 'react';
import { Film, History } from 'lucide-react';
import { VideoGenerationJob } from '../../lib/types/creative';
import { creativeApi } from '../../lib/api/creative';
import { formatCost } from '../../lib/creative-rules.mjs';
import { historyView } from '../../lib/finishing-rules.mjs';
import { useApiMediaUrl } from '../../hooks/use-assets';

const focusRing =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-trend-orange';

const STATUS: Record<string, string> = {
  completed: 'Terminée',
  failed: 'Échec',
  blocked: 'Bloquée',
  cancelled: 'Annulée',
};

function Thumb({
  url,
  className = 'size-16 rounded-lg',
}: {
  url: string | null;
  className?: string;
}) {
  const media = useApiMediaUrl(url);
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden bg-studio-raised ${className}`}
    >
      {media.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- object/presigned URL, not optimisable
        <img src={media.url} alt="" className="size-full object-cover" />
      ) : (
        <Film className="size-5 text-ink-muted" aria-hidden />
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

/** Past videos of the product: thumbnail, finished formats, cost. */
export function VideoHistory({ productId, refreshKey, activeJobId, onOpen }: Props) {
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
  if (!error && jobs?.length === 0) return null;

  return (
    <>
      {/* Desktop: the studio's right history rail, newest first, the open video outlined. */}
      <aside
        aria-label="Historique des vidéos"
        className="fixed top-16 right-0 bottom-0 z-40 hidden w-24 flex-col items-center gap-3 overflow-y-auto border-l border-white/5 bg-black/60 py-4 md:flex"
      >
        <p className="text-[11px] font-bold text-ink-muted">Historique</p>
        {error && <p className="px-2 text-center text-[11px] text-danger">Indisponible</p>}
        <ul className="flex w-full flex-col gap-2 px-2">
          {(jobs ?? []).map((job) => {
            const v = historyView(job);
            const date = new Date(job.created_at).toLocaleString('fr-FR', {
              dateStyle: 'short',
              timeStyle: 'short',
            });
            const label = `${date} · ${STATUS[job.status] ?? 'En cours'} · ${v.formats.join(', ') || 'aucun format'}`;
            const open = job.id === activeJobId;
            return (
              <li key={job.id}>
                <button
                  type="button"
                  onClick={() => onOpen(job)}
                  disabled={open}
                  title={label}
                  aria-label={open ? `Vidéo affichée : ${label}` : `Ouvrir la vidéo : ${label}`}
                  className={`block w-full overflow-hidden rounded-xl border-2 transition ${focusRing} ${
                    open
                      ? 'border-trend-orange shadow-glow'
                      : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <Thumb url={v.thumbnailUrl} className="aspect-[9/16] w-full" />
                </button>
              </li>
            );
          })}
        </ul>
      </aside>

      <section
        aria-labelledby="history-title"
        className="max-w-4xl space-y-3 rounded-[13px] border border-studio-rule bg-studio-surface p-4 md:hidden"
      >
        <h4 id="history-title" className="flex items-center gap-2 text-sm font-bold text-ink">
          <History className="size-4 text-trend-orange" aria-hidden />
          Historique des vidéos
        </h4>
        {error && <p className="text-sm text-danger">Historique indisponible.</p>}
        {!jobs && !error && (
          <p className="text-sm text-ink-muted" role="status">
            Chargement de l&apos;historique…
          </p>
        )}
        {jobs && jobs.length > 0 && (
          <ul className="divide-y divide-line">
            {jobs.map((job) => {
              const v = historyView(job);
              const date = new Date(job.created_at).toLocaleString('fr-FR', {
                dateStyle: 'medium',
                timeStyle: 'short',
              });
              return (
                <li key={job.id} className="flex flex-wrap items-center gap-3 py-3">
                  <Thumb url={v.thumbnailUrl} />
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-semibold text-ink">
                      {date}
                      <span className="font-normal text-ink-muted">
                        {' '}
                        · {STATUS[job.status] ?? 'En cours'}
                      </span>
                    </p>
                    <ul className="flex flex-wrap gap-1.5" aria-label="Formats disponibles">
                      {v.formats.length > 0 ? (
                        v.formats.map((f) => (
                          <li
                            key={f}
                            className="rounded-full border border-line bg-studio-surface px-2 py-0.5 text-xs font-semibold text-ink tabular-nums"
                          >
                            {f}
                          </li>
                        ))
                      ) : (
                        <li className="text-xs text-ink-muted">Aucun format exporté</li>
                      )}
                    </ul>
                    <p className="text-xs text-ink-muted tabular-nums">
                      Coût réel : {formatCost(v.cost, job.cost_is_heuristic === true)}
                    </p>
                  </div>
                  {job.id === activeJobId ? (
                    <span className="text-xs font-semibold text-ink-muted">Affichée</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => onOpen(job)}
                      aria-label={`Ouvrir la vidéo du ${date}`}
                      className={`inline-flex min-h-11 items-center rounded-lg border border-line bg-studio-ground px-4 text-sm font-semibold text-ink hover:bg-studio-surface ${focusRing}`}
                    >
                      Ouvrir
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
