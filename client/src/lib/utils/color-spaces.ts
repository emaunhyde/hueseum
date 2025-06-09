import Color from 'colorjs.io';

export interface ColorSpaceValue {
  name: string;
  shortName: string;
  values: number[];
  formatted: string;
}

export interface AllColorSpaces {
  hex: string;
  rgb: ColorSpaceValue;
  hsl: ColorSpaceValue;
  hsv: ColorSpaceValue;
  hwb: ColorSpaceValue;
  lab: ColorSpaceValue;
  lch: ColorSpaceValue;
  oklab: ColorSpaceValue;
  oklch: ColorSpaceValue;
  xyz: ColorSpaceValue;
  cmyk: ColorSpaceValue;
}

/**
 * Get all color space representations of a color
 */
export function getAllColorSpaces(hex: string): AllColorSpaces {
  const color = new Color(hex);

  // Helper function to format values with appropriate precision
  const formatValues = (values: number[], precision: number = 1): string => {
    return values.map(v => v.toFixed(precision)).join(', ');
  };

  return {
    hex: hex.toUpperCase(),
    
    rgb: {
      name: 'RGB',
      shortName: 'RGB',
      values: color.to('srgb').coords.map(v => Math.round(v * 255)),
      formatted: `rgb(${color.to('srgb').coords.map(v => Math.round(v * 255)).join(', ')})`
    },
    
    hsl: {
      name: 'HSL',
      shortName: 'HSL',
      values: color.to('hsl').coords,
      formatted: `hsl(${Math.round(color.to('hsl').coords[0] || 0)}, ${Math.round((color.to('hsl').coords[1] || 0) * 100)}%, ${Math.round((color.to('hsl').coords[2] || 0) * 100)}%)`
    },
    
    hsv: {
      name: 'HSV',
      shortName: 'HSV',
      values: color.to('hsv').coords,
      formatted: `hsv(${Math.round(color.to('hsv').coords[0] || 0)}, ${Math.round((color.to('hsv').coords[1] || 0) * 100)}%, ${Math.round((color.to('hsv').coords[2] || 0) * 100)}%)`
    },
    
    hwb: {
      name: 'HWB',
      shortName: 'HWB',
      values: color.to('hwb').coords,
      formatted: `hwb(${Math.round(color.to('hwb').coords[0] || 0)} ${Math.round((color.to('hwb').coords[1] || 0) * 100)}% ${Math.round((color.to('hwb').coords[2] || 0) * 100)}%)`
    },
    
    lab: {
      name: 'CIELAB',
      shortName: 'LAB',
      values: color.to('lab').coords,
      formatted: `lab(${formatValues(color.to('lab').coords)})`
    },
    
    lch: {
      name: 'CIELCH',
      shortName: 'LCH',
      values: color.to('lch').coords,
      formatted: `lch(${formatValues(color.to('lch').coords)})`
    },
    
    oklab: {
      name: 'OKLAB',
      shortName: 'OKLAB',
      values: color.to('oklab').coords,
      formatted: `oklab(${formatValues(color.to('oklab').coords, 3)})`
    },
    
    oklch: {
      name: 'OKLCH',
      shortName: 'OKLCH',
      values: color.to('oklch').coords,
      formatted: `oklch(${formatValues(color.to('oklch').coords, 3)})`
    },
    
    xyz: {
      name: 'XYZ',
      shortName: 'XYZ',
      values: color.to('xyz-d65').coords,
      formatted: `xyz(${formatValues(color.to('xyz-d65').coords, 3)})`
    },
    
    cmyk: {
      name: 'CMYK',
      shortName: 'CMYK',
      values: (() => {
        // Convert RGB to CMYK manually since colorjs.io doesn't have built-in CMYK
        const [r, g, b] = color.to('srgb').coords;
        const k = 1 - Math.max(r, Math.max(g, b));
        if (k === 1) return [0, 0, 0, 100];
        const c = ((1 - r - k) / (1 - k)) * 100;
        const m = ((1 - g - k) / (1 - k)) * 100;
        const y = ((1 - b - k) / (1 - k)) * 100;
        return [Math.round(c), Math.round(m), Math.round(y), Math.round(k * 100)];
      })(),
      formatted: (() => {
        const [r, g, b] = color.to('srgb').coords;
        const k = 1 - Math.max(r, Math.max(g, b));
        if (k === 1) return 'cmyk(0%, 0%, 0%, 100%)';
        const c = ((1 - r - k) / (1 - k)) * 100;
        const m = ((1 - g - k) / (1 - k)) * 100;
        const y = ((1 - b - k) / (1 - k)) * 100;
        return `cmyk(${Math.round(c)}%, ${Math.round(m)}%, ${Math.round(y)}%, ${Math.round(k * 100)}%)`;
      })()
    }
  };
}