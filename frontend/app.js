// VioletCut AI - Frontend Application Controller

let currentFile = null;
let currentProcessedData = null;
let currentBgColor = 'transparent';
let timerInterval = null;
let isDraggingSplit = false;

// Initialize Lucide icons on load
document.addEventListener("DOMContentLoaded", () => {
  if (window.lucide) {
    lucide.createIcons();
  }
  setupEvents();
  setupClipboardPaste();
  setupSplitSlider();
});

function setupEvents() {
  const dropzone = document.getElementById("dropzoneContainer");
  const fileInput = document.getElementById("fileInput");
  const featherSlider = document.getElementById("featherSlider");
  const featherValue = document.getElementById("featherValue");

  // Dropzone click
  dropzone.addEventListener("click", () => fileInput.click());

  // Drag & drop
  ["dragenter", "dragover"].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add("drag-over");
    });
  });

  ["dragleave", "drop"].forEach(eventName => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove("drag-over");
    });
  });

  dropzone.addEventListener("drop", (e) => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleImageSelection(files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleImageSelection(e.target.files[0]);
    }
  });

  // Feather slider update
  featherSlider.addEventListener("input", (e) => {
    featherValue.innerText = `${e.target.value} px`;
  });

  // Batch dropzone
  const batchDropzone = document.getElementById("batchDropzone");
  const batchFileInput = document.getElementById("batchFileInput");
  if (batchDropzone && batchFileInput) {
    batchFileInput.addEventListener("change", (e) => {
      if (e.target.files) handleBatchFiles(e.target.files);
    });
    batchDropzone.addEventListener("dragover", (e) => e.preventDefault());
    batchDropzone.addEventListener("drop", (e) => {
      e.preventDefault();
      if (e.dataTransfer.files) handleBatchFiles(e.dataTransfer.files);
    });
  }
}

// Support pasting directly with Ctrl + V
function setupClipboardPaste() {
  window.addEventListener("paste", (e) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleImageSelection(file);
          showToast("Imagen pegada desde el portapapeles", "check");
          break;
        }
      }
    }
  });
}

function triggerFileInput() {
  document.getElementById("fileInput").click();
}

// Handles user uploading or pasting an image - NO AUTO RENDER!
function handleImageSelection(file) {
  if (!file || !file.type.startsWith("image/")) {
    showToast("Por favor selecciona un archivo de imagen válido", "alert-circle");
    return;
  }

  currentFile = file;
  const reader = new FileReader();

  reader.onload = (e) => {
    const dataUrl = e.target.result;
    const img = new Image();
    img.onload = () => {
      // Update preview and metadata
      const originalPreview = document.getElementById("originalPreview");
      originalPreview.src = dataUrl;

      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      const metaText = `${img.width} × ${img.height} px • ${( (img.width * img.height) / 1000000 ).toFixed(1)} MP • ${file.type.split('/')[1].toUpperCase()} • ${sizeMB} MB`;
      document.getElementById("imageMetaDetails").innerText = metaText;

      // Also set to split comparator source
      document.getElementById("splitOriginalImage").src = dataUrl;
      document.getElementById("sideOriginalImg").src = dataUrl;

      // Switch view: Hide Dropzone, show Staging/Config workspace
      document.getElementById("dropzoneContainer").classList.add("hidden");
      document.getElementById("resultsContainer").classList.add("hidden");
      document.getElementById("processingLoader").classList.add("hidden");
      document.getElementById("stagingContainer").classList.remove("hidden");

      if (window.lucide) lucide.createIcons();
    };
    img.src = dataUrl;
  };

  reader.readAsDataURL(file);
}

