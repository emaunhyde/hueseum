import { useState, useEffect, useCallback } from 'react';
import { getMunsellMatchFromHex, MunsellMatchResponse } from '@/lib/munsell';

export interface UseMunsellMatchResult {
  munsellData: MunsellMatchResponse | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

/**
 * Hook for fetching Munsell match data for a given hex color
 */
export function useMunsellMatch(hex: string | null | undefined): UseMunsellMatchResult {
  const [munsellData, setMunsellData] = useState<MunsellMatchResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMunsellMatch = useCallback(async (hexColor: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await getMunsellMatchFromHex(hexColor);
      setMunsellData(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch Munsell match';
      setError(errorMessage);
      setMunsellData(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(() => {
    if (hex) {
      fetchMunsellMatch(hex);
    }
  }, [hex, fetchMunsellMatch]);

  useEffect(() => {
    if (hex) {
      fetchMunsellMatch(hex);
    } else {
      setMunsellData(null);
      setError(null);
      setIsLoading(false);
    }
  }, [hex, fetchMunsellMatch]);

  return {
    munsellData,
    isLoading,
    error,
    refetch,
  };
} 