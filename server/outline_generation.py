"""
Outline generation utilities for creating coloring book pages
Uses OpenCV for edge detection and image processing
"""

import cv2
import numpy as np
import io
import base64
import svgwrite
from PIL import Image


def generate_coloring_book_outline(image_data: str) -> bytes:
    """
    Generate a coloring book outline from base64 image data
    
    Args:
        image_data: Base64 encoded image string
        
    Returns:
        PNG image bytes suitable for download
    """
    try:
        # Decode base64 image
        if image_data.startswith('data:image'):
            # Remove data URL prefix
            image_data = image_data.split(',')[1]
        
        # Convert base64 to bytes
        image_bytes = base64.b64decode(image_data)
        
        # Convert to numpy array for OpenCV
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Could not decode image")
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur to reduce noise
        gray = cv2.GaussianBlur(gray, (3, 3), 0)
        
        # Canny edge detection
        edges = cv2.Canny(gray, 50, 150)
        
        # Dilate edges to make them thicker/more visible
        kernel = np.ones((3, 3), np.uint8)
        edges = cv2.dilate(edges, kernel, iterations=1)
        
        # Invert colors (black lines on white background)
        coloring = cv2.bitwise_not(edges)
        
        # Encode as PNG
        is_success, buf = cv2.imencode(".png", coloring)
        
        if not is_success:
            raise ValueError("Could not encode image as PNG")
        
        return buf.tobytes()
        
    except Exception as e:
        raise ValueError(f"Failed to generate outline: {str(e)}")


def generate_advanced_outline(image_data: str, blur_kernel: int = 3, 
                            canny_low: int = 50, canny_high: int = 150,
                            dilate_iterations: int = 1) -> bytes:
    """
    Generate a vector coloring book outline with adjustable parameters
    
    Args:
        image_data: Base64 encoded image string
        blur_kernel: Gaussian blur kernel size (odd number)
        canny_low: Lower threshold for Canny edge detection
        canny_high: Upper threshold for Canny edge detection
        dilate_iterations: Number of dilation iterations for thicker lines
        
    Returns:
        SVG content as bytes suitable for download
    """
    try:
        # Decode base64 image
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        image_bytes = base64.b64decode(image_data)
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if img is None:
            raise ValueError("Could not decode image")
        
        h, w = img.shape[:2]
        
        # Convert to grayscale
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        
        # Apply Gaussian blur with adjustable kernel
        if blur_kernel % 2 == 0:
            blur_kernel += 1  # Ensure odd kernel size
        gray = cv2.GaussianBlur(gray, (blur_kernel, blur_kernel), 0)
        
        # Canny edge detection with adjustable thresholds
        edges = cv2.Canny(gray, canny_low, canny_high)
        
        # Dilate edges with adjustable iterations
        if dilate_iterations > 0:
            kernel = np.ones((3, 3), np.uint8)
            edges = cv2.dilate(edges, kernel, iterations=dilate_iterations)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_LIST, cv2.CHAIN_APPROX_SIMPLE)
        
        # Create SVG drawing
        dwg = svgwrite.Drawing(size=(w, h))
        dwg.viewbox(0, 0, w, h)
        
        # Convert contours to SVG paths
        for contour in contours:
            if len(contour) > 2:  # Only process contours with enough points
                # Start path with first point
                path_data = [f"M {contour[0][0][0]} {contour[0][0][1]}"]
                
                # Add line segments to other points
                for point in contour[1:]:
                    x, y = point[0]
                    path_data.append(f"L {x} {y}")
                
                # Close the path if it has enough points
                if len(contour) > 3:
                    path_data.append("Z")
                
                # Add path to SVG
                path_string = " ".join(path_data)
                stroke_width = max(1, dilate_iterations)
                dwg.add(dwg.path(path_string, 
                               fill="none", 
                               stroke="#000000", 
                               stroke_width=stroke_width,
                               stroke_linecap="round",
                               stroke_linejoin="round"))
        
        # Return SVG as bytes
        svg_string = dwg.tostring()
        return svg_string.encode('utf-8')
        
    except Exception as e:
        raise ValueError(f"Failed to generate advanced outline: {str(e)}")