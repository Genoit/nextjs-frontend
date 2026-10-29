'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { assetsApi } from '../lib/api/assets';
import { fetchBlobWithAuth, getApiBaseUrl } from '../lib/api/core';
import { AssetBoard, SourceMode } from '../lib/types/assets';
import { isInFlight, transitionMessage } from '../lib/asset-rules.mjs';
import { mediaSource } from '../lib/finishing-rules.mjs';

const POLL_MS = 2000;
const MAX_POLL_FAILURES = 3;

export interface UseAssetsReturn {
  board: AssetBoard | null;
  isLoading: boolean;
  loadError: string | null;
  isPreparing: boolean;
  /** Plan whose source change or retry is in flight. */
  busyPlanId: string | null;
  /** Action error, shown in the workflow's global alert banner. */
  error: string | null;
  /** Polite live-region text ("Plan 3 : traitement terminé."). */
  liveMessage: string;
  reload: () => Promise<void>;
  prepare: () => Promise<void>;
  setSourceMode: (planId: string, mode: SourceMode) => Promise<boolean>;
  retry: (planId: string) => Promise<void>;
  resetError: () => void;
}

/** Asset board of one accepted storyboard (null id = nothing to load). */
export function useAssets(storyboardId: string | null): UseAssetsReturn {
  const [board, setBoard] = useState<AssetBoard | null>(null);
  const [isLoading, setIsLoading] = useState(!!storyboardId);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isPreparing, setIsPreparing] = useState(false);
  const [busyPlanId, setBusyPlanId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [liveMessage, setLiveMessage] = useState('');
  // Bumped after a failed poll so the poll effect re-arms with a longer delay.
  const [pollFailures, setPollFailures] = useState(0);

  // Answers for a previous storyboard are dropped; boardRef feeds the live diff.
  const idRef = useRef(storyboardId);
  const boardRef = useRef<AssetBoard | null>(null);
  // Every request takes a sequence number; an answer older than the last applied one
  // (e.g. a poll that resolves after a PATCH) is dropped.
  const seqRef = useRef(0);
  const appliedRef = useRef(0);
  const nextSeq = () => ++seqRef.current;

  const apply = useCallback((forId: string, seq: number, next: AssetBoard | null) => {
    if (forId !== idRef.current || seq < appliedRef.current) return;
    appliedRef.current = seq;
    if (next) {
      const msg = transitionMessage(boardRef.current, next);
      if (msg) setLiveMessage(msg);
    }
    boardRef.current = next;
    setBoard(next);
  }, []);

  const reload = useCallback(async () => {
    const id = idRef.current;
    if (!id) return;
    const seq = nextSeq();
    setIsLoading(true);
    setLoadError(null);
    setPollFailures(0);
    try {
      apply(id, seq, await assetsApi.getBoard(id));
    } catch {
      if (id === idRef.current) setLoadError('Impossible de charger les visuels.');
    } finally {
      if (id === idRef.current) setIsLoading(false);
    }
  }, [apply]);

  // Reset and load when the accepted storyboard changes.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      await Promise.resolve();
      if (cancelled) return;
      idRef.current = storyboardId;
      boardRef.current = null;
      appliedRef.current = seqRef.current;
      setBoard(null);
      setLoadError(null);
      setError(null);
      setLiveMessage('');
      setBusyPlanId(null);
      setPollFailures(0);
      if (!storyboardId) setIsLoading(false);
      await reload();
    };
    void run();
    return () => {
      cancelled = true;
    };
  }, [storyboardId, reload]);

  // Poll while a job is pending or running, never during a user action (its answer wins).
  // Each new board re-arms the timer; failures back off and stop after MAX_POLL_FAILURES.
  useEffect(() => {
    const id = board?.storyboard_id;
    if (!id || !board.plans.some(isInFlight) || busyPlanId || isPreparing) return;
    if (pollFailures >= MAX_POLL_FAILURES) return;
    const timer = setTimeout(
      async () => {
        const seq = nextSeq();
        try {
          apply(id, seq, await assetsApi.getBoard(id));
          setPollFailures(0);
        } catch {
          if (id !== idRef.current) return;
          const failures = pollFailures + 1;
          setPollFailures(failures);
          if (failures >= MAX_POLL_FAILURES) setLoadError('Impossible de charger les visuels.');
        }
      },
      POLL_MS * 2 ** pollFailures,
    );
    return () => clearTimeout(timer);
  }, [board, apply, busyPlanId, isPreparing, pollFailures]);

  const prepareWith = useCallback(
    async (force: boolean, planId: string | null) => {
      const id = idRef.current;
      if (!id) return;
      if (planId) setBusyPlanId(planId);
      else setIsPreparing(true);
      setError(null);
      const seq = nextSeq();
      try {
        apply(id, seq, await assetsApi.prepare(id, force));
      } catch (err: unknown) {
        if (id !== idRef.current) return;
        const detail = err instanceof Error && err.message ? ` ${err.message}` : '';
        setError(
          (force
            ? 'Erreur lors de la relance du traitement.'
            : 'Erreur lors de la préparation des visuels.') + detail,
        );
      } finally {
        setIsPreparing(false);
        setBusyPlanId(null);
      }
    },
    [apply],
  );

  const prepare = useCallback(() => prepareWith(false, null), [prepareWith]);
  const retry = useCallback((planId: string) => prepareWith(true, planId), [prepareWith]);

  const setSourceMode = useCallback(
    async (planId: string, mode: SourceMode) => {
      const id = idRef.current;
      if (!id) return false;
      const order = boardRef.current?.plans.find((p) => p.id === planId)?.scene_order;
      setBusyPlanId(planId);
      setError(null);
      const seq = nextSeq();
      try {
        apply(id, seq, await assetsApi.setSourceMode(planId, mode));
        return true;
      } catch (err: unknown) {
        if (id === idRef.current) {
          const detail = err instanceof Error && err.message ? ` ${err.message}` : '';
          setError(`Erreur lors de la modification de la source du plan ${order ?? ''}.${detail}`);
        }
        return false;
      } finally {
        setBusyPlanId(null);
      }
    },
    [apply],
  );

  return {
    board,
    isLoading,
    loadError,
    isPreparing,
    busyPlanId,
    error,
    liveMessage,
    reload,
    prepare,
    setSourceMode,
    retry,
    resetError: useCallback(() => setError(null), []),
  };
}

