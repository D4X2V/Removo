# 💜 VioletCut AI Studio — Ultra-Precision Background Removal

<div align="center">
  <img src="assets/logo.svg" alt="VioletCut AI Logo" width="140" height="140">
  <br>
  <h3>Segmentación Neuronal de Máxima Fidelidad & Estudio de Recorte Local</h3>

  [![License: MIT](https://img.shields.io/badge/License-MIT-purple.svg)](LICENSE)
  [![Python](https://img.shields.io/badge/Python-3.10%2B-blueviolet.svg)](https://www.python.org/)
  [![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688.svg)](https://fastapi.tiangolo.com/)
  [![Model](https://img.shields.io/badge/AI%20Engine-BiRefNet%20%7C%20RMBG--1.4-8B5CF6.svg)](https://github.com/ZhengPeng7/BiRefNet)
  [![Privacy](https://img.shields.io/badge/Privacy-100%25%20On--Device-success.svg)](#privacidad)
</div>

---

## 🌟 ¿Qué es VioletCut AI?

**VioletCut AI** es una aplicación de escritorio moderna y ultra-precisa diseñada para eliminar y reemplazar fondos de imágenes utilizando redes neuronales de última generación (**BiRefNet** y **BRIA RMBG-1.4**). 

Nacida como una evolución de calidad superior frente a aplicaciones tradicionales como *unbagrnd*, **VioletCut AI** prioriza:
1. **Fidelidad quirúrgica de bordes**: Cabellos finos, transparencias en cristales, pelajes y siluetas complejas sin bordes pixelados ni halos.
2. **Control total de usuario**: La imagen **no se procesa automáticamente al subirla**. Puedes previsualizar el archivo original en resolución completa, configurar el modelo deseado y ejecutar el renderizado únicamente al pulsar el botón principal.
3. **Estética Violet / Cyber-Studio**: Interfaz moderna en tonos púrpura profundo y resplandor neón con efectos glassmorphism.
4. **Privacidad 100% Local**: Todo el procesamiento se realiza en tu hardware mediante **ONNX Runtime**, sin subir tus imágenes a ningún servidor externo.

---

## 🚀 Comparativa: VioletCut AI vs. unbagrnd

| Característica | unbagrnd | 💜 VioletCut AI Studio |
| :--- | :--- | :--- |
| **Motor de IA Principal** | IS-Net estándar | **BiRefNet Ultra-HD** + **BRIA RMBG-1.4 Pro** |
| **Detalle en Cabellos / Finos** | Medio | **Quirúrgico / Subpíxel** con Alpha Matting |
| **Flujo de Renderizado** | Inmediato / Automático | **Manual y Controlado** (solo tras presionar el botón) |
| **Comparador Interactivo** | Básico | **Deslizador Split Before/After**, Lado a Lado y Zoom |
| **Paleta de Interfaz** | Neutro / Grisáceo | **Obsidian Purple / Neón Violeta** con Glassmorphism |
| **Copiar al Portapapeles** | Manual / Archivo | **1-Clic PNG Transparente** (listo para Photoshop/Canva) |
| **Procesamiento por Lotes** | Básico | **Cola visual con barra de progreso y descarga ZIP** |
| **Selector de Fondo** | Limitado | Transparente, Colores Sólidos, Gradientes y Selector HEX |

---

## 🎨 Capturas de Interfaz y Flujo de Trabajo

### 1. Carga Limpia con Inspección Previa
Al soltar o pegar una imagen (`Ctrl + V`), el sistema muestra sus dimensiones originales, peso y aspecto, permitiendo elegir el modelo de red neuronal y filtros antes de procesar.

### 2. Deslizador Interactivo Before / After
Compara instantáneamente los bordes del original frente al recorte con un divisor interactivo deslizable en tiempo real.

### 3. Copiado Instantáneo
Un botón dedicado para transferir el recorte en formato PNG con canal alfa directamente a tu portapapeles, listo para pegar con `Ctrl + V` en Photoshop, Illustrator, Canva, Figma o Word.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend:** HTML5, TailwindCSS, CSS3 Glassmorphism personalizado, Lucide Icons, Vanilla JavaScript modular.
- **Backend:** FastAPI, Uvicorn, Python 3.12.
- **Inferencia de IA:** ONNX Runtime, Rembg, PIL (Pillow), NumPy, PyMatting.
- **Modelos Integrados:**
  - `birefnet-general` (Bilateral Reference Network - 973 MB)
  - `bria-rmbg` (BRIA AI RMBG-1.4 Studio Pro - 1.02 GB)
  - `isnet-general-use` (IS-Net General Use)
  - `u2net` (U2Net Clásico)

---

## 💻 Instalación y Uso Rápido en Windows

### Requisitos Previos
- Python 3.10 o superior instalado.
- Navegador moderno (Brave, Chrome o Edge).

### 1. Clonar el Repositorio
```bash
git clone https://github.com/Diego-Villanueva-v/VioletCut-AI.git
cd VioletCut-AI
```

### 2. Instalar Dependencias
```bash
pip install -r requirements.txt
```

### 3. Iniciar la Aplicación
Puedes iniciar VioletCut AI de tres formas sencillas:

- **Opción A (Acceso Directo en Escritorio):**
  Ejecuta una vez:
  ```bash
  python create_desktop_shortcut.py
  ```
  Esto creará el acceso directo `VioletCut AI` con su icono púrpura directamente en tu Escritorio.

- **Opción B (Doble clic en Windows):**
  Haz doble clic sobre `launch.bat` o `VioletCut.vbs`.

- **Opción C (Terminal):**
  ```bash
  python main.py
  ```

---

## ⌨️ Atajos y Productividad

- `Ctrl + V`: Pega cualquier imagen copiada en tu portapapeles para cargarla al instante.
- `Botón Copiar al Portapapeles`: Copia el PNG transparente procesado al portapapeles del sistema operativo.
- `Carpeta Recortes`: Abre la carpeta `Imágenes/VioletCut` en el Explorador de Windows con un solo clic.

---

## 📄 Licencia

Este proyecto está bajo la Licencia **MIT**. Consulta el archivo [LICENSE](LICENSE) para más detalles.

Desarrollado con dedicación por **Diego Villanueva**.
