'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { creativeApi } from '../lib/api/creative';
import {
  ProductIntelligenceReport,
  UGCSetup,
  UGCSetupCreatePayload,
  CreativeStrategy,
  Storyboard,
  StoryboardUpdatePayload,
  VideoGenerationJob,
} from '../lib/types/creative';

export interface UseCreativeReturn {
  // State
  intelligence: ProductIntelligenceReport | null;
  ugcSetup: UGCSetup | null;
  strategy: CreativeStrategy | null;
  storyboard: Storyboard | null;
  activeJob: VideoGenerationJob | null;

  // Loading & Error flags
  isLoadingIntelligence: boolean;
  isSavingUgcSetup: boolean;
  isGeneratingStrategy: boolean;
  isValidatingStrategy: boolean;
  isGeneratingStoryboard: boolean;
  isUpdatingStoryboard: boolean;
  isStartingJob: boolean;
  isPollingJob: boolean;
  error: string | null;

  // Actions
  fetchIntelligence: (productId: string) => Promise<ProductIntelligenceReport | null>;
  fetchUgcSetup: (productId: string) => Promise<UGCSetup | null>;
  saveUgcSetup: (payload: UGCSetupCreatePayload) => Promise<UGCSetup | null>;
  generateStrategy: (
    productId: string,
    customInstructions?: string,
  ) => Promise<CreativeStrategy | null>;
  validateStrategy: (strategyId: string) => Promise<CreativeStrategy | null>;
  generateStoryboard: (strategyId: string) => Promise<Storyboard | null>;
  updateStoryboard: (
    storyboardId: string,
    payload: StoryboardUpdatePayload,
  ) => Promise<Storyboard | null>;
  startVideoGeneration: (
    productId: string,
    storyboardId: string,
  ) => Promise<VideoGenerationJob | null>;
  cancelVideoGeneration: (jobId: string) => Promise<void>;
  resetError: () => void;
  setStoryboardDirect: (sb: Storyboard) => void;
}

