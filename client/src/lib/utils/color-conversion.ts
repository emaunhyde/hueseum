/**
 * Color conversion utilities
 */

export interface RGBColor {
  r: number;
  g: number;
  b: number;
}

export interface CMYKColor {
  c: number;
  m: number;
  y: number;
  k: number;
}

/**
 * Convert RGB values to percentages
 */
export function rgbToPercentages(r: number, g: number, b: number): RGBColor {
  return {
    r: Math.round((r / 255) * 100),
    g: Math.round((g / 255) * 100),
    b: Math.round((b / 255) * 100),
  };
}

/**
 * Convert RGB to CMYK
 */
export function rgbToCmyk(r: number, g: number, b: number): CMYKColor {
  // Normalize RGB values to 0-1 range
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  // Calculate K (black)
  const k = 1 - Math.max(rNorm, Math.max(gNorm, bNorm));

  // If K is 1 (pure black), C, M, Y are 0
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  // Calculate C, M, Y
  const c = ((1 - rNorm - k) / (1 - k)) * 100;
  const m = ((1 - gNorm - k) / (1 - k)) * 100;
  const y = ((1 - bNorm - k) / (1 - k)) * 100;

  return {
    c: Math.round(c),
    m: Math.round(m),
    y: Math.round(y),
    k: Math.round(k * 100),
  };
}