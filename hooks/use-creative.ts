'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { creativeApi } from '../lib/api/creative';
import { ApiRequestError } from '../lib/api/core';
import {
  CreativeConfig,
  CreativeConfigCreatePayload,
  CreativeStrategy,
  Storyboard,
  StoryboardUpdatePayload,
  StoryboardVersionSummary,
  StrategyCost,
  QualityTier,
  VideoGenerationJob,
} from '../lib/types/creative';
import { isTerminalJob, shotTransitionMessage } from '../lib/render-rules.mjs';

export interface UseCreativeReturn {
  // State
  creativeConfig: CreativeConfig | null;
  strategy: CreativeStrategy | null;
  storyboard: Storyboard | null;
  storyboardVersions: StoryboardVersionSummary[];
  cost: StrategyCost | null;
  activeJob: VideoGenerationJob | null;
  /** Polite live-region text for shot status changes ("Plan 2 : Terminé."). */
  jobLiveMessage: string;

  // Loading & Error flags
  isSavingConfig: boolean;
  isGeneratingStrategy: boolean;
  isGeneratingStoryboard: boolean;
  isUpdatingStoryboard: boolean;
  isAcceptingStoryboard: boolean;
  isStartingJob: boolean;
  isPollingJob: boolean;
  error: string | null;
  /** HTTP status of the last error (409 = precondition, e.g. product analysis missing). */
  errorStatus: number | null;

  // Actions
  fetchCreativeConfig: (productId: string) => Promise<CreativeConfig | null>;
  saveCreativeConfig: (payload: CreativeConfigCreatePayload) => Promise<CreativeConfig | null>;
  generateStrategy: (
    productId: string,
    options?: { configId?: string; customInstructions?: string; force?: boolean },
  ) => Promise<CreativeStrategy | null>;
  generateStoryboardForAngle: (
    strategyId: string,
    angleId: string,
    force?: boolean,
  ) => Promise<Storyboard | null>;
  loadStoryboard: (storyboardId: string) => Promise<Storyboard | null>;
  updateStoryboard: (
    storyboardId: string,
    payload: StoryboardUpdatePayload,
  ) => Promise<Storyboard | null>;
  acceptStoryboard: (storyboardId: string) => Promise<Storyboard | null>;
  startVideoGeneration: (
    productId: string,
    storyboardId: string,
    qualityTier?: QualityTier,
  ) => Promise<VideoGenerationJob | null>;
  cancelVideoGeneration: (jobId: string) => Promise<void>;
  retryVideoGeneration: (jobId: string) => Promise<VideoGenerationJob | null>;
  /** Confirmed re-render of a shot that may already have been billed. */
  rerenderShot: (jobId: string, shotId: string) => Promise<boolean>;
  resetError: () => void;
}

