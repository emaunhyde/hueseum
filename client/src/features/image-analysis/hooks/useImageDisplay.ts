import { useRef, useEffect, useState, useCallback } from 'react';
import { getCanvasContext, drawCrosshairs } from '@/lib/utils/canvas';
import { calculateImageDimensions } from '@/lib/utils/image';
import { getPixelColorFromImage } from '@/lib/utils/pixel-color';
import { getPixelGrid } from '@/lib/utils/pixel-grid';
import type { Rectangle } from '@/lib/types';
import { IMAGE_ANALYSIS_CONSTANTS } from '../types';

export interface PixelColorData {
  hex: string;
  rgb: number[];
  coordinates: { x: number; y: number };
}

// Utility to keep a value within a min-max range
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const useImageDisplay = (imageSrc: string) => {
  const leftCanvasRef = useRef<HTMLCanvasElement>(null);
  const rightCanvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const baseImageSrcRef = useRef<string | null>(null);

  const [imageLoaded, setImageLoaded] = useState(false);
  const [selectionRect, setSelectionRect] = useState<Rectangle | null>(null);
  const [crosshairPosition, setCrosshairPosition] = useState<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
  const [isHoveringLeft, setIsHoveringLeft] = useState(false);
  const [pixelColor, setPixelColor] = useState<PixelColorData | null>(null);
  const [isLoadingPixelColor, setIsLoadingPixelColor] = useState(false);
  const [hoverColor, setHoverColor] = useState<{ hex: string; rgb: number[] } | null>(null);
  const [pixelGrid, setPixelGrid] = useState<string[][] | null>(null);
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isHoveringRight, setIsHoveringRight] = useState(false);

  const drawLeftImage = useCallback(() => {
    const canvas = leftCanvasRef.current;
    const ctx   = getCanvasContext(canvas);
    const img   = imageRef.current;

    if (!canvas || !ctx || !img || !selectionRect) return;

    // Fit the whole image into the fixed height container, keeping aspect ratio
    const { width: drawWidth, height: drawHeight } = calculateImageDimensions(
      img.width,
      img.height,
      IMAGE_ANALYSIS_CONSTANTS.CONTAINER_HEIGHT,
    );

    // Store scale so we can convert image-space → canvas-space
    const scale = drawWidth / img.width;

    canvas.width  = drawWidth;
    canvas.height = drawHeight;

    // Draw the full image first
    ctx.drawImage(img, 0, 0, drawWidth, drawHeight);

    // Dimming overlay (skip it when the user is hovering the left-hand canvas)
    if (!isHoveringLeft) {
      ctx.fillStyle = `rgba(0, 0, 0, ${IMAGE_ANALYSIS_CONSTANTS.SELECTION_BOX.DIMMING_OPACITY})`;
      ctx.fillRect(0, 0, drawWidth, drawHeight);
    }

    // Skip drawing the selection rectangle if the user is actively hovering
    if (isHoveringLeft) return;

    // Convert selection rectangle (image coords) → canvas coords
    const dispX      = selectionRect.x * scale;
    const dispY      = selectionRect.y * scale;
    const dispWidth  = selectionRect.width * scale;
    const dispHeight = selectionRect.height * scale;

    // Clear the highlighted area then redraw that crop of the image
    ctx.clearRect(dispX, dispY, dispWidth, dispHeight);
    ctx.drawImage(
      img,
      selectionRect.x,
      selectionRect.y,
      selectionRect.width,
      selectionRect.height,
      dispX,
      dispY,
      dispWidth,
      dispHeight,
    );

    // Border
    ctx.strokeStyle = IMAGE_ANALYSIS_CONSTANTS.SELECTION_BOX.COLOR;
    ctx.lineWidth   = IMAGE_ANALYSIS_CONSTANTS.SELECTION_BOX.LINE_WIDTH;
    ctx.strokeRect(dispX, dispY, dispWidth, dispHeight);
  }, [selectionRect, isHoveringLeft]);

  const drawRightImage = useCallback(() => {
    const canvas = rightCanvasRef.current;
    const ctx    = getCanvasContext(canvas);
    const img    = imageRef.current;

    if (!canvas || !ctx || !img || !selectionRect) return;

    const canvasWidth  = canvas.clientWidth || 400;
    const canvasHeight = IMAGE_ANALYSIS_CONSTANTS.CONTAINER_HEIGHT;

    canvas.width  = canvasWidth;
    canvas.height = canvasHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw the selected crop scaled to fill the canvas
    ctx.drawImage(
      img,
      selectionRect.x,
      selectionRect.y,
      selectionRect.width,
      selectionRect.height,
      0,
      0,
      canvasWidth,
      canvasHeight,
    );

    // Crosshairs (relative to the canvas which now represents the crop)
    const crosshairX = crosshairPosition.x * canvasWidth;
    const crosshairY = crosshairPosition.y * canvasHeight;

    drawCrosshairs(ctx, crosshairX, crosshairY, {
      radius: IMAGE_ANALYSIS_CONSTANTS.CROSSHAIR.RADIUS,
      lineLength: IMAGE_ANALYSIS_CONSTANTS.CROSSHAIR.LINE_LENGTH,
      color: IMAGE_ANALYSIS_CONSTANTS.CROSSHAIR.COLOR,
      opacity: IMAGE_ANALYSIS_CONSTANTS.CROSSHAIR.OPACITY,
    });
  }, [selectionRect, crosshairPosition]);

  const handleLeftImageClick = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const img    = imageRef.current;
    if (!canvas || !img || !selectionRect) return;

    const rect   = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Convert to image-space coordinates
    const scale        = canvas.width / img.width;
    const imgX         = clickX / scale;
    const imgY         = clickY / scale;

    // Centre the selection rect on the clicked point, clamped to image bounds
    const newX = clamp(imgX - selectionRect.width / 2, 0, img.width  - selectionRect.width);
    const newY = clamp(imgY - selectionRect.height / 2, 0, img.height - selectionRect.height);

    setSelectionRect({ ...selectionRect, x: newX, y: newY });
    // Crosshair back to centre
    setCrosshairPosition({ x: 0.5, y: 0.5 });
  }, [selectionRect]);

  const handleRightImageClick = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const img    = imageRef.current;
    if (!canvas || !img || !selectionRect) return;

    const rect   = canvas.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Update mouse position to match click location for tooltip sync
    setMousePosition({ x: event.clientX, y: event.clientY });

    // New crosshair position relative to current crop
    const relX = clickX / canvas.width;
    const relY = clickY / canvas.height;

    // Determine the absolute image-space coordinate of the click
    const absX = selectionRect.x + relX * selectionRect.width;
    const absY = selectionRect.y + relY * selectionRect.height;

    // Attempt to centre the crop on that point
    const newSelX = clamp(absX - selectionRect.width / 2, 0, img.width  - selectionRect.width);
    const newSelY = clamp(absY - selectionRect.height / 2, 0, img.height - selectionRect.height);

    // Because we may have clamped, the crosshair might not stay centred –
    // recompute its position inside the (possibly shifted) crop.
    const newCrosshairX = (absX - newSelX) / selectionRect.width;
    const newCrosshairY = (absY - newSelY) / selectionRect.height;

    setSelectionRect({ ...selectionRect, x: newSelX, y: newSelY });
    setCrosshairPosition({ x: newCrosshairX, y: newCrosshairY });

    // Update hover color to match the clicked location
    const updateHoverColorAtClick = async () => {
      try {
        const absoluteX = selectionRect.x + relX * selectionRect.width;
        const absoluteY = selectionRect.y + relY * selectionRect.height;
        const colorData = await getPixelColorFromImage(imageSrc, absoluteX, absoluteY);
        setHoverColor({ hex: colorData.hex, rgb: colorData.rgb });
      } catch {
        // Ignore errors
      }
    };
    updateHoverColorAtClick();
  }, [selectionRect, imageSrc]);

  // Update pixel color based on crosshair position
  const updatePixelColor = useCallback(async () => {
    const img = imageRef.current;
    if (!img || !selectionRect || !imageLoaded) return;

    try {
      setIsLoadingPixelColor(true);
      
      // Calculate the absolute pixel coordinates in the original image
      const absoluteX = selectionRect.x + crosshairPosition.x * selectionRect.width;
      const absoluteY = selectionRect.y + crosshairPosition.y * selectionRect.height;
      
      const colorData = await getPixelColorFromImage(imageSrc, absoluteX, absoluteY);
      setPixelColor(colorData);
    } catch (error) {
      console.error('Failed to get pixel color:', error);
      setPixelColor(null);
    } finally {
      setIsLoadingPixelColor(false);
    }
  }, [imageSrc, selectionRect, crosshairPosition, imageLoaded]);

  // Get hover color at specific canvas coordinates (currently unused but may be needed)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getHoverColor = useCallback(async (canvasX: number, canvasY: number) => {
    const img = imageRef.current;
    const canvas = rightCanvasRef.current;
    if (!img || !canvas || !selectionRect) return null;

    try {
      const relX = canvasX / canvas.width;
      const relY = canvasY / canvas.height;
      
      // Calculate absolute pixel coordinates in the original image
      const absoluteX = selectionRect.x + relX * selectionRect.width;
      const absoluteY = selectionRect.y + relY * selectionRect.height;
      
      const colorData = await getPixelColorFromImage(imageSrc, absoluteX, absoluteY);
      return { hex: colorData.hex, rgb: colorData.rgb };
    } catch {
      return null;
    }
  }, [imageSrc, selectionRect]);

  // Handle mouse movement on right canvas
  const handleRightMouseMove = useCallback((event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = event.currentTarget;
    const rect = canvas.getBoundingClientRect();
    const canvasX = event.clientX - rect.left;
    const canvasY = event.clientY - rect.top;

    // Update mouse position for tooltip
    setMousePosition({ x: event.clientX, y: event.clientY });

    // Don't process if no selection rect
    if (!selectionRect) return;

    const relX = canvasX / canvas.width;
    const relY = canvasY / canvas.height;
    const absoluteX = selectionRect.x + relX * selectionRect.width;
    const absoluteY = selectionRect.y + relY * selectionRect.height;

    // Process color and grid asynchronously without blocking
    Promise.all([
      getPixelColorFromImage(imageSrc, absoluteX, absoluteY).then(colorData => ({
        hex: colorData.hex,
        rgb: colorData.rgb
      })).catch(() => null),
      getPixelGrid(imageSrc, absoluteX, absoluteY, 7).catch(() => null)
    ]).then(([color, grid]) => {
      setHoverColor(color);
      setPixelGrid(grid);
    });
  }, [selectionRect, imageSrc]);

  // Handle mouse enter/leave for right canvas
  const handleRightPointerEnter = useCallback(() => setIsHoveringRight(true), []);
  const handleRightPointerLeave = useCallback(() => {
    setIsHoveringRight(false);
    setHoverColor(null);
    setPixelGrid(null);
  }, []);

  // Simple callbacks that consumers (the canvas) can wire up
  const handleLeftPointerEnter = useCallback(() => setIsHoveringLeft(true), []);
  const handleLeftPointerLeave = useCallback(() => setIsHoveringLeft(false), []);

  // Load image - preserve viewfinder state for processed versions of the same base image
  useEffect(() => {
    // Determine if this is a new base image or a processed version
    let isNewBaseImage = false;
    
    if (!baseImageSrcRef.current) {
      // First image load
      isNewBaseImage = true;
      baseImageSrcRef.current = imageSrc;
    } else if (!imageSrc.startsWith('data:image/')) {
      // New file-based image (not a processed data URL)
      isNewBaseImage = baseImageSrcRef.current !== imageSrc;
      if (isNewBaseImage) {
        baseImageSrcRef.current = imageSrc;
      }
    }
    // If imageSrc starts with 'data:image/', it's a processed version - don't reset viewfinder
    
    if (isNewBaseImage) {
      // Reset all state for completely new base images
      setImageLoaded(false);
      setSelectionRect(null);
      setPixelColor(null);
      setHoverColor(null);
      setPixelGrid(null);
      setCrosshairPosition({ x: 0.5, y: 0.5 });
    } else {
      // For processed versions, just clear temporary color state but ensure re-render
      setPixelColor(null);
      setHoverColor(null);
      setPixelGrid(null);
      setImageLoaded(false); // Force reload to ensure immediate update
    }
    
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error('Failed to load image:', imageSrc);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  // Initialise selection rectangle when the image first loads
  useEffect(() => {
    if (!imageLoaded || selectionRect) return;

    const rightCanvas = rightCanvasRef.current;
    const img         = imageRef.current;
    if (!rightCanvas || !img) return;

    const rightWidth  = rightCanvas.clientWidth || 400;
    const rightHeight = IMAGE_ANALYSIS_CONSTANTS.CONTAINER_HEIGHT;
    const aspect      = rightWidth / rightHeight;

    // Select ~15% of the image height, honouring the right-canvas aspect ratio
    let selHeight = img.height * 0.15;
    let selWidth  = selHeight * aspect;

    if (selWidth > img.width) {
      selWidth  = img.width * 0.15;
      selHeight = selWidth / aspect;
    }

    setSelectionRect({
      x: (img.width  - selWidth)  / 2,
      y: (img.height - selHeight) / 2,
      width:  selWidth,
      height: selHeight,
    });
  }, [imageLoaded, selectionRect]);

  // Draw when image loads or selection changes
  useEffect(() => {
    if (imageLoaded && selectionRect) {
      drawLeftImage();
      drawRightImage();
    }
  }, [imageLoaded, selectionRect, crosshairPosition, isHoveringLeft, drawLeftImage, drawRightImage]);

  // Force redraw when imageSrc changes (even if it's the same URL)
  useEffect(() => {
    if (imageLoaded && selectionRect) {
      // Small delay to ensure the image is fully loaded
      const timeoutId = setTimeout(() => {
        drawLeftImage();
        drawRightImage();
      }, 10);
      
      return () => clearTimeout(timeoutId);
    }
  }, [imageSrc, imageLoaded, selectionRect, drawLeftImage, drawRightImage]);

  // Update pixel color when crosshair position changes
  useEffect(() => {
    if (imageLoaded && selectionRect) {
      updatePixelColor();
    }
  }, [updatePixelColor]);

  return {
    leftCanvasRef,
    rightCanvasRef,
    handleLeftImageClick,
    handleRightImageClick,
    handleLeftPointerEnter,
    handleLeftPointerLeave,
    handleRightMouseMove,
    handleRightPointerEnter,
    handleRightPointerLeave,
    imageLoaded,
    pixelColor,
    isLoadingPixelColor,
    hoverColor,
    pixelGrid,
    mousePosition,
    isHoveringRight,
  };
};