export function useCreative(initialProductId?: string): UseCreativeReturn {
  const [intelligence, setIntelligence] = useState<ProductIntelligenceReport | null>(null);
  const [ugcSetup, setUgcSetup] = useState<UGCSetup | null>(null);
  const [strategy, setStrategy] = useState<CreativeStrategy | null>(null);
  const [storyboard, setStoryboard] = useState<Storyboard | null>(null);
  const [activeJob, setActiveJob] = useState<VideoGenerationJob | null>(null);

  const [isLoadingIntelligence, setIsLoadingIntelligence] = useState(false);
  const [isSavingUgcSetup, setIsSavingUgcSetup] = useState(false);
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [isValidatingStrategy, setIsValidatingStrategy] = useState(false);
  const [isGeneratingStoryboard, setIsGeneratingStoryboard] = useState(false);
  const [isUpdatingStoryboard, setIsUpdatingStoryboard] = useState(false);
  const [isStartingJob, setIsStartingJob] = useState(false);
  const [isPollingJob, setIsPollingJob] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetError = useCallback(() => setError(null), []);

  // 1. Product Intelligence
  const fetchIntelligence = useCallback(async (productId: string) => {
    setIsLoadingIntelligence(true);
    setError(null);
    try {
      const data = await creativeApi.getProductIntelligence(productId);
      setIntelligence(data);
      return data;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Impossible de charger les données du produit.';
      setError(msg);
      return null;
    } finally {
      setIsLoadingIntelligence(false);
    }
  }, []);

  // 2. UGC Setup
  const fetchUgcSetup = useCallback(async (productId: string) => {
    try {
      const data = await creativeApi.getUGCSetup(productId);
      setUgcSetup(data);
      return data;
    } catch {
      // 404 or empty is expected if not created yet
      return null;
    }
  }, []);

  const saveUgcSetup = useCallback(async (payload: UGCSetupCreatePayload) => {
    setIsSavingUgcSetup(true);
    setError(null);
    try {
      const data = await creativeApi.saveUGCSetup(payload);
      setUgcSetup(data);
      return data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erreur lors de la configuration UGC.';
      setError(msg);
      return null;
    } finally {
      setIsSavingUgcSetup(false);
    }
  }, []);

  // 3. Creative Strategy
  const generateStrategy = useCallback(async (productId: string, customInstructions?: string) => {
    setIsGeneratingStrategy(true);
    setError(null);
    try {
      const data = await creativeApi.generateStrategy({
        product_id: productId,
        custom_instructions: customInstructions,
      });
      setStrategy(data);
      return data;
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : 'Erreur lors de la génération de la stratégie créative.';
      setError(msg);
      return null;
    } finally {
      setIsGeneratingStrategy(false);
    }
  }, []);

  const validateStrategy = useCallback(async (strategyId: string) => {
    setIsValidatingStrategy(true);
    setError(null);
    try {
      const data = await creativeApi.validateStrategy(strategyId);
      setStrategy(data);
      return data;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Erreur lors de la validation de la stratégie.';
      setError(msg);
      return null;
    } finally {
      setIsValidatingStrategy(false);
    }
  }, []);

  // 4. Storyboard
  const generateStoryboard = useCallback(async (strategyId: string) => {
    setIsGeneratingStoryboard(true);
    setError(null);
    try {
      const data = await creativeApi.generateStoryboard(strategyId);
      setStoryboard(data);
      return data;
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Erreur lors de la génération du storyboard.';
      setError(msg);
      return null;
    } finally {
      setIsGeneratingStoryboard(false);
    }
  }, []);

  const updateStoryboard = useCallback(
    async (storyboardId: string, payload: StoryboardUpdatePayload) => {
      setIsUpdatingStoryboard(true);
      setError(null);
      try {
        const data = await creativeApi.updateStoryboard(storyboardId, payload);
        setStoryboard(data);
        return data;
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : 'Erreur lors de la mise à jour du storyboard.';
        setError(msg);
        return null;
      } finally {
        setIsUpdatingStoryboard(false);
      }
    },
    [],
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
      setError(null);
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
        const msg =
          err instanceof Error ? err.message : 'Erreur lors du lancement de la génération vidéo.';
        setError(msg);
        return null;
      } finally {
        setIsStartingJob(false);
      }
    },
    [stopPolling],
  );

  const cancelVideoGeneration = useCallback(
    async (jobId: string) => {
      try {
        const job = await creativeApi.cancelVideoJob(jobId);
        setActiveJob(job);
        stopPolling();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Erreur lors de l'annulation de la vidéo.";
        setError(msg);
      }
    },
    [stopPolling],
  );

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      stopPolling();
    };
  }, [stopPolling]);

  // Initial load if initialProductId passed
  useEffect(() => {
    let isCancelled = false;
    if (initialProductId) {
      const load = async () => {
        await Promise.resolve();
        if (!isCancelled) {
          await fetchIntelligence(initialProductId);
          await fetchUgcSetup(initialProductId);
        }
      };
      void load();
    }
    return () => {
      isCancelled = true;
    };
  }, [initialProductId, fetchIntelligence, fetchUgcSetup]);

  return {
    intelligence,
    ugcSetup,
    strategy,
    storyboard,
    activeJob,
    isLoadingIntelligence,
    isSavingUgcSetup,
    isGeneratingStrategy,
    isValidatingStrategy,
    isGeneratingStoryboard,
    isUpdatingStoryboard,
    isStartingJob,
    isPollingJob,
    error,
    fetchIntelligence,
    fetchUgcSetup,
    saveUgcSetup,
    generateStrategy,
    validateStrategy,
    generateStoryboard,
    updateStoryboard,
    startVideoGeneration,
    cancelVideoGeneration,
    resetError,
    setStoryboardDirect: setStoryboard,
  };
}
