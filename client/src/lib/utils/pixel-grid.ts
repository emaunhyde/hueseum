/**
 * Extract a grid of pixels around a center point from an image
 */
export function getPixelGrid(
  imageSrc: string,
  centerX: number,
  centerY: number,
  gridSize: number = 11
): Promise<string[][]> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        reject(new Error('Could not get canvas context'));
        return;
      }
      
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      
      const halfGrid = Math.floor(gridSize / 2);
      const grid: string[][] = [];
      
      for (let y = -halfGrid; y <= halfGrid; y++) {
        const row: string[] = [];
        for (let x = -halfGrid; x <= halfGrid; x++) {
          const pixelX = Math.max(0, Math.min(Math.floor(centerX + x), img.width - 1));
          const pixelY = Math.max(0, Math.min(Math.floor(centerY + y), img.height - 1));
          
          const imageData = ctx.getImageData(pixelX, pixelY, 1, 1);
          const [r, g, b] = imageData.data;
          const hex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
          
          row.push(hex);
        }
        grid.push(row);
      }
      
      resolve(grid);
    };
    
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    
    img.crossOrigin = 'anonymous';
    img.src = imageSrc;
  });
}