// Executes the rendering ONLY when the user clicks the button!
async function executeRender() {
  if (!currentFile) {
    showToast("No hay ninguna imagen cargada", "alert-circle");
    return;
  }

  // Switch to loading state
  document.getElementById("stagingContainer").classList.add("hidden");
  const loader = document.getElementById("processingLoader");
  loader.classList.remove("hidden");

  // Timer animation
  let seconds = 0.0;
  const timerElem = document.getElementById("processingTimer");
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    seconds += 0.1;
    timerElem.innerText = `Tiempo transcurrido: ${seconds.toFixed(1)}s`;
  }, 100);

  // Prepare FormData
  const formData = new FormData();
  formData.append("file", currentFile);
  formData.append("model_name", document.getElementById("modelSelect").value);
  formData.append("alpha_matting", document.getElementById("alphaMattingToggle").checked);
  formData.append("alpha_matting_erode_size", 10);
  formData.append("edge_feather", document.getElementById("featherSlider").value);
  formData.append("only_mask", document.getElementById("maskOnlyToggle").checked);
  if (currentBgColor && currentBgColor !== "transparent") {
    formData.append("bg_color", currentBgColor);
  }

  try {
    const res = await fetch("/api/process", {
      method: "POST",
      body: formData
    });

    clearInterval(timerInterval);

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Error en el servidor al procesar la imagen.");
    }

    const data = await res.json();
    currentProcessedData = data;

    // Populate Results Studio
    document.getElementById("metricTime").innerText = `${data.elapsed_seconds}s`;
    document.getElementById("metricResolution").innerText = `${data.width} × ${data.height} px • Resolución Original Preservada`;

    // Populate result image targets
    document.getElementById("resultImageAfter").src = data.image;
    document.getElementById("sideResultImg").src = data.image;
    document.getElementById("cutoutOnlyImg").src = data.image;

    // Reset split slider to 50%
    setSplitPosition(50);

    // Hide loader, reveal Results
    loader.classList.add("hidden");
    document.getElementById("resultsContainer").classList.remove("hidden");

    showToast(`¡Recorte completado en ${data.elapsed_seconds}s!`, "check");
    if (window.lucide) lucide.createIcons();

  } catch (error) {
    clearInterval(timerInterval);
    loader.classList.add("hidden");
    document.getElementById("stagingContainer").classList.remove("hidden");
    showToast(error.message, "alert-circle");
  }
}

// Split slider setup
function setupSplitSlider() {
  const container = document.getElementById("splitViewContainer");
  const divider = document.getElementById("splitDivider");

  if (!container || !divider) return;

  const startDrag = (e) => {
    isDraggingSplit = true;
    e.preventDefault();
  };

  const stopDrag = () => {
    isDraggingSplit = false;
  };

  const onDrag = (e) => {
    if (!isDraggingSplit) return;
    const rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let offset = clientX - rect.left;
    let percentage = (offset / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));
    setSplitPosition(percentage);
  };

  divider.addEventListener("mousedown", startDrag);
  window.addEventListener("mouseup", stopDrag);
  window.addEventListener("mousemove", onDrag);

  divider.addEventListener("touchstart", startDrag, { passive: false });
  window.addEventListener("touchend", stopDrag);
  window.addEventListener("touchmove", onDrag, { passive: false });
}

function setSplitPosition(percentage) {
  const divider = document.getElementById("splitDivider");
  const beforeLayer = document.getElementById("splitBeforeLayer");
  if (divider && beforeLayer) {
    divider.style.left = `${percentage}%`;
    beforeLayer.style.width = `${percentage}%`;
  }
}

