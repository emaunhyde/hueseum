/**
 * Canvas utility functions for image manipulation and drawing
 */

/**
 * Safely get a 2D canvas context
 */
export const getCanvasContext = (canvas: HTMLCanvasElement | null): CanvasRenderingContext2D | null => {
  return canvas?.getContext('2d') ?? null;
};

/**
 * Draw crosshairs on a canvas context
 */
export const drawCrosshairs = (
  ctx: CanvasRenderingContext2D, 
  x: number, 
  y: number,
  options?: {
    radius?: number;
    lineLength?: number;
    color?: string;
    opacity?: number;
  }
) => {
  const {
    radius = 20,
    lineLength = 30,
    color = '#ff4444',
    opacity = 0.8
  } = options || {};

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.globalAlpha = opacity;

  // Draw circle
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, 2 * Math.PI);
  ctx.stroke();

  // Draw crosshairs
  ctx.beginPath();
  ctx.moveTo(x - lineLength, y);
  ctx.lineTo(x + lineLength, y);
  ctx.moveTo(x, y - lineLength);
  ctx.lineTo(x, y + lineLength);
  ctx.stroke();

  ctx.restore();
};