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

function Thumb({ url }: { url: string | null }) {
  const media = useApiMediaUrl(url);
  return (
    <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-zinc-100">
      {media.url ? (
        // eslint-disable-next-line @next/next/no-img-element -- object/presigned URL, not optimisable
        <img src={media.url} alt="" className="size-full object-cover" />
      ) : (
        <Film className="size-5 text-zinc-400" aria-hidden />
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
    <section
      aria-labelledby="history-title"
      className="max-w-4xl space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-6 shadow-2xs"
    >
      <h4 id="history-title" className="flex items-center gap-2 text-sm font-bold text-zinc-900">
        <History className="size-4 text-[#BA3807]" aria-hidden />
        Historique des vidéos
      </h4>
      {error && <p className="text-sm text-red-800">Historique indisponible.</p>}
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
                          className="rounded-full border border-line bg-zinc-50 px-2 py-0.5 text-xs font-semibold text-ink tabular-nums"
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
                    className={`inline-flex min-h-11 items-center rounded-lg border border-line bg-white px-4 text-sm font-semibold text-ink hover:bg-zinc-50 ${focusRing}`}
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
  );
}
