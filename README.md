# Removo

<div align="center">
  <img src="assets/logo.svg" alt="Removo Logo" width="120" height="120">
  <br>
  <p><strong>Local GPU-accelerated background removal and cutout refinement desktop utility.</strong></p>

  [![License: MIT](https://img.shields.io/badge/License-MIT-7C3AED.svg)](LICENSE)
  [![Python](https://img.shields.io/badge/Python-3.10%2B-8B5CF6.svg)](https://www.python.org/)
  [![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
  [![ONNX Runtime](https://img.shields.io/badge/Inference-DirectML%20%2F%20ONNX-A855F7.svg)](https://onnxruntime.ai/)
</div>

---

## Overview

**Removo** is a standalone desktop application for removing image backgrounds and refining cutouts locally. It executes neural segmentation models directly on your GPU or CPU via ONNX Runtime, keeping all image processing offline with zero cloud dependencies.

### Key Features

- **GPU-Accelerated Segmentation Models:**
  - `isnet-general-use` (IS-Net General) — Ultra-fast general-purpose segmentation for photos, people, and products (~0.3s on GPU).
  - `isnet-anime` (IS-Net Anime & Illustration) — High-precision segmentation for 2D art, characters, and fine hair strands (~0.2s on GPU).
  - `bria-rmbg` (BRIA RMBG-1.4) — Studio-grade commercial segmentation model (~3s on GPU).
  - `birefnet-general-lite` (BiRefNet Lite) — High-resolution bilateral reference network for intricate contours.
- **Smart Edge Decontamination (Defringe):**
  - Automatically removes background color spill and trapped background pockets while preserving white foreground details.
- **Interactive Brush Editor (Restore & Erase):**
  - **Restore** missing details from the original image or **Erase** unwanted regions using soft or hard brushes.
  - **Original Guide** overlay to inspect the source image underneath transparent areas while painting.
  - **Cursor-Anchored Wheel Zoom** (scroll wheel to zoom directly toward the pointer), **Right-Click / Spacebar Drag** to pan, **`Alt + Wheel`** to resize the brush, and **Undo / Redo (`Ctrl + Z` / `Ctrl + Y`)**.
- **Post-Generation Subject Outline:**
  - Optional customizable contour stroke with adjustable thickness (`0–36 px`), color presets, and custom color picker, exported and saved directly with the cutout.
- **Manual Execution & Auto-Save Workflow:**
  - Uploading or pasting (`Ctrl + V`) an image stages it for inspection without triggering automatic rendering. Processing starts only when clicking **Remove Background**.
  - Automatically writes processed and edited outputs to your configured Output Folder, prompting with a native directory selector if none is set.
- **Themes & Localization:**
  - Dark Purple and Light Purple themes.
  - Built-in English (default) and Spanish interface localization.

---

## Project Structure

```text
Removo/
├── assets/                     # SVG, PNG, and multi-resolution ICO icons
├── backend/
│   ├── engine.py               # DirectML GPU / ONNX session manager and edge decontamination
│   └── server.py               # FastAPI endpoints, native folder selector, and auto-save
├── frontend/
│   ├── index.html              # Application layout (Single, Batch, Settings)
│   ├── style.css               # Dark & Light purple themes
│   └── app.js                  # Brush editor, subject outline, i18n, and state controller
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
