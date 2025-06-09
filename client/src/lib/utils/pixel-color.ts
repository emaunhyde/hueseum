/**
 * Get the color of a pixel at specific coordinates from an image
 */
export function getPixelColorFromImage(
  imageSrc: string,
  x: number,
  y: number
): Promise<{ hex: string; rgb: number[]; coordinates: { x: number; y: number } }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      // Create a canvas to draw the image
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      
      // Draw the image onto the canvas
      ctx.drawImage(img, 0, 0);
      
      // Clamp coordinates to image bounds
      const clampedX = Math.max(0, Math.min(Math.floor(x), img.width - 1));
      const clampedY = Math.max(0, Math.min(Math.floor(y), img.height - 1));
      
      // Get pixel data
      const imageData = ctx.getImageData(clampedX, clampedY, 1, 1);
      const [r, g, b] = imageData.data;
      
      // Convert to hex
      const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      
      resolve({
        hex,
        rgb: [r, g, b],
        coordinates: { x: clampedX, y: clampedY }
      });
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.crossOrigin = 'anonymous'; // Handle CORS if needed
    img.src = imageSrc;
  });
}