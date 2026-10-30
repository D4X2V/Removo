import os
import gc
import time
import logging
import threading
from typing import Optional, Tuple, Dict, Any
import numpy as np
from PIL import Image, ImageFilter
from scipy.ndimage import binary_erosion, minimum_filter, gaussian_filter
import onnxruntime as ort
from rembg.sessions import sessions_class

logger = logging.getLogger("removo.engine")

_SESSIONS_CACHE: Dict[str, Any] = {}
_CACHE_LOCK = threading.Lock()
_ACTIVE_PROVIDER: str = "CPUExecutionProvider"

AVAILABLE_MODELS = {
    "isnet-general-use": {
        "name_en": "IS-Net General (Ultra Fast — 0.3s GPU)",
        "name_es": "IS-Net General (Ultra Rápido — 0.3s GPU)",
        "desc_en": "Fast GPU-accelerated model for photos, people, and products.",
        "desc_es": "Modelo acelerado por GPU para fotos, personas y productos."
    },
    "isnet-anime": {
        "name_en": "IS-Net Anime & Illustration (0.2s GPU)",
        "name_es": "IS-Net Anime e Ilustración (0.2s GPU)",
        "desc_en": "Specialized for anime, 2D art, renders, and fine character hair.",
        "desc_es": "Especializado en anime, arte 2D, renders y cabello fino de personajes."
    },
    "bria-rmbg": {
        "name_en": "BRIA RMBG-1.4 (Studio Quality — 3s GPU)",
        "name_es": "BRIA RMBG-1.4 (Calidad Estudio — 3s GPU)",
        "desc_en": "High-precision commercial segmentation model accelerated on GPU.",
        "desc_es": "Modelo de alta precisión comercial acelerado por GPU."
    },
    "birefnet-general-lite": {
        "name_en": "BiRefNet Lite (High Detail — 6s)",
        "name_es": "BiRefNet Lite (Alto Detalle — 6s)",
        "desc_en": "Lightweight bilateral reference network for complex contours.",
        "desc_es": "Red bilateral ligera de alta definición para bordes complejos."
    }
}

def _build_session(model_name: str):
    """Instantiate ONNX session on the discrete GPU (DirectML device 1) with safe fallback."""
    global _ACTIVE_PROVIDER
    target_cls = None
    for sc in sessions_class:
        if sc.name() == model_name:
            target_cls = sc
            break

    if target_cls is None:
        raise ValueError(f"Unknown model: {model_name}")

    model_path = str(target_cls.download_models())
    avail = ort.get_available_providers()

    # Use DirectML on discrete GPU (device_id=1 is NVIDIA RTX 4060 on hybrid laptops) for supported models
    if "DmlExecutionProvider" in avail and model_name != "birefnet-general-lite":
        for dev_id in (1, 0):
            try:
                opts = ort.SessionOptions()
                opts.enable_mem_pattern = False
                opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
                opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_BASIC
                sess = target_cls.__new__(target_cls)
                sess.model_name = model_name
                sess.inner_session = ort.InferenceSession(
                    model_path,
                    sess_options=opts,
                    providers=[
                        ("DmlExecutionProvider", {"device_id": dev_id}),
                        "CPUExecutionProvider"
                    ]
                )
                _ACTIVE_PROVIDER = f"DirectML GPU (Device {dev_id})"
                return sess
            except Exception as e:
                logger.warning(f"DirectML dev {dev_id} fallback for {model_name}: {e}")

    # Optimized multi-threaded CPU fallback
    opts = ort.SessionOptions()
    opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_BASIC
    opts.intra_op_num_threads = 8
    opts.inter_op_num_threads = 1
    sess = target_cls.__new__(target_cls)
    sess.model_name = model_name
    sess.inner_session = ort.InferenceSession(
        model_path,
        sess_options=opts,
        providers=["CPUExecutionProvider"]
    )
    _ACTIVE_PROVIDER = "CPUExecutionProvider (8 Threads)"
    return sess

def get_session(model_name: str):
    """Retrieve cached session. Evicts old models first so RAM/VRAM never overflows."""
    if model_name not in AVAILABLE_MODELS:
        model_name = "isnet-general-use"

    with _CACHE_LOCK:
        if model_name not in _SESSIONS_CACHE:
            # Evict any previously loaded model so we never hold multiple heavy models in RAM/VRAM
            if _SESSIONS_CACHE:
                _SESSIONS_CACHE.clear()
                gc.collect()
            logger.info(f"Loading model session: {model_name}")
            _SESSIONS_CACHE[model_name] = _build_session(model_name)
            logger.info(f"Model ready: {model_name} on {_ACTIVE_PROVIDER}")

        return _SESSIONS_CACHE[model_name]

def get_active_provider() -> str:
    return _ACTIVE_PROVIDER

def warmup_model_async(model_name: str = "isnet-general-use", delay: float = 1.5):
    def _worker():
        if delay > 0:
            time.sleep(delay)
        try:
            sess = get_session(model_name)
            dummy = Image.new("RGB", (256, 256), (255, 255, 255))
            _ = sess.predict(dummy)
        except Exception as e:
            logger.warning(f"Warmup error: {e}")

    threading.Thread(target=_worker, daemon=True).start()

