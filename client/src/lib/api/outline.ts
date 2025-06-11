/**
 * API functions for outline generation
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface OutlineRequest {
  imageData: string;
}

export interface AdvancedOutlineRequest {
  imageData: string;
  blurKernel: number;
  cannyLow: number;
  cannyHigh: number;
  dilateIterations: number;
}

/**
 * Generate and download a coloring book outline from an image
 */
export async function generateOutline(request: OutlineRequest): Promise<Blob> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-outline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_data: request.imageData,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // Return the blob for download
    return await response.blob();
  } catch (error) {
    console.error('Error generating outline:', error);
    throw error;
  }
}

/**
 * Generate and download a customizable coloring book outline from an image
 */
export async function generateAdvancedOutline(request: AdvancedOutlineRequest): Promise<Blob> {
  try {
    const response = await fetch(`${API_BASE_URL}/generate-advanced-outline`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_data: request.imageData,
        blur_kernel: request.blurKernel,
        canny_low: request.cannyLow,
        canny_high: request.cannyHigh,
        dilate_iterations: request.dilateIterations,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
    }

    // Return the blob for download
    return await response.blob();
  } catch (error) {
    console.error('Error generating advanced outline:', error);
    throw error;
  }
}