// View modes (Split slider vs Side-by-Side vs Cutout Only)
function setViewMode(mode) {
  const splitContainer = document.getElementById("splitViewContainer");
  const sideContainer = document.getElementById("sideBySideContainer");
  const cutoutContainer = document.getElementById("cutoutOnlyContainer");

  const btnSplit = document.getElementById("viewSplitBtn");
  const btnSide = document.getElementById("viewSideBtn");
  const btnCutout = document.getElementById("viewCutoutBtn");

  [btnSplit, btnSide, btnCutout].forEach(btn => {
    btn.className = "px-3 py-1 rounded-lg text-xs font-semibold text-purple-300 hover:text-white transition-all flex items-center gap-1.5";
  });

  splitContainer.classList.add("hidden");
  sideContainer.classList.add("hidden");
  cutoutContainer.classList.add("hidden");

  if (mode === "split") {
    splitContainer.classList.remove("hidden");
    btnSplit.className = "px-3 py-1 rounded-lg text-xs font-semibold bg-purple-700 text-white transition-all flex items-center gap-1.5";
  } else if (mode === "side") {
    sideContainer.classList.remove("hidden");
    btnSide.className = "px-3 py-1 rounded-lg text-xs font-semibold bg-purple-700 text-white transition-all flex items-center gap-1.5";
  } else if (mode === "cutout") {
    cutoutContainer.classList.remove("hidden");
    btnCutout.className = "px-3 py-1 rounded-lg text-xs font-semibold bg-purple-700 text-white transition-all flex items-center gap-1.5";
  }

  if (window.lucide) lucide.createIcons();
}

// Background Changer
function applyBg(color) {
  currentBgColor = color;
  const stage = document.getElementById("stageWrapper");

  if (color === "transparent") {
    stage.style.backgroundColor = "";
    stage.className = "w-full flex items-center justify-center min-h-[460px] bg-transparency-grid rounded-2xl relative overflow-hidden p-2";
  } else {
    stage.className = "w-full flex items-center justify-center min-h-[460px] rounded-2xl relative overflow-hidden p-2 transition-colors duration-300";
    stage.style.backgroundColor = color;
  }
}

// Copy to Clipboard (Copies PNG Blob directly with transparency!)
async function copyToClipboard() {
  if (!currentProcessedData || !currentProcessedData.image) {
    showToast("No hay imagen procesada para copiar", "alert-circle");
    return;
  }

  try {
    const res = await fetch(currentProcessedData.image);
    const blob = await res.blob();
    await navigator.clipboard.write([
      new ClipboardItem({ "image/png": blob })
    ]);
    showToast("¡Recorte copiado al portapapeles con transparencia!", "check");
  } catch (err) {
    showToast("Error al copiar al portapapeles: " + err.message, "alert-circle");
  }
}

