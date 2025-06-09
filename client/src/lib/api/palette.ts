export interface ColorData {
  hex: string;
  rgb: number[];
  percentage: number;
}

export interface PaletteResponse {
  palette: ColorData[];
  count: number;
}

export interface PaletteRequestOptions {
  imageData: string;
  size?: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function extractPalette({
  imageData,
  size = 15,
}: PaletteRequestOptions): Promise<PaletteResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/palette?size=${size}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_data: imageData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to extract color palette');
  }
}

export interface PixelColorRequest {
  imageData: string;
  x: number;
  y: number;
}

export interface PixelColorResponse {
  coordinates: { x: number; y: number };
  rgb: number[];
  hex: string;
}

export async function getPixelColor({
  imageData,
  x,
  y,
}: PixelColorRequest): Promise<PixelColorResponse> {
  try {
    const response = await fetch(`${API_BASE_URL}/get-pixel-color?x=${x}&y=${y}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_data: imageData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error('Failed to get pixel color');
  }
}