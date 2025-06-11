from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from fastapi.concurrency import run_in_threadpool
from pydantic import BaseModel, conint
from typing import Optional, List, Dict
from color_analysis import extract_palette, extract_detailed_palette, get_pixel_color, get_image_dimensions
from outline_generation import generate_coloring_book_outline, generate_advanced_outline
import io

app = FastAPI(title="Hueseum API", version="1.0.0")

class PaletteRequest(BaseModel):
    image_data: str

class PixelColorRequest(BaseModel):
    image_data: str

class OutlineRequest(BaseModel):
    image_data: str

class AdvancedOutlineRequest(BaseModel):
    image_data: str
    blur_kernel: int = 3
    canny_low: int = 50
    canny_high: int = 150
    dilate_iterations: int = 1

# CORS middleware for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # Next.js dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Hueseum API is running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/palette", summary="Extract dominant colours from an image")
async def palette_route(
    request: PaletteRequest,
    size: conint(ge=3, le=24) = Query(12, description="Number of colours to extract"),
):
    """Extract a clean palette of dominant colors from a base64 encoded image."""
    try:
        import base64
        
        image_data = request.image_data
        
        # Handle data URL format (data:image/jpeg;base64,...)
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        # Decode base64 to bytes
        img_bytes = base64.b64decode(image_data)
        
        # Off-load the CPU work so the async event loop stays free
        detailed_palette = await run_in_threadpool(extract_detailed_palette, img_bytes, size)
        
        return JSONResponse({
            "palette": detailed_palette,
            "count": len(detailed_palette)
        })
        
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing image: {str(e)}")

@app.post("/analyze-colors")
async def analyze_colors(file: UploadFile = File(...), num_colors: int = 5):
    """
    Analyze dominant colors in an uploaded image
    """
    if not file.content_type or not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    try:
        # Read and process the image
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        # Convert to RGB
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        # Convert to numpy array for analysis
        img_array = np.array(image)
        
        # Reshape image to be a list of pixels
        pixels = img_array.reshape(-1, 3)
        
        # Use k-means to find dominant colors
        kmeans = KMeans(n_clusters=min(num_colors, len(np.unique(pixels, axis=0))), random_state=42, n_init=10)
        kmeans.fit(pixels)
        
        # Get the dominant colors
        colors = kmeans.cluster_centers_.astype(int)
        
        # Calculate color percentages
        labels = kmeans.labels_
        percentages = []
        for i in range(len(colors)):
            percentage = np.sum(labels == i) / len(labels) * 100
            percentages.append(round(percentage, 2))
        
        # Convert colors to hex
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
        
        return {
            "dominant_colors": dominant_colors,
            "image_dimensions": {"width": image.size[0], "height": image.size[1]}
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error analyzing colors: {str(e)}")

@app.post("/get-pixel-color")
async def get_pixel_color_route(
    request: PixelColorRequest,
    x: int = Query(..., description="X coordinate"),
    y: int = Query(..., description="Y coordinate"),
):
    """Get the color of a specific pixel in the image."""
    try:
        import base64
        
        image_data = request.image_data
        
        # Handle data URL format (data:image/jpeg;base64,...)
        if image_data.startswith('data:image'):
            image_data = image_data.split(',')[1]
        
        # Decode base64 to bytes
        img_bytes = base64.b64decode(image_data)
        
        # Off-load the CPU work so the async event loop stays free
        pixel_color_data = await run_in_threadpool(get_pixel_color, img_bytes, x, y)
        
        return JSONResponse(pixel_color_data)
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error getting pixel color: {str(e)}")

@app.post("/generate-outline", summary="Generate coloring book outline from image")
async def generate_outline_route(request: OutlineRequest):
    """Generate a coloring book outline suitable for printing and sketching."""
    try:
        # Generate outline using OpenCV in a thread pool to avoid blocking
        outline_bytes = await run_in_threadpool(
            generate_coloring_book_outline,
            request.image_data
        )
        
        # Return as downloadable PNG file
        return StreamingResponse(
            io.BytesIO(outline_bytes),
            media_type="image/png",
            headers={"Content-Disposition": "attachment; filename=outline.png"}
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating outline: {str(e)}")

@app.post("/generate-advanced-outline", summary="Generate customizable coloring book outline")
async def generate_advanced_outline_route(request: AdvancedOutlineRequest):
    """Generate a coloring book outline with customizable detail parameters."""
    try:
        # Generate outline with custom parameters using OpenCV in a thread pool
        outline_bytes = await run_in_threadpool(
            generate_advanced_outline,
            request.image_data,
            request.blur_kernel,
            request.canny_low,
            request.canny_high,
            request.dilate_iterations
        )
        
        # Return as downloadable SVG file
        return StreamingResponse(
            io.BytesIO(outline_bytes),
            media_type="image/svg+xml",
            headers={"Content-Disposition": "attachment; filename=custom-outline.svg"}
        )
        
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating custom outline: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)