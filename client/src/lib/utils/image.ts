import type { Point, Size } from '@/lib/types';

/**
 * Image calculation utilities
 */

/**
 * Calculate image dimensions while maintaining aspect ratio with a max height constraint
 */
export const calculateImageDimensions = (
  imageWidth: number, 
  imageHeight: number, 
  maxHeight: number
): Size => {
  const aspectRatio = imageWidth / imageHeight;
  
  if (imageHeight > maxHeight) {
    return {
      width: maxHeight * aspectRatio,
      height: maxHeight
    };
  }
  
  return { width: imageWidth, height: imageHeight };
};

/**
 * Calculate crop area for zoomed image display
 */
export const calculateCropArea = (
  imageWidth: number,
  imageHeight: number,
  focusPoint: Point,
  zoomLevel: number
) => {
  const cropWidth = imageWidth / zoomLevel;
  const cropHeight = imageHeight / zoomLevel;
  
  const cropX = Math.max(0, Math.min(
    imageWidth - cropWidth, 
    focusPoint.x * imageWidth - cropWidth / 2
  ));
  
  const cropY = Math.max(0, Math.min(
    imageHeight - cropHeight, 
    focusPoint.y * imageHeight - cropHeight / 2
  ));

  return { cropX, cropY, cropWidth, cropHeight };
};