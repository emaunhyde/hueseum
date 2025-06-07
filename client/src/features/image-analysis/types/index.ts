export interface ImageDisplayProps {
  imageSrc: string;
}

export const IMAGE_ANALYSIS_CONSTANTS = {
  CONTAINER_HEIGHT: 400,
  SELECTION_BOX: {
    WIDTH_FRACTION: 0.25, // 25% of image width
    HEIGHT_FRACTION: 0.25, // 25% of image height
    COLOR: '#ff4444',
    LINE_WIDTH: 2,
    DIMMING_OPACITY: 0.6,
  },
  CROSSHAIR: {
    RADIUS: 20,
    LINE_LENGTH: 30,
    COLOR: '#ff4444',
    OPACITY: 0.8,
  },
} as const;