// Download Cutout
function downloadCutout(format = "png") {
  if (!currentProcessedData || !currentProcessedData.image) return;

  const a = document.createElement("a");
  a.href = currentProcessedData.image;
  const origName = currentFile ? currentFile.name.replace(/\.[^/.]+$/, "") : "recorte";
  a.download = `${origName}_violetcut.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  showToast("Descarga iniciada exitosamente", "download");
}

// Direct save to PC disk (Pictures/VioletCut)
async function saveDirectToDisk() {
  if (!currentProcessedData || !currentProcessedData.image) return;

  const origName = currentFile ? currentFile.name.replace(/\.[^/.]+$/, "") : "recorte";
  const filename = `${origName}_violetcut.png`;

  const formData = new FormData();
  formData.append("file_data", currentProcessedData.image);
  formData.append("filename", filename);

  try {
    const res = await fetch("/api/save-disk", {
      method: "POST",
      body: formData
    });
    const result = await res.json();
    if (result.status === "saved") {
      showToast(`Guardado en: ${result.path}`, "hard-drive");
    }
  } catch (err) {
    showToast("Error al guardar en disco", "alert-circle");
  }
}

// Open output folder in Windows File Explorer
async function openOutputFolder() {
  try {
    await fetch("/api/open-folder", { method: "POST" });
    showToast("Abriendo carpeta en el Explorador de Windows...", "folder");
  } catch (err) {
    showToast("No se pudo abrir la carpeta", "alert-circle");
  }
}

// Reset everything to start fresh
function resetToHome() {
  currentFile = null;
  currentProcessedData = null;
  document.getElementById("fileInput").value = "";
  document.getElementById("stagingContainer").classList.add("hidden");
  document.getElementById("resultsContainer").classList.add("hidden");
  document.getElementById("processingLoader").classList.add("hidden");
  document.getElementById("dropzoneContainer").classList.remove("hidden");
  applyBg("transparent");
  if (window.lucide) lucide.createIcons();
}

// Mode switching: Single vs Batch
function switchTab(tab) {
  const singleView = document.getElementById("singleView");
  const batchView = document.getElementById("batchView");
  const tabSingleBtn = document.getElementById("tabSingleBtn");
  const tabBatchBtn = document.getElementById("tabBatchBtn");

  if (tab === "single") {
    singleView.classList.remove("hidden");
    batchView.classList.add("hidden");
    tabSingleBtn.className = "flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-md";
    tabBatchBtn.className = "flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all text-purple-300 hover:text-white";
  } else {
    singleView.classList.add("hidden");
    batchView.classList.remove("hidden");
    tabBatchBtn.className = "flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all bg-gradient-to-r from-purple-700 to-purple-600 text-white shadow-md";
    tabSingleBtn.className = "flex items-center space-x-2 px-4 py-1.5 rounded-lg text-sm font-medium transition-all text-purple-300 hover:text-white";
  }

  if (window.lucide) lucide.createIcons();
}

// Batch queue logic
let batchFilesQueue = [];

function handleBatchFiles(fileList) {
  batchFilesQueue = Array.from(fileList).filter(f => f.type.startsWith("image/"));
  if (batchFilesQueue.length === 0) return;

  const batchList = document.getElementById("batchList");
  const batchCount = document.getElementById("batchCount");
  const queueContainer = document.getElementById("batchQueueContainer");

  batchList.innerHTML = "";
  batchCount.innerText = batchFilesQueue.length;
  queueContainer.classList.remove("hidden");

  batchFilesQueue.forEach((file, index) => {
    const card = document.createElement("div");
    card.className = "relative rounded-xl overflow-hidden bg-purple-950/40 border border-purple-800/40 p-1 flex flex-col items-center";
    
    const img = document.createElement("img");
    img.className = "w-full h-24 object-cover rounded-lg";
    img.src = URL.createObjectURL(file);

    const name = document.createElement("p");
    name.className = "text-[10px] text-purple-300 truncate w-full text-center mt-1";
    name.innerText = file.name;

    card.appendChild(img);
    card.appendChild(name);
    batchList.appendChild(card);
  });

  showToast(`${batchFilesQueue.length} imágenes añadidas a la cola`, "layers");
  if (window.lucide) lucide.createIcons();
}

async function executeBatchRender() {
  if (batchFilesQueue.length === 0) return;

  const btn = document.getElementById("batchProcessBtn");
  const progressContainer = document.getElementById("batchProgress");
  const progressBar = document.getElementById("batchProgressBar");
  const batchPercent = document.getElementById("batchPercent");

  btn.disabled = true;
  progressContainer.classList.remove("hidden");
  progressBar.style.width = "40%";
  batchPercent.innerText = "Procesando...";

  const formData = new FormData();
  batchFilesQueue.forEach(f => formData.append("files", f));
  formData.append("model_name", "birefnet-general");

  try {
    const res = await fetch("/api/batch", {
      method: "POST",
      body: formData
    });

    if (!res.ok) throw new Error("Error en procesamiento por lotes");

    progressBar.style.width = "100%";
    batchPercent.innerText = "¡Completado! Descargando ZIP...";

    const blob = await res.blob();
    const downloadUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = `violetcut_batch_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    showToast("¡Lote completado y descargado en archivo ZIP!", "check");
  } catch (err) {
    showToast(err.message, "alert-circle");
  } finally {
    btn.disabled = false;
  }
}

// Toast notification helper
function showToast(message, iconName = "check") {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");
  const toastIcon = document.getElementById("toastIcon");

  toastMsg.innerText = message;
  toastIcon.innerHTML = `<i data-lucide="${iconName}" class="w-4 h-4"></i>`;
  if (window.lucide) lucide.createIcons();

  toast.classList.remove("translate-y-20", "opacity-0");
  toast.classList.add("translate-y-0", "opacity-100");

  setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-20", "opacity-0");
  }, 3500);
}
