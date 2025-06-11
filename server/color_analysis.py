"""
Color analysis helper functions for extracting and analyzing colors from images.
"""

import io
from typing import List, Dict, Tuple
from PIL import Image
import numpy as np
from sklearn.cluster import KMeans


def extract_palette(img_bytes: bytes, k: int) -> List[str]:
    """
    Extract the k most dominant colors from an image and return them as hex strings.
    
    Args:
        img_bytes: Raw image bytes
        k: Number of colors to extract
        
    Returns:
        List of hex color strings ordered by frequency (most dominant first)
    """
    with Image.open(io.BytesIO(img_bytes)) as im:
        im = im.convert("RGB")

        # Down-sample large photos for faster clustering
        if max(im.size) > 512:
            im.thumbnail((512, 512), Image.LANCZOS)

        pixels = np.asarray(im, dtype=np.uint8).reshape(-1, 3)

        # K-means clustering in RGB space
        km = KMeans(
            n_clusters=k,
            n_init="auto",
            max_iter=20,
            random_state=42,
        ).fit(pixels)

        counts = np.bincount(km.labels_)
        centers = km.cluster_centers_.astype(int)
        hex_cols = [f"#{r:02x}{g:02x}{b:02x}" for r, g, b in centers]

        # Sort by frequency, descending
        ordered = [c for _, c in sorted(zip(counts, hex_cols), reverse=True)]
        return ordered


def extract_detailed_palette(img_bytes: bytes, k: int) -> List[Dict]:
    """
    Extract detailed color palette including hex, RGB values, and percentages.
    
    Args:
        img_bytes: Raw image bytes
        k: Number of colors to extract
        
    Returns:
        List of color dictionaries with hex, rgb, and percentage data
    """
    with Image.open(io.BytesIO(img_bytes)) as image:
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Down-sample large photos for faster clustering
        if max(image.size) > 512:
            image.thumbnail((512, 512), Image.LANCZOS)

        # Convert to numpy array for analysis
        img_array = np.array(image)
        pixels = img_array.reshape(-1, 3)
        
        # Use k-means to find dominant colors
        kmeans = KMeans(
            n_clusters=min(k, len(np.unique(pixels, axis=0))), 
            random_state=42, 
            n_init=10
        )
        kmeans.fit(pixels)
        
        # Get the dominant colors
        colors = kmeans.cluster_centers_.astype(int)
        
        # Calculate color percentages
        labels = kmeans.labels_
        percentages = []
        for i in range(len(colors)):
            percentage = np.sum(labels == i) / len(labels) * 100
            percentages.append(round(percentage, 2))
        
        # Build color data
        dominant_colors = []
        for i, color in enumerate(colors):
            hex_color = "#{:02x}{:02x}{:02x}".format(color[0], color[1], color[2])
            dominant_colors.append({
                "hex": hex_color,
                "rgb": color.tolist(),
                "percentage": percentages[i]
            })
        
        # Sort by percentage (most dominant first)
        dominant_colors.sort(key=lambda x: x["percentage"], reverse=True)
        
        return dominant_colors


def get_pixel_color(img_bytes: bytes, x: int, y: int) -> Dict:
    """
    Get the color of a specific pixel in the image.
    
    Args:
        img_bytes: Raw image bytes
        x: X coordinate
        y: Y coordinate
        
    Returns:
        Dictionary with coordinates, RGB values, and hex color
        
    Raises:
        ValueError: If coordinates are out of bounds
    """
    with Image.open(io.BytesIO(img_bytes)) as image:
        # Convert to RGB if needed
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Check if coordinates are within bounds
        width, height = image.size
        if x < 0 or x >= width or y < 0 or y >= height:
            raise ValueError("Coordinates out of bounds")
        
        # Get pixel color
        pixel_color = image.getpixel((x, y))
        hex_color = "#{:02x}{:02x}{:02x}".format(pixel_color[0], pixel_color[1], pixel_color[2])
        
        return {
            "coordinates": {"x": x, "y": y},
            "rgb": list(pixel_color),
            "hex": hex_color
        }


def get_image_dimensions(img_bytes: bytes) -> Dict[str, int]:
    """
    Get the dimensions of an image.
    
    Args:
        img_bytes: Raw image bytes
        
    Returns:
        Dictionary with width and height
    """
    with Image.open(io.BytesIO(img_bytes)) as image:
        return {"width": image.size[0], "height": image.size[1]}