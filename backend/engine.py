import io
import time
import logging
from typing import Optional, Tuple, Dict, Any
from PIL import Image, ImageFilter, ImageOps
import numpy as np
import rembg

logger = logging.getLogger("violetcut.engine")

# Global session cache to prevent re-instantiating heavy ONNX sessions
_SESSIONS_CACHE: Dict[str, Any] = {}

AVAILABLE_MODELS = {
    "birefnet-general": {
        "name": "BiRefNet Ultra-Fidelidad (Recomendado)",
        "description": "Máxima precisión en cabellos finos, transparencias y bordes complejos.",
        "category": "Ultra HD",
        "tag": "Top Precisión"
    },
    "bria-rmbg": {
        "name": "BRIA RMBG-1.4 Studio Pro",
        "description": "Excelente para productos comerciales, retratos y moda.",
        "category": "Pro Studio",
        "tag": "Comercial"
    },
    "isnet-general-use": {
        "name": "IS-Net Crisp HD",
        "description": "Segmentación nítida con renderizado veloz.",
        "category": "Veloz",
        "tag": "Rápido"
    },
    "u2net": {
        "name": "U2Net Estándar",
        "description": "Modelo clásico equilibrado para todo tipo de objetos.",
        "category": "Estándar",
        "tag": "Equilibrado"
    }
}

def get_session(model_name: str):
    """Retrieve or create a cached ONNX session for the given model."""
    if model_name not in AVAILABLE_MODELS:
        model_name = "birefnet-general"
    
    if model_name not in _SESSIONS_CACHE:
        logger.info(f"Cargando sesión ONNX para modelo: {model_name}...")
        _SESSIONS_CACHE[model_name] = rembg.new_session(model_name)
        logger.info(f"Sesión cargada exitosamente: {model_name}")
    
    return _SESSIONS_CACHE[model_name]


def remove_background(
    image: Image.Image,
    model_name: str = "birefnet-general",
    alpha_matting: bool = False,
    alpha_matting_erode_size: int = 10,
    alpha_matting_foreground_threshold: int = 240,
    alpha_matting_background_threshold: int = 10,
    edge_feather: int = 0,
    only_mask: bool = False,
    background_color: Optional[Tuple[int, int, int, int]] = None
) -> Tuple[Image.Image, float]:
    """
    Remove background from PIL Image with high-precision options.
    Returns:
        Tuple of (Processed Image, execution_time_seconds)
    """
    start_time = time.time()
    
    # Ensure image is in RGB format for inference
    if image.mode != "RGB":
        orig_image = image.convert("RGB")
    else:
        orig_image = image.copy()
        
    session = get_session(model_name)
    
    # Process with rembg
    kwargs = {
        "session": session,
        "only_mask": only_mask
    }
    
    if alpha_matting:
        kwargs.update({
            "alpha_matting": True,
            "alpha_matting_erode_size": max(2, min(40, alpha_matting_erode_size)),
            "alpha_matting_foreground_threshold": alpha_matting_foreground_threshold,
            "alpha_matting_background_threshold": alpha_matting_background_threshold,
        })
        
    result_image = rembg.remove(orig_image, **kwargs)
    
    # Optional edge feathering / smoothing
    if edge_feather > 0 and not only_mask:
        # Separate alpha channel
        if result_image.mode == "RGBA":
            r, g, b, a = result_image.split()
            # Smooth the alpha mask slightly
            a_blurred = a.filter(ImageFilter.GaussianBlur(radius=edge_feather / 2.0))
            result_image = Image.merge("RGBA", (r, g, b, a_blurred))
            
    # Optional solid background color replacement
    if background_color is not None and not only_mask:
        bg = Image.new("RGBA", result_image.size, background_color)
        bg.paste(result_image, (0, 0), result_image)
        result_image = bg

    elapsed = round(time.time() - start_time, 3)
    return result_image, elapsed
