/**
 * Luminance and value study utilities
 */

import { mapLuminanceToAllaPrima, AllaPrimaColor } from './alla-prima';

/**
 * Convert RGB to perceptual luminance using the relative luminance formula
 * Based on ITU-R BT.709 standard
 */
export function rgbToLuminance(r: number, g: number, b: number): number {
  // Normalize RGB values to 0-1 range
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  // Apply gamma correction
  const rLinear = rNorm <= 0.03928 ? rNorm / 12.92 : Math.pow((rNorm + 0.055) / 1.055, 2.4);
  const gLinear = gNorm <= 0.03928 ? gNorm / 12.92 : Math.pow((gNorm + 0.055) / 1.055, 2.4);
  const bLinear = bNorm <= 0.03928 ? bNorm / 12.92 : Math.pow((bNorm + 0.055) / 1.055, 2.4);

  // Calculate relative luminance
  const luminance = 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
  
  // Return as 0-255 range
  return Math.round(luminance * 255);
}

/**
 * Posterize a luminance value to a specific number of steps
 */
export function posterizeLuminance(luminance: number, steps: number): number {
  if (steps < 2) return luminance;
  
  const stepSize = 255 / (steps - 1);
  const step = Math.round(luminance / stepSize);
  return Math.round(step * stepSize);
}

/**
 * Calculate edge strengths from luminance data using Laplacian filter
 * Returns edge strength values (0-255) for each pixel
 */
function calculateEdgeStrengths(luminanceData: Uint8ClampedArray, width: number, height: number): Uint8ClampedArray {
  const edgeStrengths = new Uint8ClampedArray(width * height);
  
  // Laplacian kernel
  const K = [ 0, -1,  0,
             -1,  4, -1,
              0, -1,  0];

  // Apply edge detection to interior pixels only (borders remain 0)
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let sum = 0;
      let k = 0;
      
      // Apply convolution on luminance data
      for (let j = -1; j <= 1; j++) {
        for (let i = -1; i <= 1; i++) {
          const luminanceIndex = (y + j) * width + (x + i);
          const luminanceValue = luminanceData[luminanceIndex];
          sum += luminanceValue * K[k++];
        }
      }
      
      // Calculate edge strength (0-255)
      const edgeStrength = Math.min(Math.max(Math.abs(sum), 0), 255);
      const outputIndex = y * width + x;
      edgeStrengths[outputIndex] = edgeStrength;
    }
  }
  
  return edgeStrengths;
}

/**
 * Convert an image to value study (luminance only) with optional posterization, edge detection, and alla prima coloring
 */
export function convertImageToValueStudy(
  imageSrc: string,
  steps: number = 10,
  enableEdgeDetection: boolean = false,
  allaPrimaColor?: AllaPrimaColor
): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        // Optimize for performance - limit max size
        const maxSize = 1200;
        let { width, height } = img;
        
        if (width > maxSize || height > maxSize) {
          const scale = Math.min(maxSize / width, maxSize / height);
          width = Math.floor(width * scale);
          height = Math.floor(height * scale);
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw the image at optimized size
        ctx.drawImage(img, 0, 0, width, height);
        
        // Get image data
        const imageData = ctx.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // First pass: calculate luminance and store in a separate array
        const luminanceData = new Uint8ClampedArray(width * height);
        
        for (let i = 0, luminanceIndex = 0; i < data.length; i += 4, luminanceIndex++) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Calculate luminance
          let luminance = rgbToLuminance(r, g, b);
          
          // Posterize if needed
          if (steps < 10) {
            luminance = posterizeLuminance(luminance, steps);
          }
          
          luminanceData[luminanceIndex] = luminance;
        }
        
        // Second pass: calculate edge detection on luminance data if enabled
        let edgeStrengths: Uint8ClampedArray | null = null;
        if (enableEdgeDetection) {
          edgeStrengths = calculateEdgeStrengths(luminanceData, width, height);
        }
        
        // Third pass: apply final coloring and edge effects
        for (let i = 0, luminanceIndex = 0; i < data.length; i += 4, luminanceIndex++) {
          const luminance = luminanceData[luminanceIndex];
          
          // Apply base coloring (alla prima or grayscale)
          let finalR, finalG, finalB;
          if (allaPrimaColor) {
            const allaPrimaRgb = mapLuminanceToAllaPrima(luminance, allaPrimaColor);
            finalR = allaPrimaRgb.r;
            finalG = allaPrimaRgb.g;
            finalB = allaPrimaRgb.b;
          } else {
            finalR = finalG = finalB = luminance;
          }
          
          // Apply edge darkening if enabled
          if (enableEdgeDetection && edgeStrengths) {
            const edgeStrength = edgeStrengths[luminanceIndex];
            const edgeOpacity = edgeStrength / 255;
            
            // For alla prima colors, darken proportionally to maintain color relationships
            // For grayscale, use a minimum dark value approach
            if (allaPrimaColor) {
              // Proportional darkening for alla prima - multiply by darkening factor
              const darkeningFactor = 1 - (edgeOpacity * 0.7); // Darken by up to 70%
              finalR = Math.round(finalR * darkeningFactor);
              finalG = Math.round(finalG * darkeningFactor);
              finalB = Math.round(finalB * darkeningFactor);
            } else {
              // Original dark grey minimum approach for grayscale
              const minDarkValue = 45;
              const targetDarkValue = Math.max(minDarkValue, finalR * 0.3);
              finalR = finalG = finalB = Math.round(finalR * (1 - edgeOpacity) + targetDarkValue * edgeOpacity);
            }
          }
          
          data[i] = finalR;
          data[i + 1] = finalG;
          data[i + 2] = finalB;
          // Alpha channel (i + 3) remains unchanged
        }
        
        // Put the final image data back
        ctx.putImageData(imageData, 0, 0);
        
        // Convert to data URL
        resolve(canvas.toDataURL());
      } catch (error) {
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
  });
}