/**
 * Object URL of an owner-only media asset, fetched with the Bearer token.
 * Revoked when the id changes or the component unmounts.
 */
export function useMediaUrl(assetId: string | null): { url: string | null; failed: boolean } {
  return useAuthedBlobUrl(assetId ? assetsApi.mediaPath(assetId) : null);
}

/** Object URL of any owner-only endpoint (revoked on change/unmount); null endpoint = nothing. */
export function useAuthedBlobUrl(endpoint: string | null): { url: string | null; failed: boolean } {
  const [state, setState] = useState<{ id: string; url: string | null; failed: boolean } | null>(
    null,
  );
  useEffect(() => {
    if (!endpoint) return;
    let cancelled = false;
    let url: string | null = null;
    fetchBlobWithAuth(endpoint)
      .then((blob) => {
        if (cancelled) return;
        url = URL.createObjectURL(blob);
        setState({ id: endpoint, url, failed: false });
      })
      .catch(() => {
        if (!cancelled) setState({ id: endpoint, url: null, failed: true });
      });
    return () => {
      cancelled = true;
      if (url) URL.revokeObjectURL(url);
    };
  }, [endpoint]);
  return state && state.id === endpoint ? state : { url: null, failed: false };
}

/**
 * Displayable URL of a media URL given by the API (thumbnail): API paths are fetched with the
 * Bearer token, foreign (presigned) URLs are used directly.
 */
export function useApiMediaUrl(apiUrl: string | null | undefined): {
  url: string | null;
  failed: boolean;
} {
  const src = mediaSource(apiUrl, getApiBaseUrl());
  const authed = useAuthedBlobUrl(src?.kind === 'authed' ? src.endpoint : null);
  return src?.kind === 'direct' ? { url: src.url, failed: false } : authed;
}
