/**
 * Munsell color matching API client
 */

// Type definitions
export interface MunsellMatch {
  munsell_notation: string;
  hue: string;
  value: number;
  chroma: number;
  hex: string;
  deltaE: number;
}

export interface MunsellSlice {
  [value: number]: {
    [chroma: number]: string; // hex color
  };
}

export interface MunsellMatchResponse {
  match: MunsellMatch;
  slice: MunsellSlice;
}

export interface MunsellHuesResponse {
  hues: string[];
  count: number;
}

export interface MunsellSliceResponse {
  hue: string;
  slice: MunsellSlice;
}

export interface MunsellChipResponse {
  chip: {
    id: number;
    hue_text: string;
    value: number;
    chroma: number;
    lab: number[];
    hex: string;
    xyz: number[];
    xyY: number[];
  };
}

export interface ColorWheelHue {
  hue: string;
  family: string;
  angle: number;
  color: string;
  max_chroma: number;
}

export interface ColorWheelResponse {
  hues: ColorWheelHue[];
  total_hues: number;
}

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get optimized color wheel data with all hues, angles, and colors
 */
export async function getColorWheelData(): Promise<ColorWheelResponse> {
  const response = await fetch(`${API_BASE_URL}/api/munsell-color-wheel`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Find the nearest Munsell chip for RGB color and get the complete hue slice
 */
export async function getMunsellMatch(
  r: number, 
  g: number, 
  b: number
): Promise<MunsellMatchResponse> {
  const url = new URL(`${API_BASE_URL}/api/munsell-match`);
  url.searchParams.set('r', r.toString());
  url.searchParams.set('g', g.toString());
  url.searchParams.set('b', b.toString());

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get all available Munsell hue notations
 */
export async function getMunsellHues(): Promise<MunsellHuesResponse> {
  const response = await fetch(`${API_BASE_URL}/api/munsell-hues`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get complete value × chroma grid for a specific hue
 */
export async function getMunsellSlice(hue: string): Promise<MunsellSliceResponse> {
  const response = await fetch(`${API_BASE_URL}/api/munsell-slice/${encodeURIComponent(hue)}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Get detailed chip information by Munsell notation
 */
export async function getMunsellChip(notation: string): Promise<MunsellChipResponse> {
  const response = await fetch(`${API_BASE_URL}/api/munsell-chip/${encodeURIComponent(notation)}`);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Convert hex color to RGB tuple
 */
export function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  
  return [
    parseInt(result[1], 16),
    parseInt(result[2], 16),
    parseInt(result[3], 16)
  ];
}

/**
 * Get Munsell match for a hex color
 */
export async function getMunsellMatchFromHex(hex: string): Promise<MunsellMatchResponse> {
  const [r, g, b] = hexToRgb(hex);
  return getMunsellMatch(r, g, b);
} 