export function useCreative(initialProductId?: string): UseCreativeReturn {
  const [creativeConfig, setCreativeConfig] = useState<CreativeConfig | null>(null);
  const [strategy, setStrategy] = useState<CreativeStrategy | null>(null);
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [storyboardVersions, setStoryboardVersions] = useState<StoryboardVersionSummary[]>([]);
  const [cost, setCost] = useState<StrategyCost | null>(null);
  const [activeJob, setActiveJob] = useState<VideoGenerationJob | null>(null);

  const [isSavingConfig, setIsSavingConfig] = useState(false);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);
  const [isUpdatingStoryboard, setIsUpdatingStoryboard] = useState(false);
  const [isAcceptingStoryboard, setIsAcceptingStoryboard] = useState(false);
  const [isStartingJob, setIsStartingJob] = useState(false);
  const [isPollingJob, setIsPollingJob] = useState(false);
  const [errorState, setErrorState] = useState<{ message: string; status: number | null } | null>(
    null,
  );

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  // Last job shown: the poll diffs against it for the live announcement.
  const jobRef = useRef<VideoGenerationJob | null>(null);
  const [jobLiveMessage, setJobLiveMessage] = useState('');

  const resetError = useCallback(() => setErrorState(null), []);
  const fail = useCallback((err: unknown, fallback: string) => {
    setErrorState({
      message: err instanceof Error && err.message ? err.message : fallback,
      status: err instanceof ApiRequestError ? err.status : null,
    });
  }, []);

  // 2. Creative configuration
  const fetchCreativeConfig = useCallback(
    async (productId: string) => {
      try {
        const data = await creativeApi.getCreativeConfig(productId);
        setCreativeConfig(data);
        return data;
      } catch (err: unknown) {
        fail(err, 'Impossible de charger la configuration créative.');
        return null;
      }
    },
    [fail],
  );

  const saveCreativeConfig = useCallback(
    async (payload: CreativeConfigCreatePayload) => {
      setIsSavingConfig(true);
      setErrorState(null);
      try {
        const data = await creativeApi.saveCreativeConfig(payload);
        setCreativeConfig(data);
        return data;
      } catch (err: unknown) {
        fail(err, "Erreur lors de l'enregistrement de la configuration créative.");
        return null;
      } finally {
        setIsSavingConfig(false);
      }
    },
    [fail],
  );

  // Race guards. epoch: bumped when the strategy (or product) changes, so results that
  // belong to a previous strategy are dropped. sbSeq: only the newest storyboard
  // response may replace the displayed one. inFlight: one paid call per action at a time.
  const epochRef = useRef(0);
  const sbSeqRef = useRef(0);
  const inFlightRef = useRef(new Set<string>());
  const claim = (action: string) => {
    if (inFlightRef.current.has(action)) return false;
    inFlightRef.current.add(action);
    return true;
  };
  const release = (action: string) => inFlightRef.current.delete(action);

  // Versions + cumulated cost are secondary: a failure must not hide the storyboard itself.
  const refreshStoryboardContext = useCallback(async (strategyId: string, epoch: number) => {
    const [versions, strategyCost] = await Promise.allSettled([
      creativeApi.listStoryboards(strategyId),
      creativeApi.getStrategyCost(strategyId),
    ]);
    if (epoch !== epochRef.current) return;
    setStoryboardVersions(versions.status === 'fulfilled' ? versions.value : []);
    setCost(strategyCost.status === 'fulfilled' ? strategyCost.value : null);
  }, []);

  // 3. Brief + angles
  const generateStrategy = useCallback(
    async (
      productId: string,
      options: { configId?: string; customInstructions?: string; force?: boolean } = {},
    ) => {
      if (!claim('strategy')) return null;
      const epoch = ++epochRef.current;
      setIsGeneratingStrategy(true);
      setErrorState(null);
      try {
        const data = await creativeApi.generateStrategy({
          product_id: productId,
          config_id: options.configId,
          custom_instructions: options.customInstructions,
          force: options.force,
        });
        if (epoch !== epochRef.current) return null;
        sbSeqRef.current += 1;
        setStrategy(data);
        setStoryboard(null);
        setStoryboardVersions([]);
        setCost(null);
        return data;
      } catch (err: unknown) {
        if (epoch === epochRef.current) {
          fail(err, 'Erreur lors de la génération des angles créatifs.');
        }
        return null;
      } finally {
        release('strategy');
        setIsGeneratingStrategy(false);
      }
    },
    [fail],
  );

  // 4. Storyboard
  const generateStoryboardForAngle = useCallback(
    async (strategyId: string, angleId: string, force = false) => {
      if (!claim('storyboard')) return null;
      const epoch = epochRef.current;
      const seq = ++sbSeqRef.current;
      setIsGeneratingStoryboard(true);
      setErrorState(null);
      try {
        const chosen = await creativeApi.chooseAngle(strategyId, angleId);
        if (epoch !== epochRef.current) return null;
        // The choice is persisted server-side even if the storyboard call fails below, so
        // the state mirrors the server. Keep the generation cost/reuse of the strategy.
        setStrategy((prev) =>
          prev && prev.id === chosen.id
            ? {
                ...chosen,
                reused: prev.reused,
                input_tokens: prev.input_tokens,
                output_tokens: prev.output_tokens,
                estimated_cost_usd: prev.estimated_cost_usd,
                actual_cost_usd: prev.actual_cost_usd,
              }
            : chosen,
        );
        const data = await creativeApi.generateStoryboard(strategyId, force);
        if (epoch !== epochRef.current) return null;
        if (seq === sbSeqRef.current) setStoryboard(data);
        await refreshStoryboardContext(strategyId, epoch);
        return data;
      } catch (err: unknown) {
        if (epoch === epochRef.current) fail(err, 'Erreur lors de la génération du storyboard.');
        return null;
      } finally {
        release('storyboard');
        setIsGeneratingStoryboard(false);
      }
    },
    [fail, refreshStoryboardContext],
  );

  const loadStoryboard = useCallback(
    async (storyboardId: string) => {
      const epoch = epochRef.current;
      const seq = ++sbSeqRef.current;
      setErrorState(null);
      try {
        const data = await creativeApi.getStoryboard(storyboardId);
        if (epoch !== epochRef.current || seq !== sbSeqRef.current) return null;
        setStoryboard(data);
        return data;
      } catch (err: unknown) {
        if (seq === sbSeqRef.current) {
          fail(err, 'Impossible de charger cette version du storyboard.');
        }
        return null;
      }
    },
    [fail],
  );

  const updateStoryboard = useCallback(
    async (storyboardId: string, payload: StoryboardUpdatePayload) => {
      if (!claim('update')) return null;
      const epoch = epochRef.current;
      const seq = ++sbSeqRef.current;
      setIsUpdatingStoryboard(true);
      setErrorState(null);
      try {
        // The API answers with a new version; the edited one stays immutable.
        const data = await creativeApi.updateStoryboard(storyboardId, payload);
        if (epoch !== epochRef.current) return null;
        if (seq === sbSeqRef.current) setStoryboard(data);
        await refreshStoryboardContext(data.strategy_id, epoch);
        return data;
      } catch (err: unknown) {
        if (epoch === epochRef.current) fail(err, "Erreur lors de l'enregistrement du storyboard.");
        return null;
      } finally {
        release('update');
        setIsUpdatingStoryboard(false);
      }
    },
    [fail, refreshStoryboardContext],
  );

  const acceptStoryboard = useCallback(
    async (storyboardId: string) => {
      if (!claim('accept')) return null;
      const epoch = epochRef.current;
      const seq = ++sbSeqRef.current;
      setIsAcceptingStoryboard(true);
      setErrorState(null);
      try {
        const data = await creativeApi.acceptStoryboard(storyboardId);
        if (epoch !== epochRef.current) return null;
        if (seq === sbSeqRef.current) setStoryboard(data);
        await refreshStoryboardContext(data.strategy_id, epoch);
        return data;
      } catch (err: unknown) {
        if (epoch === epochRef.current) fail(err, "Erreur lors de l'acceptation du storyboard.");
        return null;
      } finally {
        release('accept');
        setIsAcceptingStoryboard(false);
      }
    },
    [fail, refreshStoryboardContext],
  );

  // Polling helper. pollSeq is bumped on every stop/restart: an in-flight poll that resolves
  // afterwards (e.g. after a cancel, retry or rerender) is dropped instead of overwriting.
  const pollSeqRef = useRef(0);
  const stopPolling = useCallback(() => {
    pollSeqRef.current += 1;
    if (pollIntervalRef.current) {
      clearTimeout(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPollingJob(false);
  }, []);

  // The live region is cleared first so a message identical to the previous one is re-announced.
  const announce = useCallback((message: string) => {
    setJobLiveMessage('');
    setTimeout(() => setJobLiveMessage(message), 100);
  }, []);

  const showJob = useCallback(
    (next: VideoGenerationJob) => {
      const prev = jobRef.current;
      const message = prev && prev.id === next.id ? shotTransitionMessage(prev, next) : '';
      jobRef.current = next;
      setActiveJob(next);
      if (message) announce(message);
    },
    [announce],
  );

  // 5. Video Generation Job
  // Shows a job and polls it (chained 2 s timeouts, never overlapping) until it settles.
  // settlePolls: extra polls after a terminal state (cancel: costs still reconciling).
  const trackJob = useCallback(
    (job: VideoGenerationJob, settlePolls = 0) => {
      stopPolling();
      const seq = pollSeqRef.current;
      if (jobRef.current?.id !== job.id) setJobLiveMessage('');
      showJob(job);
      let extra = settlePolls;
      let refetchedForShots = false;
      // true = keep polling. A terminal job without shots is fetched once more before
      // settling: the per-shot data (mock flags) may land just after the status.
      const keepPolling = (j: VideoGenerationJob) => {
        if (!isTerminalJob(j.status)) return true;
        if (!j.shots?.length && !refetchedForShots) {
          refetchedForShots = true;
          return true;
        }
        if (extra > 0) {
          extra -= 1;
          return true;
        }
        return false;
      };
      if (!keepPolling(job)) return;
      setIsPollingJob(true);
      const tick = async () => {
        let again = true;
        try {
          const updated = await creativeApi.getVideoJob(job.id);
          if (seq !== pollSeqRef.current) return;
          showJob(updated);
          again = keepPolling(updated);
        } catch {
          // Keep polling on intermittent network failure
        }
        if (seq !== pollSeqRef.current) return;
        if (again) pollIntervalRef.current = setTimeout(tick, 2000);
        else stopPolling();
      };
      pollIntervalRef.current = setTimeout(tick, 2000);
    },
    [showJob, stopPolling],
  );

  const startVideoGeneration = useCallback(
    async (productId: string, storyboardId: string, qualityTier: QualityTier = 'standard') => {
      const epoch = epochRef.current;
      setIsStartingJob(true);
      setErrorState(null);
      stopPolling();

      try {
        const job = await creativeApi.generateVideo({
          product_id: productId,
          storyboard_id: storyboardId,
          quality_tier: qualityTier,
        });
        if (epoch !== epochRef.current) return null;
        trackJob(job);
        return job;
      } catch (err: unknown) {
        if (epoch === epochRef.current) {
          fail(err, 'Erreur lors du lancement de la génération vidéo.');
        }
        return null;
      } finally {
        setIsStartingJob(false);
      }
    },
    [fail, stopPolling, trackJob],
  );

  const cancelVideoGeneration = useCallback(
    async (jobId: string) => {
      const epoch = epochRef.current;
      try {
        const job = await creativeApi.cancelVideoJob(jobId);
        if (epoch !== epochRef.current) return;
        // In-flight attempts are still polled server-side for their cost: follow them a bit.
        trackJob(job, 2);
      } catch (err: unknown) {
        if (epoch === epochRef.current) fail(err, "Erreur lors de l'annulation de la vidéo.");
      }
    },
    [fail, trackJob],
  );

  const retryVideoGeneration = useCallback(
    async (jobId: string) => {
      const epoch = epochRef.current;
      setIsStartingJob(true);
      setErrorState(null);
      stopPolling();
      try {
        const job = await creativeApi.retryJob(jobId);
        if (epoch !== epochRef.current) return null;
        trackJob(job);
        return job;
      } catch (err: unknown) {
        if (epoch === epochRef.current) fail(err, 'Erreur lors de la reprise du rendu vidéo.');
        return null;
      } finally {
        setIsStartingJob(false);
      }
    },
    [fail, stopPolling, trackJob],
  );

  const rerenderShot = useCallback(
    async (jobId: string, shotId: string) => {
      const epoch = epochRef.current;
      setErrorState(null);
      try {
        await creativeApi.rerenderShot(jobId, shotId, { confirm_cost: true });
      } catch (err: unknown) {
        if (epoch === epochRef.current) fail(err, 'Erreur lors de la relance du plan.');
        return false;
      }
      // The paid rerender is accepted: never report failure from here on (no second click).
      if (epoch !== epochRef.current) return true;
      const current = jobRef.current;
      try {
        const job = await creativeApi.getVideoJob(jobId);
        if (epoch === epochRef.current) trackJob(job);
      } catch {
        // Poll at least once more so the new attempt shows up.
        if (epoch === epochRef.current && current?.id === jobId) trackJob(current, 1);
      }
      return true;
    },
    [fail, trackJob],
  );

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Load (and reset everything) when the product changes; ignore answers for an old product.
  useEffect(() => {
    let isCancelled = false;
    const load = async () => {
      await Promise.resolve();
      if (isCancelled) return;
      epochRef.current += 1;
      sbSeqRef.current += 1;
      stopPolling();
      setCreativeConfig(null);
      setStrategy(null);
      setStoryboard(null);
      setStoryboardVersions([]);
      setCost(null);
      setActiveJob(null);
      jobRef.current = null;
      setErrorState(null);
      if (!initialProductId) return;
      const epoch = epochRef.current;
      const stale = () => isCancelled || epoch !== epochRef.current;
      try {
        const data = await creativeApi.getCreativeConfig(initialProductId);
        if (!isCancelled) setCreativeConfig(data);
      } catch (err: unknown) {
        if (!isCancelled) fail(err, 'Impossible de charger la configuration créative.');
      }
      if (stale()) return;
      // Restore the work after a reload: latest strategy, then its accepted (else latest)
      // storyboard version through loadStoryboard, then versions + cost. Never blocks the page.
      try {
        const latest = await creativeApi.getLatestStrategy(initialProductId);
        if (stale() || !latest) return;
        setStrategy(latest);
        const versions = await creativeApi.listStoryboards(latest.id);
        if (stale() || versions.length === 0) return;
        const pick =
          versions.find((v) => v.accepted) ??
          versions.reduce((a, b) => (b.version > a.version ? b : a));
        const sb = await loadStoryboard(pick.id);
        if (stale()) return;
        if (!sb) throw new Error('storyboard');
        await refreshStoryboardContext(latest.id, epoch);
      } catch {
        if (stale()) return;
        setStrategy(null);
        setStoryboard(null);
        setStoryboardVersions([]);
        setCost(null);
        setErrorState({ message: 'Impossible de restaurer la stratégie.', status: null });
      }
    };
    void load();
    return () => {
      isCancelled = true;
    };
  }, [initialProductId, fail, stopPolling, loadStoryboard, refreshStoryboardContext]);

  return {
    creativeConfig,
    strategy,
    storyboard,
    storyboardVersions,
    cost,
    activeJob,
    jobLiveMessage,
    isSavingConfig,
    isGeneratingStrategy,
    isGeneratingStoryboard,
    isUpdatingStoryboard,
    isAcceptingStoryboard,
    isStartingJob,
    isPollingJob,
    error: errorState?.message ?? null,
    errorStatus: errorState?.status ?? null,
    fetchCreativeConfig,
    saveCreativeConfig,
    generateStrategy,
    generateStoryboardForAngle,
    loadStoryboard,
    updateStoryboard,
    acceptStoryboard,
    startVideoGeneration,
    cancelVideoGeneration,
    retryVideoGeneration,
    rerenderShot,
    resetError,
  };
}
