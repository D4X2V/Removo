import os
import time
import logging
import threading
from typing import Optional, Tuple, Dict, Any
from PIL import Image, ImageFilter
import onnxruntime as ort
import rembg

logger = logging.getLogger("removo.engine")

_SESSIONS_CACHE: Dict[str, Any] = {}
_CACHE_LOCK = threading.Lock()

AVAILABLE_MODELS = {
    "bria-rmbg": {
        "name_en": "BRIA RMBG-1.4 (Fast & High Precision)",
        "name_es": "BRIA RMBG-1.4 (Rápido y Alta Precisión)",
        "desc_en": "Balanced high-speed inference with sharp subject segmentation.",
        "desc_es": "Inferencia rápida con segmentación nítida de objetos y personas."
    },
    "birefnet-general": {
        "name_en": "BiRefNet General (Maximum Detail)",
        "name_es": "BiRefNet General (Máximo Detalle)",
        "desc_en": "High-resolution bilateral network for fine hair, fur, and complex edges.",
        "desc_es": "Red bilateral de alta resolución para cabello fino y bordes complejos."
    },
    "isnet-general-use": {
        "name_en": "IS-Net General (Lightweight)",
        "name_es": "IS-Net General (Ligero)",
        "desc_en": "Lightweight model for quick cutouts and low memory usage.",
        "desc_es": "Modelo ligero para recortes rápidos y bajo consumo de memoria."
    },
    "u2net": {
        "name_en": "U2Net Standard",
        "name_es": "U2Net Estándar",
        "desc_en": "Standard general-purpose salience segmentation model.",
        "desc_es": "Modelo estándar de propósito general."
    }
}

def _create_session_options() -> ort.SessionOptions:
    opts = ort.SessionOptions()
    opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
    cpu_threads = os.cpu_count() or 4
    opts.intra_op_num_threads = cpu_threads
    opts.inter_op_num_threads = max(1, cpu_threads // 2)
    opts.enable_mem_pattern = True
    opts.enable_cpu_mem_arena = True
    opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
    return opts

def _get_optimal_providers():
    available = ort.get_available_providers()
    preferred = []
    for p in ["CUDAExecutionProvider", "DmlExecutionProvider", "CPUExecutionProvider"]:
        if p in available:
            preferred.append(p)
    return preferred if preferred else available

def get_session(model_name: str):
    """Retrieve or initialize a cached ONNX session with full hardware optimizations."""
    if model_name not in AVAILABLE_MODELS:
        model_name = "bria-rmbg"

    with _CACHE_LOCK:
        if model_name not in _SESSIONS_CACHE:
            logger.info(f"Loading ONNX session for model: {model_name}")
            opts = _create_session_options()
            providers = _get_optimal_providers()
            _SESSIONS_CACHE[model_name] = rembg.new_session(
                model_name,
                sess_opts=opts,
                providers=providers
            )
            logger.info(f"Session ready: {model_name} ({providers})")

        return _SESSIONS_CACHE[model_name]

def warmup_model_async(model_name: str = "bria-rmbg"):
    """Preload the default model in a background thread so the first render is instant."""
    def _worker():
        try:
            get_session(model_name)
        except Exception as e:
            logger.warning(f"Warmup failed for {model_name}: {e}")

    t = threading.Thread(target=_worker, daemon=True)
    t.start()

def remove_background(
    image: Image.Image,
    model_name: str = "bria-rmbg",
    alpha_matting: bool = False,
    alpha_matting_erode_size: int = 10,
    alpha_matting_foreground_threshold: int = 240,
    alpha_matting_background_threshold: int = 10,
    post_process_mask: bool = True,
    edge_feather: int = 0,
    only_mask: bool = False,
    background_color: Optional[Tuple[int, int, int, int]] = None
) -> Tuple[Image.Image, float]:
    """
    Run background removal with optimized ONNX Runtime session.
    Returns (Processed PIL Image, elapsed_seconds).
    """
    start_time = time.perf_counter()

    # Handle EXIF orientation and convert to RGB
    if image.mode not in ("RGB", "RGBA"):
        orig_image = image.convert("RGB")
    else:
        orig_image = image

    session = get_session(model_name)

    kwargs = {
        "session": session,
        "only_mask": only_mask,
        "post_process_mask": post_process_mask
    }

    if alpha_matting:
        kwargs.update({
            "alpha_matting": True,
            "alpha_matting_erode_size": max(1, min(40, alpha_matting_erode_size)),
            "alpha_matting_foreground_threshold": alpha_matting_foreground_threshold,
            "alpha_matting_background_threshold": alpha_matting_background_threshold,
        })

    result_image = rembg.remove(orig_image, **kwargs)

    # Optional edge feathering on alpha channel
    if edge_feather > 0 and not only_mask and result_image.mode == "RGBA":
        r, g, b, a = result_image.split()
        a_smooth = a.filter(ImageFilter.GaussianBlur(radius=edge_feather * 0.4))
        result_image = Image.merge("RGBA", (r, g, b, a_smooth))

    # Optional solid background color composite
    if background_color is not None and not only_mask:
        if result_image.mode != "RGBA":
            result_image = result_image.convert("RGBA")
        bg = Image.new("RGBA", result_image.size, background_color)
        bg.paste(result_image, (0, 0), result_image)
        result_image = bg

    elapsed = round(time.perf_counter() - start_time, 3)
    return result_image, elapsed
