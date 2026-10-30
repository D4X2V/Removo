# Removo

<div align="center">
  <img src="assets/logo.svg" alt="Removo Logo" width="120" height="120">
  <br>
  <p><strong>Local background removal utility powered by ONNX Runtime, BRIA RMBG-1.4, and BiRefNet.</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-7C3AED.svg)](LICENSE)
  [![Python](https://img.shields.io/badge/Python-3.10%2B-8B5CF6.svg)](https://www.python.org/)
  [![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
  [![ONNX Runtime](https://img.shields.io/badge/Inference-ONNX%20Runtime-A855F7.svg)](https://onnxruntime.ai/)
</div>

---

## Overview

**Removo** is a local desktop application for removing image backgrounds offline. It runs neural segmentation models directly on your hardware using ONNX Runtime, ensuring zero cloud uploads and full control over the rendering pipeline.

### Key Features

- **Multiple Segmentation Models:**
  - `bria-rmbg` (BRIA RMBG-1.4) — High-speed inference with sharp subject and object boundaries.
  - `birefnet-general` (BiRefNet) — High-resolution bilateral network for fine hair, fur, and complex edges.
  - `isnet-general-use` (IS-Net) — Lightweight model for low-memory environments.
  - `u2net` — Standard salience segmentation model.
- **Manual Execution Workflow:** Uploading or pasting an image (`Ctrl + V`) stages it for inspection without triggering automatic inference. Rendering starts only when clicking **Remove Background**.
- **Auto-Save & Native Folder Picker:** Automatically writes processed outputs to your chosen directory. If no output directory is configured when rendering starts, Removo prompts you with a native OS folder selector (similar to Upscayl).
- **Performance Optimizations:**
  - Multi-threaded ONNX Runtime graph optimization (`ORT_ENABLE_ALL`) and memory arena caching.
  - Background model pre-warming on startup to eliminate cold-start latency.
  - Fast lossless PNG encoding (`compress_level=1`).
- **Interactive Inspection & Export:**
  - Split comparison slider, side-by-side view, and backdrop color switcher.
  - One-click PNG clipboard copy with alpha channel preserved.
  - Bulk batch processing with automatic folder saving and `.zip` export.
- **Customizable Interface:**
  - Dark and Light purple themes.
  - Built-in English (default) and Spanish localization.

---

## Project Structure

```text
Removo/
├── assets/                     # SVG, PNG, and multi-resolution ICO icons
├── backend/
│   ├── engine.py               # ONNX session manager, warmup, and inference pipeline
│   └── server.py               # FastAPI endpoints, native folder dialog, and auto-save
├── frontend/
│   ├── index.html              # Application layout (Single, Batch, Settings)
│   ├── style.css               # Dark & Light purple themes
│   └── app.js                  # State management, i18n, and comparison slider
├── create_desktop_shortcut.py  # Creates a Windows desktop shortcut
├── generate_assets.py          # Generates application icons
├── launch.bat                  # Command-line launcher
├── Removo.vbs                  # Windowless desktop launcher
├── main.py                     # Server entrypoint and native app-mode window launcher
└── requirements.txt            # Python dependencies
```

---

## Getting Started

### Prerequisites

- Python 3.10+
- Windows 10/11 (with Edge, Chrome, or Brave for standalone `--app` window mode)

### Installation

```bash
git clone https://github.com/Diego-Villanueva-v/Removo.git
cd Removo
pip install -r requirements.txt
```

### Running the Application

```bash
python main.py
```

To create a shortcut on your Windows Desktop:

```bash
python create_desktop_shortcut.py
```

---

## License

Released under the [MIT License](LICENSE). Created by [Diego Villanueva](https://github.com/Diego-Villanueva-v).
