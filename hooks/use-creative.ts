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
  VideoGenerationJob,
} from '../lib/types/creative';

export interface UseCreativeReturn {
  // State
  creativeConfig: CreativeConfig | null;
  strategy: CreativeStrategy | null;
  storyboard: Storyboard | null;
  storyboardVersions: StoryboardVersionSummary[];
  cost: StrategyCost | null;
  activeJob: VideoGenerationJob | null;

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
  ) => Promise<VideoGenerationJob | null>;
  cancelVideoGeneration: (jobId: string) => Promise<void>;
  retryVideoGeneration: (jobId: string) => Promise<VideoGenerationJob | null>;
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

  // Polling helper
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
    setIsPollingJob(false);
  }, []);

  // 5. Video Generation Job
  const startVideoGeneration = useCallback(
    async (productId: string, storyboardId: string) => {
      setIsStartingJob(true);
      setErrorState(null);
      stopPolling();

      try {
        const job = await creativeApi.generateVideo({
          product_id: productId,
          storyboard_id: storyboardId,
        });
        setActiveJob(job);

        // Start polling if not already finished
        if (job.status !== 'completed' && job.status !== 'failed' && job.status !== 'cancelled') {
          setIsPollingJob(true);
          pollIntervalRef.current = setInterval(async () => {
            try {
              const updated = await creativeApi.getVideoJob(job.id);
              setActiveJob(updated);
              if (
                updated.status === 'completed' ||
                updated.status === 'failed' ||
                updated.status === 'cancelled'
              ) {
                stopPolling();
              }
            } catch {
              // Keep polling on intermittent network failure
            }
          }, 2000);
        }
        return job;
      } catch (err: unknown) {
        fail(err, 'Erreur lors du lancement de la génération vidéo.');
        return null;
      } finally {
        setIsStartingJob(false);
      }
    },
    [fail, stopPolling],
  );

  const cancelVideoGeneration = useCallback(
    async (jobId: string) => {
      try {
        const job = await creativeApi.cancelVideoJob(jobId);
        setActiveJob(job);
        stopPolling();
      } catch (err: unknown) {
        fail(err, "Erreur lors de l'annulation de la vidéo.");
      }
    },
    [fail, stopPolling],
  );

  const retryVideoGeneration = useCallback(
    async (jobId: string) => {
      setIsStartingJob(true);
      setErrorState(null);
      stopPolling();
      try {
        const job = await creativeApi.retryJob(jobId);
        setActiveJob(job);
        if (job.status !== 'completed' && job.status !== 'failed' && job.status !== 'cancelled') {
          setIsPollingJob(true);
          pollIntervalRef.current = setInterval(async () => {
            try {
              const updated = await creativeApi.getVideoJob(job.id);
              setActiveJob(updated);
              if (
                updated.status === 'completed' ||
                updated.status === 'failed' ||
                updated.status === 'cancelled'
              ) {
                stopPolling();
              }
            } catch {
              // Ignore polling blips
            }
          }, 2000);
        }
        return job;
      } catch (err: unknown) {
        fail(err, 'Erreur lors de la reprise du rendu vidéo.');
        return null;
      } finally {
        setIsStartingJob(false);
      }
    },
    [fail, stopPolling],
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
      setErrorState(null);
      if (!initialProductId) return;
      try {
        const data = await creativeApi.getCreativeConfig(initialProductId);
        if (!isCancelled) setCreativeConfig(data);
      } catch (err: unknown) {
        if (!isCancelled) fail(err, 'Impossible de charger la configuration créative.');
      }
    };
    void load();
    return () => {
      isCancelled = true;
    };
  }, [initialProductId, fail, stopPolling]);

  return {
    creativeConfig,
    strategy,
    storyboard,
    storyboardVersions,
    cost,
    activeJob,
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
    resetError,
  };
}
