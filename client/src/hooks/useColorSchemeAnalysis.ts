import { useState, useEffect, useCallback } from 'react';
import { analyzeColorScheme, ColorSchemeAnalysis, ColorSchemeColor } from '@/lib/api/color-scheme';

export interface UseColorSchemeAnalysisResult {
  analysis: ColorSchemeAnalysis | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook for analyzing color scheme relationships in a palette
 */
export function useColorSchemeAnalysis(colors: ColorSchemeColor[] | null): UseColorSchemeAnalysisResult {
  const [analysis, setAnalysis] = useState<ColorSchemeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalysis = useCallback(async (colorPalette: ColorSchemeColor[]) => {
    if (!colorPalette || colorPalette.length === 0) {
      setAnalysis(null);
      setError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await analyzeColorScheme(colorPalette);
      setAnalysis(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to analyze color scheme';
      setError(errorMessage);
      setAnalysis(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (colors) {
      fetchAnalysis(colors);
    }
  }, [colors, fetchAnalysis]);

  useEffect(() => {
    if (colors && colors.length > 0) {
      fetchAnalysis(colors);
    } else {
      setAnalysis(null);
      setError(null);
      setIsLoading(false);
    }
  }, [colors, fetchAnalysis]);

  return {
    analysis,
    isLoading,
    error,
    refetch,
  };
} 