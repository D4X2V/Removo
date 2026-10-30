import os
import io
import base64
import zipfile
import subprocess
from pathlib import Path
from typing import List, Optional

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.responses import HTMLResponse, FileResponse, JSONResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

from .engine import remove_background, AVAILABLE_MODELS, _SESSIONS_CACHE

app = FastAPI(title="VioletCut AI Studio", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
ASSETS_DIR = BASE_DIR / "assets"
OUTPUT_DIR = Path.home() / "Pictures" / "VioletCut"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

# Mount static directories
if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")

def hex_to_rgba(hex_str: Optional[str]):
    if not hex_str or hex_str == "transparent":
        return None
    hex_clean = hex_str.lstrip("#")
    if len(hex_clean) == 6:
        r = int(hex_clean[0:2], 16)
        g = int(hex_clean[2:4], 16)
        b = int(hex_clean[4:6], 16)
        return (r, g, b, 255)
    elif len(hex_clean) == 8:
        r = int(hex_clean[0:2], 16)
        g = int(hex_clean[2:4], 16)
        b = int(hex_clean[4:6], 16)
        a = int(hex_clean[6:8], 16)
        return (r, g, b, a)
    return None

@app.get("/api/models")
async def get_models():
    models_info = []
    for model_id, data in AVAILABLE_MODELS.items():
        is_cached = model_id in _SESSIONS_CACHE
        models_info.append({
            "id": model_id,
            "name": data["name"],
            "description": data["description"],
            "category": data["category"],
            "tag": data["tag"],
            "cached": is_cached
        })
    return {"models": models_info, "default": "birefnet-general"}

@app.post("/api/process")
async def process_image(
    file: UploadFile = File(...),
    model_name: str = Form("birefnet-general"),
    alpha_matting: bool = Form(False),
    alpha_matting_erode_size: int = Form(10),
    edge_feather: int = Form(0),
    only_mask: bool = Form(False),
    bg_color: Optional[str] = Form(None)
):
    try:
        contents = await file.read()
        orig_img = Image.open(io.BytesIO(contents))
        
        # Color parsing
        rgba_color = hex_to_rgba(bg_color)
        
        # Inference
        result_img, elapsed = remove_background(
            image=orig_img,
            model_name=model_name,
            alpha_matting=alpha_matting,
            alpha_matting_erode_size=alpha_matting_erode_size,
            edge_feather=edge_feather,
            only_mask=only_mask,
            background_color=rgba_color
        )
        
        # Convert to PNG buffer
        buffer = io.BytesIO()
        result_img.save(buffer, format="PNG", optimize=True)
        img_bytes = buffer.getvalue()
        
        b64_str = base64.b64encode(img_bytes).decode("utf-8")
        data_url = f"data:image/png;base64,{b64_str}"
        
        return {
            "status": "success",
            "image": data_url,
            "elapsed_seconds": elapsed,
            "width": result_img.width,
            "height": result_img.height,
            "original_size": len(contents),
            "processed_size": len(img_bytes),
            "model_used": model_name
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/batch")
async def process_batch(
    files: List[UploadFile] = File(...),
    model_name: str = Form("birefnet-general"),
    alpha_matting: bool = Form(False),
    edge_feather: int = Form(0),
    bg_color: Optional[str] = Form(None)
):
    try:
        rgba_color = hex_to_rgba(bg_color)
        zip_buffer = io.BytesIO()
        
        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_DEFLATED) as zip_file:
            for file in files:
                contents = await file.read()
                orig_img = Image.open(io.BytesIO(contents))
                
                result_img, _ = remove_background(
                    image=orig_img,
                    model_name=model_name,
                    alpha_matting=alpha_matting,
                    edge_feather=edge_feather,
                    background_color=rgba_color
                )
                
                img_buf = io.BytesIO()
                result_img.save(img_buf, format="PNG")
                
                base_name = Path(file.filename or "image").stem
                zip_file.writestr(f"{base_name}_violetcut.png", img_buf.getvalue())
                
        zip_buffer.seek(0)
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": 'attachment; filename="violetcut_batch_export.zip"'}
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/save-disk")
async def save_to_disk(
    file_data: str = Form(...),
    filename: str = Form("recorte_violetcut.png")
):
    try:
        # Strip data URL header
        if "," in file_data:
            _, encoded = file_data.split(",", 1)
        else:
            encoded = file_data
            
        data = base64.b64decode(encoded)
        
        safe_filename = Path(filename).name
        target_path = OUTPUT_DIR / safe_filename
        
        with open(target_path, "wb") as f:
            f.write(data)
            
        return {"status": "saved", "path": str(target_path)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/open-folder")
async def open_output_folder():
    try:
        if os.name == "nt":
            os.startfile(str(OUTPUT_DIR))
        return {"status": "opened", "path": str(OUTPUT_DIR)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/favicon.ico")
async def favicon():
    ico_path = ASSETS_DIR / "app.ico"
    if ico_path.exists():
        return FileResponse(ico_path)
    return HTMLResponse("")

# Mount frontend files at root
if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
