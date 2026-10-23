'use client';

import { useCallback, useEffect, useState } from 'react';
import { productApi } from '../lib/api/product';
import { ProductAnalysis } from '../lib/types/product-analysis';

export interface UseProductAnalysisReturn {
  analysis: ProductAnalysis | null;
  isLoading: boolean;
  isAnalyzing: boolean;
  error: string | null;
  // Never called automatically: an analysis may be a paid LLM call.
  analyze: (force?: boolean) => Promise<ProductAnalysis | null>;
}

function messageOf(err: unknown, fallback: string): string {
  return err instanceof Error && err.message ? err.message : fallback;
}

export function useProductAnalysis(productId: string): UseProductAnalysisReturn {
  const [analysis, setAnalysis] = useState<ProductAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    productApi
      .getLatestAnalysis(productId)
      .then((data) => {
        if (!cancelled) setAnalysis(data);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(messageOf(err, "Impossible de charger l'analyse du produit."));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [productId]);

  const analyze = useCallback(
    async (force = false) => {
      setIsAnalyzing(true);
      setError(null);
      try {
        const data = await productApi.analyzeProduct(productId, force);
        setAnalysis(data);
        return data;
      } catch (err: unknown) {
        setError(messageOf(err, "L'analyse du produit a échoué."));
        return null;
      } finally {
        setIsAnalyzing(false);
      }
    },
    [productId],
  );

  return { analysis, isLoading, isAnalyzing, error, analyze };
}
