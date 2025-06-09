/**
 * Alla prima color mapping utilities
 * Maps luminance values to colored versions while preserving value relationships
 */

export interface AllaPrimaColor {
  name: string;
  baseColor: { r: number; g: number; b: number };
  hex: string;
}

// Available alla prima colors
export const ALLA_PRIMA_COLORS: AllaPrimaColor[] = [
  {
    name: 'Magenta',
    baseColor: { r: 228, g: 1, b: 177 },
    hex: '#e401b1'
  },
  {
    name: 'Sepia',
    baseColor: { r: 139, g: 69, b: 19 },
    hex: '#8b4513'
  }
  // Future colors: Burnt Umber, Prussian Blue, etc.
];

/**
 * Maps a luminance value (0-255) to a colored version using the alla prima color
 * True alla prima technique: darkest values use the pure base color, everything else is lighter
 * Luminance 0 (darkest) = pure base color, luminance 255 (lightest) = white
 */
export function mapLuminanceToAllaPrima(
  luminance: number, 
  allaPrimaColor: AllaPrimaColor
): { r: number; g: number; b: number } {
  const { r: baseR, g: baseG, b: baseB } = allaPrimaColor.baseColor;
  
  // Normalize luminance to 0-1 range
  const normalizedLuminance = luminance / 255;
  
  // Alla prima mapping: start with pure base color for darkest values,
  // gradually lighten towards white for lighter values
  const r = Math.round(baseR + (255 - baseR) * normalizedLuminance);
  const g = Math.round(baseG + (255 - baseG) * normalizedLuminance);
  const b = Math.round(baseB + (255 - baseB) * normalizedLuminance);
  
  // Ensure values stay within 0-255 range
  return {
    r: Math.max(0, Math.min(255, r)),
    g: Math.max(0, Math.min(255, g)),
    b: Math.max(0, Math.min(255, b))
  };
}

/**
 * Get the default alla prima color (Magenta)
 */
export function getDefaultAllaPrimaColor(): AllaPrimaColor {
  return ALLA_PRIMA_COLORS[0];
}