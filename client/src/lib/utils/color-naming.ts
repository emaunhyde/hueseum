export interface ColorNameResult {
  name: string;
  hex: string;
  isExact: boolean;
  source: 'api' | 'fallback';
}

export interface ColorNameError {
  error: string;
  hex: string;
}

/**
 * Get a human-readable name for a color using the color-name-list API
 * Falls back to hex code if API fails
 */
export async function getColorName(hex: string): Promise<ColorNameResult> {
  // Remove # if present and ensure uppercase
  const cleanHex = hex.replace('#', '').toUpperCase();
  
  try {
    // Use the color-name-list API with bestOf list for higher quality names
    const response = await fetch(
      `https://api.color.pizza/v1/?values=${cleanHex}&list=bestOf`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API response: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.colors && data.colors.length > 0) {
      const colorResult = data.colors[0];
      return {
        name: colorResult.name,
        hex: `#${colorResult.hex}`,
        isExact: colorResult.hex.toLowerCase() === cleanHex.toLowerCase(),
        source: 'api',
      };
    }
    
    throw new Error('No color data returned');
  } catch (error) {
    // Fallback to hex code if API fails
    console.warn('Color naming API failed:', error);
    return {
      name: `#${cleanHex}`,
      hex: `#${cleanHex}`,
      isExact: true,
      source: 'fallback',
    };
  }
}

/**
 * Get color names for multiple hex values
 * More efficient than individual calls
 */
export async function getColorNames(hexColors: string[]): Promise<ColorNameResult[]> {
  const cleanHexes = hexColors.map(hex => hex.replace('#', '').toUpperCase());
  
  try {
    const response = await fetch(
      `https://api.color.pizza/v1/?values=${cleanHexes.join(',')}&list=bestOf`,
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`API response: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.colors && data.colors.length > 0) {
      return data.colors.map((colorResult: any, index: number) => ({
        name: colorResult.name,
        hex: `#${colorResult.hex}`,
        isExact: colorResult.hex.toLowerCase() === cleanHexes[index].toLowerCase(),
        source: 'api' as const,
      }));
    }
    
    throw new Error('No color data returned');
  } catch (error) {
    // Fallback to hex codes if API fails
    console.warn('Color naming API failed:', error);
    return cleanHexes.map(hex => ({
      name: `#${hex}`,
      hex: `#${hex}`,
      isExact: true,
      source: 'fallback' as const,
    }));
  }
}

/**
 * Cache for color names to avoid repeated API calls
 */
const colorNameCache = new Map<string, ColorNameResult>();

/**
 * Get a color name with caching to improve performance
 */
export async function getColorNameCached(hex: string): Promise<ColorNameResult> {
  const cleanHex = hex.replace('#', '').toUpperCase();
  
  if (colorNameCache.has(cleanHex)) {
    return colorNameCache.get(cleanHex)!;
  }
  
  const result = await getColorName(hex);
  colorNameCache.set(cleanHex, result);
  
  return result;
}

/**
 * Clear the color name cache (useful for testing or memory management)
 */
export function clearColorNameCache(): void {
  colorNameCache.clear();
} 