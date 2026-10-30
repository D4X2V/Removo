import os
import io
import json
import base64
import zipfile
from pathlib import Path
from typing import List, Optional
from contextlib import asynccontextmanager

from fastapi import FastAPI, File, UploadFile, Form, HTTPException, Body
from fastapi.responses import HTMLResponse, FileResponse, StreamingResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image, ImageOps
import onnxruntime as ort

from .engine import (
    remove_background,
    AVAILABLE_MODELS,
    _SESSIONS_CACHE,
    warmup_model_async,
    get_session,
    get_active_provider
)

BASE_DIR = Path(__file__).resolve().parent.parent
FRONTEND_DIR = BASE_DIR / "frontend"
ASSETS_DIR = BASE_DIR / "assets"
CONFIG_PATH = BASE_DIR / "config.json"

DEFAULT_CONFIG = {
    "output_folder": "",
    "auto_save": True,
    "default_model": "isnet-general-use",
    "preload_on_startup": True,
    "output_format": "png",
    "overwrite_existing": False,
    "language": "en",
    "theme": "dark"
}

def load_config() -> dict:
    if CONFIG_PATH.exists():
        try:
            with open(CONFIG_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                merged = {**DEFAULT_CONFIG, **data}
                return merged
        except Exception:
            pass
    return DEFAULT_CONFIG.copy()

def save_config(cfg: dict) -> dict:
    current = load_config()
    current.update(cfg)
    with open(CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(current, f, indent=2)
    return current

@asynccontextmanager
async def lifespan(app: FastAPI):
    cfg = load_config()
    if cfg.get("preload_on_startup", True):
        warmup_model_async(cfg.get("default_model", "isnet-general-use"), delay=1.0)
    yield

app = FastAPI(title="Removo", version="2.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if ASSETS_DIR.exists():
    app.mount("/assets", StaticFiles(directory=str(ASSETS_DIR)), name="assets")

def hex_to_rgba(hex_str: Optional[str]):
    if not hex_str or hex_str == "transparent":
        return None
    hex_clean = hex_str.lstrip("#")
    if len(hex_clean) == 6:
        return (
            int(hex_clean[0:2], 16),
            int(hex_clean[2:4], 16),
            int(hex_clean[4:6], 16),
            255
        )
    return None

def resolve_unique_path(directory: Path, stem: str, ext: str, overwrite: bool = False) -> Path:
    ext = ext.lstrip(".").lower()
    candidate = directory / f"{stem}_removo.{ext}"
    if overwrite or not candidate.exists():
        return candidate
    counter = 1
    while True:
        candidate = directory / f"{stem}_removo_{counter}.{ext}"
        if not candidate.exists():
            return candidate
        counter += 1

def save_image_bytes(img: Image.Image, fmt: str = "png") -> bytes:
    fmt = fmt.lower()
    buf = io.BytesIO()
    if fmt in ("jpg", "jpeg"):
        if img.mode == "RGBA":
            bg = Image.new("RGB", img.size, (255, 255, 255))
            bg.paste(img, mask=img.split()[3])
            img = bg
        else:
            img = img.convert("RGB")
        img.save(buf, format="JPEG", quality=95)
    elif fmt == "webp":
        img.save(buf, format="WEBP", quality=95, method=0)
    else:
        # compress_level=1 is ~12x faster than optimize=True while remaining 100% lossless PNG
        img.save(buf, format="PNG", compress_level=1)
    return buf.getvalue()

@app.get("/api/settings")
async def get_settings():
    cfg = load_config()
    return {
        "settings": cfg,
        "system": {
            "cpu_threads": os.cpu_count() or 4,
            "providers": ort.get_available_providers(),
            "cached_models": list(_SESSIONS_CACHE.keys()),
            "github_profile": "https://github.com/Diego-Villanueva-v",
            "github_repo": "https://github.com/Diego-Villanueva-v/Removo"
        },
        "models": [
            {"id": k, **v, "cached": k in _SESSIONS_CACHE}
            for k, v in AVAILABLE_MODELS.items()
        ]
    }

@app.post("/api/settings")
async def update_settings(payload: dict = Body(...)):
    updated = save_config(payload)
    if "default_model" in payload:
        warmup_model_async(updated["default_model"])
    return {"status": "ok", "settings": updated}

@app.post("/api/select-folder")
async def select_output_folder():
    """Open native OS directory dialog (Upscayl-style) to pick output folder."""
    cfg = load_config()
    initial_dir = cfg.get("output_folder") or str(Path.home() / "Pictures")
    if not Path(initial_dir).exists():
        initial_dir = str(Path.home())

    selected = ""
    try:
        import tkinter as tk
        from tkinter import filedialog
        root = tk.Tk()
        root.withdraw()
        root.attributes("-topmost", True)
        selected = filedialog.askdirectory(
            initialdir=initial_dir,
            title="Removo — Select Output Folder"
        )
        root.destroy()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Dialog error: {e}")

    if selected:
        norm_path = str(Path(selected).resolve())
        Path(norm_path).mkdir(parents=True, exist_ok=True)
        updated = save_config({"output_folder": norm_path})
        return {"status": "selected", "output_folder": norm_path, "settings": updated}

    return {"status": "cancelled", "output_folder": cfg.get("output_folder", "")}

@app.post("/api/open-folder")
async def open_output_folder():
    cfg = load_config()
    folder = cfg.get("output_folder", "")
    if not folder or not Path(folder).exists():
        raise HTTPException(status_code=400, detail="NO_OUTPUT_FOLDER")
    if os.name == "nt":
        os.startfile(folder)
    return {"status": "opened", "path": folder}

@app.post("/api/preload")
async def preload_model(payload: dict = Body(...)):
    model_name = payload.get("model_name", "bria-rmbg")
    get_session(model_name)
    return {"status": "ready", "model_name": model_name, "cached_models": list(_SESSIONS_CACHE.keys())}

@app.post("/api/process")
async def process_image(
    file: UploadFile = File(...),
    model_name: str = Form("bria-rmbg"),
    alpha_matting: bool = Form(False),
    alpha_matting_erode_size: int = Form(10),
    post_process_mask: bool = Form(True),
    edge_feather: int = Form(0),
    only_mask: bool = Form(False),
    bg_color: Optional[str] = Form(None)
):
    cfg = load_config()
    output_folder = cfg.get("output_folder", "").strip()
    auto_save = cfg.get("auto_save", True)

    # Enforce Upscayl behavior: if auto_save is enabled and no output_folder is set, tell frontend
    if auto_save and not output_folder:
        raise HTTPException(status_code=428, detail="OUTPUT_FOLDER_REQUIRED")

    try:
        contents = await file.read()
        orig_img = Image.open(io.BytesIO(contents))
        orig_img = ImageOps.exif_transpose(orig_img)

        rgba_color = hex_to_rgba(bg_color)

        result_img, elapsed = remove_background(
            image=orig_img,
            model_name=model_name,
            alpha_matting=alpha_matting,
            alpha_matting_erode_size=alpha_matting_erode_size,
            post_process_mask=post_process_mask,
            edge_feather=edge_feather,
            only_mask=only_mask,
            background_color=rgba_color
        )

        out_fmt = cfg.get("output_format", "png").lower()
        # Always send lossless fast PNG for the UI canvas preview
        preview_bytes = save_image_bytes(result_img, "png")
        b64_str = base64.b64encode(preview_bytes).decode("utf-8")
        data_url = f"data:image/png;base64,{b64_str}"

        saved_path = None
        if auto_save and output_folder:
            out_dir = Path(output_folder)
            out_dir.mkdir(parents=True, exist_ok=True)
            stem = Path(file.filename or "image").stem
            target_path = resolve_unique_path(
                out_dir,
                stem,
                out_fmt,
                overwrite=cfg.get("overwrite_existing", False)
            )
            disk_bytes = preview_bytes if out_fmt == "png" else save_image_bytes(result_img, out_fmt)
            with open(target_path, "wb") as f:
                f.write(disk_bytes)
            saved_path = str(target_path)

        return {
            "status": "success",
            "image": data_url,
            "elapsed_seconds": elapsed,
            "width": result_img.width,
            "height": result_img.height,
            "original_size": len(contents),
            "processed_size": len(preview_bytes),
            "model_used": model_name,
            "saved_path": saved_path
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/batch")
async def process_batch(
    files: List[UploadFile] = File(...),
    model_name: str = Form("bria-rmbg"),
    alpha_matting: bool = Form(False),
    post_process_mask: bool = Form(True),
    edge_feather: int = Form(0),
    bg_color: Optional[str] = Form(None)
):
    cfg = load_config()
    output_folder = cfg.get("output_folder", "").strip()
    auto_save = cfg.get("auto_save", True)

    if auto_save and not output_folder:
        raise HTTPException(status_code=428, detail="OUTPUT_FOLDER_REQUIRED")

    try:
        rgba_color = hex_to_rgba(bg_color)
        out_fmt = cfg.get("output_format", "png").lower()
        zip_buffer = io.BytesIO()

        out_dir = Path(output_folder) if (auto_save and output_folder) else None
        if out_dir:
            out_dir.mkdir(parents=True, exist_ok=True)

        with zipfile.ZipFile(zip_buffer, "w", zipfile.ZIP_STORED) as zip_file:
            for file in files:
                contents = await file.read()
                orig_img = Image.open(io.BytesIO(contents))
                orig_img = ImageOps.exif_transpose(orig_img)

                result_img, _ = remove_background(
                    image=orig_img,
                    model_name=model_name,
                    alpha_matting=alpha_matting,
                    post_process_mask=post_process_mask,
                    edge_feather=edge_feather,
                    background_color=rgba_color
                )

                file_bytes = save_image_bytes(result_img, out_fmt)
                stem = Path(file.filename or "image").stem
                out_name = f"{stem}_removo.{out_fmt}"

                if out_dir:
                    disk_target = resolve_unique_path(
                        out_dir,
                        stem,
                        out_fmt,
                        overwrite=cfg.get("overwrite_existing", False)
                    )
                    with open(disk_target, "wb") as f:
                        f.write(file_bytes)
                    out_name = disk_target.name

                zip_file.writestr(out_name, file_bytes)

        zip_buffer.seek(0)
        return StreamingResponse(
            zip_buffer,
            media_type="application/zip",
            headers={"Content-Disposition": 'attachment; filename="removo_batch.zip"'}
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/favicon.ico")
async def favicon():
    ico_path = ASSETS_DIR / "app.ico"
    if ico_path.exists():
        return FileResponse(ico_path)
    return HTMLResponse("")

if FRONTEND_DIR.exists():
    app.mount("/", StaticFiles(directory=str(FRONTEND_DIR), html=True), name="frontend")
