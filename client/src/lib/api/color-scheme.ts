/**
 * API client for color scheme analysis
 */

export interface ColorSchemeColor {
  hex: string;
  rgb: number[];
  percentage: number;
}

export interface WheelPosition {
  hex: string;
  rgb: number[];
  percentage: number;
  hue: number;
  saturation: number;
  lightness: number;
  x: number;
  y: number;
}

export interface ColorRelationship {
  type: 'complement' | 'triadic' | 'analogous' | 'split-complement';
  from: number;
  to: number;
  strength: number;
}

export interface ColorSchemeAnalysis {
  scheme: {
    type: 'monochromatic' | 'complementary' | 'analogous' | 'triadic' | 'split-complementary' | 'tetradic' | 'complex';
    description: string;
  };
  significant_colors: number;
  chromatic_colors: number;
  wheel_positions: WheelPosition[];
  relationships: ColorRelationship[];
  analysis: {
    total_colors: number;
    filtered_colors: number;
    dominant_hue: number | null;
    hue_range: number;
  };
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Analyze color scheme relationships in a palette
 */
export async function analyzeColorScheme(colors: ColorSchemeColor[]): Promise<ColorSchemeAnalysis> {
  const response = await fetch(`${API_BASE_URL}/analyze-color-scheme`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ colors }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
} 