def decontaminate_and_clean_edges(
    rgb_img: Image.Image,
    mask_img: Image.Image,
    defringe_level: int = 2,
    edge_feather: int = 0
) -> Image.Image:
    """
    Removes white/background halos, clears trapped background pockets between hair/limbs,
    and unmixes background color spill along the outer contour in ~30ms.
    """
    rgb = np.array(rgb_img, dtype=np.float32)
    mask = np.array(mask_img.convert("L"), dtype=np.float32)

    if defringe_level > 0:
        # 1. Estimate background color from outer transparent region
        bg_pixels = mask < 15.0
        if np.any(bg_pixels):
            bg_color = np.median(rgb[bg_pixels], axis=0)
        else:
            bg_color = np.array([255.0, 255.0, 255.0], dtype=np.float32)

        bg_diff = np.max(np.abs(rgb - bg_color), axis=2)
        chroma = np.max(rgb, axis=2) - np.min(rgb, axis=2)
        luma = np.mean(rgb, axis=2)

        # 2. Clear trapped pure-background pockets (between hair strands, arms & waist)
        pocket_depth = 18 * defringe_level
        deep_interior = binary_erosion(mask > 200.0, iterations=pocket_depth)
        pocket_band = (mask > 0.0) & (~deep_interior)
        pure_bg_pocket = pocket_band & (bg_diff < (8.0 + 4.0 * defringe_level)) & (chroma < 18.0)
        mask[pure_bg_pocket] = 0.0

        # 3. Suppress background halo in the outer boundary band (after pocket removal)
        band_width = 2 + defringe_level * 2
        solid_core = binary_erosion(mask > 220.0, iterations=band_width)
        edge_band = (mask > 0.0) & (~solid_core)

        thresh_diff = 35.0 + 12.0 * defringe_level
        bg_match = np.clip((thresh_diff - bg_diff) / 32.0, 0.0, 1.0)
        if np.mean(bg_color) > 180.0:
            neutral_spill = (
                np.clip((luma - (155.0 - 10.0 * defringe_level)) / 45.0, 0.0, 1.0)
                * np.clip(((24.0 + 4.0 * defringe_level) - chroma) / 18.0, 0.0, 1.0)
            )
            bg_match = np.maximum(bg_match, neutral_spill)

        mask[edge_band] *= (1.0 - bg_match[edge_band])

        # 4. Morphological 1px edge tightening + smooth anti-aliasing ramp
        eroded_mask = minimum_filter(mask, size=3)
        outer_ring = (mask > 0.0) & (~binary_erosion(mask > 240.0, iterations=2 + defringe_level))
        blend_w = min(1.0, 0.45 * defringe_level)
        mask[outer_ring] = blend_w * eroded_mask[outer_ring] + (1.0 - blend_w) * mask[outer_ring]

        low_clip = 22.0 + 10.0 * defringe_level
        mask = np.clip((mask - low_clip) * (255.0 / (242.0 - low_clip)), 0.0, 255.0)
        mask = gaussian_filter(mask, sigma=0.45)

        # 5. Foreground RGB Color Decontamination on the outer 4px boundary ring
        decontam_ring = (mask > 0.0) & (~binary_erosion(mask > 245.0, iterations=4))
        rgb_eroded = np.stack([minimum_filter(rgb[:, :, c], size=5) for c in range(3)], axis=2)
        a_norm = np.clip(mask / 255.0, 0.25, 1.0)[:, :, None]
        rgb_unmixed = np.clip((rgb - (1.0 - a_norm) * bg_color) / a_norm, 0.0, 255.0)
        rgb[decontam_ring] = np.minimum(rgb_unmixed[decontam_ring], rgb_eroded[decontam_ring])

    if edge_feather > 0:
        mask = gaussian_filter(mask, sigma=edge_feather * 0.45)

    rgba = np.dstack([
        np.clip(rgb, 0, 255).astype(np.uint8),
        np.clip(mask, 0, 255).astype(np.uint8)
    ])
    return Image.fromarray(rgba, mode="RGBA")

def remove_background(
    image: Image.Image,
    model_name: str = "isnet-general-use",
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
    Fast GPU-accelerated background removal with automatic white-fringe decontamination.
    """
    start_time = time.perf_counter()

    orig_rgb = image.convert("RGB")
    session = get_session(model_name)

    masks = session.predict(orig_rgb)
    raw_mask = masks[0]

    if only_mask:
        elapsed = round(time.perf_counter() - start_time, 3)
        return raw_mask.convert("L"), elapsed

    # Clean white halos/pockets when post_process_mask (Clean Edges / Defringe) is enabled
    defringe_lvl = 2 if post_process_mask else 0
    if alpha_matting:
        defringe_lvl = max(defringe_lvl, 3)

    result_image = decontaminate_and_clean_edges(
        rgb_img=orig_rgb,
        mask_img=raw_mask,
        defringe_level=defringe_lvl,
        edge_feather=edge_feather
    )

    if background_color is not None:
        bg = Image.new("RGBA", result_image.size, background_color)
        bg = Image.alpha_composite(bg, result_image)
        result_image = bg

    elapsed = round(time.perf_counter() - start_time, 3)
    return result_image, elapsed
