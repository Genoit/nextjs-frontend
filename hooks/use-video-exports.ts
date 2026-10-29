'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { creativeApi } from '../lib/api/creative';
import { ExportAspectRatio, VideoExport } from '../lib/types/creative';
import { anyExportInFlight, exportTransitionMessage } from '../lib/finishing-rules.mjs';

const POLL_MS = 2000;
const MAX_POLL_FAILURES = 3;
const EMPTY: VideoExport[] = [];

export interface UseVideoExportsReturn {
  exports: VideoExport[];
  /** Ratio whose POST is in flight. */
  creating: ExportAspectRatio | null;
  /** French error of the last action or of the polling. */
  error: string | null;
  /** Polite live-region text ("Export 1:1 : Prêt."). */
  liveMessage: string;
  create: (ratio: ExportAspectRatio) => Promise<boolean>;
}

/**
 * Exports of a completed job: seeded from the job response, refreshed from GET exports,
 * polled while any is pending or rendering (stops when none, backs off on failures).
 */
export function useVideoExports(
  jobId: string | null,
  seed: VideoExport[] | undefined,
): UseVideoExportsReturn {
  const [state, setState] = useState<{ jobId: string | null; list: VideoExport[] }>({
    jobId,
    list: seed ?? [],
  });
  const [creating, setCreating] = useState<ExportAspectRatio | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState('');
  const [pollFailures, setPollFailures] = useState(0);
  const idRef = useRef(jobId);
  const listRef = useRef<VideoExport[]>(seed ?? []);

  const apply = useCallback((forId: string, next: VideoExport[]) => {
    if (forId !== idRef.current) return;
    const msg = exportTransitionMessage(listRef.current, next);
    if (msg) setLiveMessage(msg);
    listRef.current = next;
    setState({ jobId: forId, list: next });
  }, []);

  // Reset and load when the job changes.
  useEffect(() => {
    idRef.current = jobId;
    let cancelled = false;
    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      listRef.current = seed ?? [];
      setState({ jobId, list: seed ?? [] });
      setError(null);
      setLiveMessage('');
      setPollFailures(0);
      if (!jobId) return;
      try {
        const list = await creativeApi.listExports(jobId);
        if (!cancelled) apply(jobId, list);
      } catch {
        if (!cancelled) setError('Impossible de charger les formats exportés.');
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
    // seed only initialises a new job; later job polls must not reset the list.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [jobId, apply]);

  const list = state.jobId === jobId ? state.list : (seed ?? EMPTY);

  useEffect(() => {
    if (!jobId || !anyExportInFlight(list) || creating || pollFailures >= MAX_POLL_FAILURES) {
      return;
    }
    const timer = setTimeout(
      async () => {
        try {
          apply(jobId, await creativeApi.listExports(jobId));
          setPollFailures(0);
        } catch {
          if (jobId !== idRef.current) return;
          const failures = pollFailures + 1;
          setPollFailures(failures);
          if (failures >= MAX_POLL_FAILURES) {
            setError("Impossible de suivre l'avancement des exports. Rechargez la page.");
          }
        }
      },
      POLL_MS * 2 ** pollFailures,
    );
    return () => clearTimeout(timer);
  }, [jobId, list, apply, creating, pollFailures]);

  const create = useCallback(
    async (ratio: ExportAspectRatio) => {
      const id = idRef.current;
      if (!id) return false;
      setCreating(ratio);
      setError(null);
      try {
        // The music comes from the setup (music_preferences), so no track_id here.
        const created = await creativeApi.createExport(id, { aspect_ratio: ratio });
        // Idempotent POST may answer an existing export: replace it by id.
        apply(id, [...listRef.current.filter((e) => e.id !== created.id), created]);
        setPollFailures(0);
        return true;
      } catch (err: unknown) {
        if (id === idRef.current) {
          const detail = err instanceof Error && err.message ? ` ${err.message}` : '';
          setError(`L'export en ${ratio} n'a pas pu être lancé.${detail}`);
        }
        return false;
      } finally {
        setCreating(null);
      }
    },
    [apply],
  );

  return { exports: list, creating, error, liveMessage, create };
}
