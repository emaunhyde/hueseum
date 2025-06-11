import { useState, useEffect, useCallback } from 'react';
import { getColorNameCached, ColorNameResult } from '@/lib/utils/color-naming';

export interface UseColorNameState {
  colorName: ColorNameResult | null;
  isLoading: boolean;
  error: string | null;
}

export interface UseColorNameReturn extends UseColorNameState {
  fetchColorName: (hex: string) => Promise<void>;
  reset: () => void;
}

/**
 * Hook to fetch and manage color name state for a given hex color
 */
export function useColorName(initialHex?: string): UseColorNameReturn {
  const [state, setState] = useState<UseColorNameState>({
    colorName: null,
    isLoading: false,
    error: null,
  });

  const fetchColorName = useCallback(async (hex: string) => {
    if (!hex) return;
    
    // Don't fetch if we're already loading the same hex or already have it
    const cleanHex = hex.replace('#', '').toUpperCase();
    
    setState(prev => {
      // If we already have this color or are currently loading it, don't fetch again
      if (prev.isLoading || (prev.colorName && prev.colorName.hex.replace('#', '').toUpperCase() === cleanHex)) {
        return prev;
      }
      
      return { ...prev, isLoading: true, error: null };
    });
    
    try {
      const result = await getColorNameCached(hex);
      setState(prev => {
        // Only update if we're still interested in this hex (prevent race conditions)
        if (prev.isLoading) {
          return {
            colorName: result,
            isLoading: false,
            error: null,
          };
        }
        return prev;
      });
    } catch (error) {
      setState(prev => {
        if (prev.isLoading) {
          return {
            colorName: null,
            isLoading: false,
            error: error instanceof Error ? error.message : 'Failed to fetch color name',
          };
        }
        return prev;
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      colorName: null,
      isLoading: false,
      error: null,
    });
  }, []);

  // Auto-fetch if initial hex is provided
  useEffect(() => {
    if (initialHex) {
      fetchColorName(initialHex);
    }
  }, [initialHex, fetchColorName]);

  return {
    ...state,
    fetchColorName,
    reset,
  };
}

/**
 * Hook for fetching multiple color names at once
 */
export function useColorNames() {
  const [state, setState] = useState<{
    colorNames: ColorNameResult[];
    isLoading: boolean;
    error: string | null;
  }>({
    colorNames: [],
    isLoading: false,
    error: null,
  });

  const fetchColorNames = useCallback(async (hexColors: string[]) => {
    if (!hexColors.length) return;
    
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // Fetch names individually using cache for better performance
      const results = await Promise.all(
        hexColors.map(hex => getColorNameCached(hex))
      );
      
      setState({
        colorNames: results,
        isLoading: false,
        error: null,
      });
    } catch (error) {
      setState({
        colorNames: [],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to fetch color names',
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({
      colorNames: [],
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    fetchColorNames,
    reset,
  };
} 