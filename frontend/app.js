// Removo — Frontend Controller

let currentFile = null;
let currentProcessedData = null;
let currentBgColor = "transparent";
let timerInterval = null;
let isDraggingSplit = false;
let batchFilesQueue = [];

let appSettings = {
  output_folder: "",
  auto_save: true,
  default_model: "isnet-general-use",
  preload_on_startup: true,
  output_format: "png",
  overwrite_existing: false,
  language: "en",
  theme: "dark"
};

let modelsCatalog = [];

const I18N = {
  en: {
    nav_single: "Single",
    nav_batch: "Batch",
    nav_settings: "Settings",
    output_folder_label: "Output Folder",
    autosave_on: "Auto-Save ON",
    autosave_off: "Auto-Save OFF",
    no_folder_selected: "Not selected — Will prompt before saving",
    select_folder_btn: "Select Folder",
    open_folder_btn: "Open",
    drop_title: "Drop image here or click to browse",
    drop_subtitle: "Supports PNG, JPG, WebP, BMP • Paste directly with Ctrl + V",
    change_image_btn: "Change Image",
    label_original: "Original",
    label_result: "Result",
    parameters_title: "Parameters",
    model_label: "Segmentation Model",
    post_process_label: "Clean White Halos & Edges (Defringe)",
    post_process_desc: "Removes white borders and background spill in gaps",
    alpha_matting_label: "Deep Pocket & Hair Cleanup",
    alpha_matting_desc: "Stronger removal of trapped background between hair strands",
    feather_label: "Edge Feathering",
    mask_only_label: "Output Alpha Mask Only",
    mask_only_desc: "Export grayscale silhouette mask",
    remove_bg_btn: "Remove Background",
    processing_title: "Processing image...",
    done_title: "Completed",
    adjust_settings_btn: "Adjust",
    new_image_btn: "New Image",
    view_split: "Split View",
    view_side: "Side by Side",
    view_result: "Result Only",
    view_edit: "Edit / Restore",
    brush_restore: "Restore",
    brush_erase: "Erase",
    brush_pan: "Move",
    brush_size_label: "Size",
    brush_soft_label: "Soft Edge",
    brush_guide_label: "Original Guide",
    brush_undo: "Undo",
    brush_reset: "Reset",
    brush_save: "Save Changes",
    editor_shortcuts_hint: "Wheel: Zoom to cursor • Right-Click or Space: Move • Alt + Wheel: Brush Size • Ctrl+Z: Undo",
    toast_edits_saved: "Edited image saved",
    outline_title: "Subject Outline",
    outline_width_label: "Thickness",
    outline_color_label: "Color:",
    outline_clear_btn: "Remove Outline",
    outline_save_btn: "Save with Outline",
    bg_preview_label: "Backdrop:",
    copy_png_btn: "Copy PNG to Clipboard",
    open_saved_folder_btn: "Open Output Folder",
    download_btn: "Download PNG",
    batch_title: "Batch Processing",
    batch_subtitle: "Select multiple images to remove backgrounds in bulk. Files are automatically saved to your Output Folder and exported as a ZIP archive.",
    queued_files_label: "Queued Files",
    process_batch_btn: "Process Batch",
    settings_storage_title: "Output & Auto-Save",
    setting_autosave_label: "Auto-Save Processed Images",
    setting_autosave_desc: "Automatically write output images to the selected Output Folder upon rendering",
    setting_format_label: "Default Output Format",
    setting_overwrite_label: "Overwrite Existing Files",
    setting_overwrite_desc: "Replace file instead of appending _1, _2",
    settings_appearance_title: "Appearance & Language",
    setting_lang_label: "Interface Language",
    setting_theme_label: "Color Theme",
    theme_dark: "Dark Purple",
    theme_light: "Light Purple",
    settings_engine_title: "Inference Engine & Performance",
    setting_default_model: "Default Model",
    preload_ram_btn: "Preload Model into RAM",
    setting_preload_startup: "Preload Default Model on Startup",
    setting_preload_startup_desc: "Warm up ONNX session in background so first render is immediate",
    github_card_desc: "Source code, releases, and issue tracker on GitHub",
    github_profile_btn: "GitHub Profile",
    github_repo_btn: "Open Repository",
    toast_pasted: "Image pasted from clipboard",
    toast_invalid_file: "Please select a valid image file",
    toast_select_folder_prompt: "Please select an output folder to save your processed image",
    toast_folder_updated: "Output folder updated",
    toast_copied: "PNG copied to clipboard",
    toast_saved_to: "Saved to: ",
    toast_preloaded: "Model loaded into RAM"
  },
  es: {
    nav_single: "Individual",
    nav_batch: "Lote",
    nav_settings: "Ajustes",
    output_folder_label: "Carpeta de Guardado",
    autosave_on: "Auto-Guardado ON",
    autosave_off: "Auto-Guardado OFF",
    no_folder_selected: "Sin seleccionar — Se pedirá al procesar",
    select_folder_btn: "Seleccionar Carpeta",
    open_folder_btn: "Abrir",
    drop_title: "Arrastra una imagen aquí o haz clic para buscar",
    drop_subtitle: "Soporta PNG, JPG, WebP, BMP • Pega directamente con Ctrl + V",
    change_image_btn: "Cambiar Imagen",
    label_original: "Original",
    label_result: "Resultado",
    parameters_title: "Parámetros",
    model_label: "Modelo de Segmentación",
    post_process_label: "Limpiar Bordes Blancos (Defringe)",
    post_process_desc: "Elimina halos blancos y fondo atrapado en huecos",
    alpha_matting_label: "Limpieza Profunda en Cabello",
    alpha_matting_desc: "Mayor eliminación de residuos blancos entre mechones",
    feather_label: "Suavizado de Bordes",
    mask_only_label: "Solo Máscara Alfa",
    mask_only_desc: "Exportar silueta en escala de grises",
    remove_bg_btn: "Eliminar Fondo",
    processing_title: "Procesando imagen...",
    done_title: "Completado",
    adjust_settings_btn: "Ajustar",
    new_image_btn: "Nueva Imagen",
    view_split: "Comparador",
    view_side: "Lado a Lado",
    view_result: "Solo Resultado",
    view_edit: "Editar / Recuperar",
    brush_restore: "Recuperar",
    brush_erase: "Borrar",
    brush_pan: "Mover",
    brush_size_label: "Tamaño",
    brush_soft_label: "Borde Suave",
    brush_guide_label: "Guía Original",
    brush_undo: "Deshacer",
    brush_reset: "Restablecer",
    brush_save: "Guardar Cambios",
    editor_shortcuts_hint: "Rueda: Zoom al cursor • Clic Derecho o Espacio: Mover • Alt + Rueda: Tamaño Pincel • Ctrl+Z: Deshacer",
    toast_edits_saved: "Imagen editada guardada",
    outline_title: "Contorno (Outline)",
    outline_width_label: "Grosor",
    outline_color_label: "Color:",
    outline_clear_btn: "Quitar Contorno",
    outline_save_btn: "Guardar con Contorno",
    bg_preview_label: "Fondo:",
    copy_png_btn: "Copiar PNG al Portapapeles",
    open_saved_folder_btn: "Abrir Carpeta de Salida",
    download_btn: "Descargar PNG",
    batch_title: "Procesamiento por Lotes",
    batch_subtitle: "Selecciona múltiples imágenes para eliminar el fondo en serie. Se guardarán automáticamente en tu carpeta de salida y se descargarán en ZIP.",
    queued_files_label: "Archivos en Cola",
    process_batch_btn: "Procesar Lote",
    settings_storage_title: "Salida y Guardado Automático",
    setting_autosave_label: "Guardar Imágenes Automáticamente",
    setting_autosave_desc: "Guarda automáticamente cada imagen generada en la carpeta seleccionada",
    setting_format_label: "Formato de Salida",
    setting_overwrite_label: "Sobrescribir Archivos",
    setting_overwrite_desc: "Reemplazar archivo en lugar de añadir _1, _2",
    settings_appearance_title: "Apariencia e Idioma",
    setting_lang_label: "Idioma de la Interfaz",
    setting_theme_label: "Tema de Color",
    theme_dark: "Púrpura Oscuro",
    theme_light: "Púrpura Claro",
    settings_engine_title: "Motor de Inferencia y Rendimiento",
    setting_default_model: "Modelo Predeterminado",
    preload_ram_btn: "Precargar Modelo en RAM",
    setting_preload_startup: "Precargar Modelo al Iniciar",
    setting_preload_startup_desc: "Inicializa la sesión ONNX en segundo plano para acelerar el primer uso",
    github_card_desc: "Código fuente, versiones y repositorio en GitHub",
    github_profile_btn: "Perfil de GitHub",
    github_repo_btn: "Abrir Repositorio",
    toast_pasted: "Imagen pegada desde el portapapeles",
    toast_invalid_file: "Selecciona un archivo de imagen válido",
    toast_select_folder_prompt: "Selecciona una carpeta de guardado para almacenar las imágenes",
    toast_folder_updated: "Carpeta de guardado actualizada",
    toast_copied: "PNG copiado al portapapeles",
    toast_saved_to: "Guardado en: ",
    toast_preloaded: "Modelo cargado en memoria RAM"
  }
};

function t(key) {
  const lang = appSettings.language || "en";
  return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
}

document.addEventListener("DOMContentLoaded", async () => {
  if (window.lucide) lucide.createIcons();
  setupEvents();
  setupClipboardPaste();
  setupSplitSlider();
  setupBrushEditor();
  await fetchSettings();
});

async function fetchSettings() {
  try {
    const res = await fetch("/api/settings");
    if (!res.ok) return;
    const data = await res.json();
    appSettings = { ...appSettings, ...data.settings };
    modelsCatalog = data.models || [];

    // Populate system stats
    if (data.system) {
      document.getElementById("sysCpuThreads").innerText = data.system.cpu_threads;
      document.getElementById("sysProviders").innerText = (data.system.providers || []).join(", ");
      document.getElementById("sysCachedModels").innerText =
        (data.system.cached_models && data.system.cached_models.length > 0)
          ? data.system.cached_models.join(", ")
          : "None";
    }

    // Sync UI controls
    document.getElementById("modelSelect").value = appSettings.default_model || "bria-rmbg";
    document.getElementById("settingDefaultModel").value = appSettings.default_model || "bria-rmbg";
    document.getElementById("settingAutoSave").checked = Boolean(appSettings.auto_save);
    document.getElementById("settingOutputFormat").value = appSettings.output_format || "png";
    document.getElementById("settingOverwrite").checked = Boolean(appSettings.overwrite_existing);
    document.getElementById("settingPreloadStartup").checked = Boolean(appSettings.preload_on_startup);
    document.getElementById("settingLanguage").value = appSettings.language || "en";
    document.getElementById("settingTheme").value = appSettings.theme || "dark";

    applyTheme(appSettings.theme || "dark");
    applyLanguage(appSettings.language || "en");
    updateOutputFolderUI();
    onModelSelectChange();
  } catch (err) {
    console.error("Failed to load settings:", err);
  }
}

function updateOutputFolderUI() {
  const folder = (appSettings.output_folder || "").trim();
  const headerText = document.getElementById("headerOutputFolderText");
  const settingInput = document.getElementById("settingOutputFolderInput");
  const badge = document.getElementById("autoSaveBadge");

  if (folder) {
    headerText.innerText = folder;
    headerText.classList.remove("text-muted-theme");
    headerText.classList.add("text-purple-400");
    settingInput.value = folder;
  } else {
    headerText.innerText = t("no_folder_selected");
    headerText.classList.add("text-muted-theme");
    headerText.classList.remove("text-purple-400");
    settingInput.value = "";
    settingInput.placeholder = t("no_folder_selected");
  }

  if (appSettings.auto_save) {
    badge.innerText = t("autosave_on");
    badge.className = "text-[11px] px-2 py-0.5 rounded bg-purple-500/15 text-purple-400 font-medium";
  } else {
    badge.innerText = t("autosave_off");
    badge.className = "text-[11px] px-2 py-0.5 rounded surface-input text-muted-theme font-medium";
  }
}

function applyTheme(theme) {
  appSettings.theme = theme;
  document.documentElement.setAttribute("data-theme", theme);
  document.getElementById("settingTheme").value = theme;

  const icon = document.getElementById("themeIcon");
  if (icon) {
    icon.setAttribute("data-lucide", theme === "dark" ? "sun" : "moon");
    if (window.lucide) lucide.createIcons();
  }
}

function toggleTheme() {
  const next = appSettings.theme === "dark" ? "light" : "dark";
  applyTheme(next);
  saveSettingsPatch({ theme: next });
}

function onThemeSelectChange(val) {
  applyTheme(val);
  saveSettingsPatch({ theme: val });
}

function applyLanguage(lang) {
  appSettings.language = lang;
  document.documentElement.lang = lang;
  document.getElementById("langBadge").innerText = lang.toUpperCase();
  document.getElementById("settingLanguage").value = lang;

  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (key) el.innerText = t(key);
  });

  // Update model dropdown localized labels
  const modelSelect = document.getElementById("modelSelect");
  if (modelSelect && modelsCatalog.length > 0) {
    Array.from(modelSelect.options).forEach(opt => {
      const m = modelsCatalog.find(item => item.id === opt.value);
      if (m) {
        opt.text = lang === "es" ? m.name_es : m.name_en;
      }
    });
  }

  onModelSelectChange();
  updateOutputFolderUI();
}

function toggleLanguage() {
  const next = appSettings.language === "en" ? "es" : "en";
  applyLanguage(next);
  saveSettingsPatch({ language: next });
}

function onLanguageSelectChange(val) {
  applyLanguage(val);
  saveSettingsPatch({ language: val });
}

function onModelSelectChange() {
  const selectedId = document.getElementById("modelSelect").value;
  const m = modelsCatalog.find(item => item.id === selectedId);
  const descEl = document.getElementById("modelDescText");
  if (m && descEl) {
    descEl.innerText = appSettings.language === "es" ? m.desc_es : m.desc_en;
  }
}

async function saveSettingsPatch(patch) {
  try {
    const res = await fetch("/api/settings", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch)
    });
    if (res.ok) {
      const data = await res.json();
      appSettings = { ...appSettings, ...data.settings };
      updateOutputFolderUI();
    }
  } catch (err) {
    console.error("Failed to save settings:", err);
  }
}

async function saveSettingsFromUI() {
  const patch = {
    auto_save: document.getElementById("settingAutoSave").checked,
    output_format: document.getElementById("settingOutputFormat").value,
    overwrite_existing: document.getElementById("settingOverwrite").checked,
    default_model: document.getElementById("settingDefaultModel").value,
    preload_on_startup: document.getElementById("settingPreloadStartup").checked
  };
  document.getElementById("modelSelect").value = patch.default_model;
  onModelSelectChange();
  await saveSettingsPatch(patch);
}

// Native OS folder picker
async function selectOutputFolder() {
  try {
    const res = await fetch("/api/select-folder", { method: "POST" });
    if (!res.ok) throw new Error("Failed to open folder selector");
    const data = await res.json();
    if (data.status === "selected" && data.output_folder) {
      appSettings.output_folder = data.output_folder;
      updateOutputFolderUI();
      showToast(`${t("toast_folder_updated")}: ${data.output_folder}`, "folder-check");
      return data.output_folder;
    }
    return null;
  } catch (err) {
    showToast(err.message, "alert-circle");
    return null;
  }
}

async function openOutputFolder() {
  if (!appSettings.output_folder) {
    const chosen = await selectOutputFolder();
    if (!chosen) return;
  }
  try {
    const res = await fetch("/api/open-folder", { method: "POST" });
    if (res.status === 400) {
      await selectOutputFolder();
    }
  } catch (err) {
    showToast(err.message, "alert-circle");
  }
}

async function preloadCurrentModel() {
  const btn = document.getElementById("preloadModelBtn");
  const model = document.getElementById("settingDefaultModel").value;
  btn.disabled = true;
  try {
    const res = await fetch("/api/preload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model_name: model })
    });
    if (res.ok) {
      const data = await res.json();
      document.getElementById("sysCachedModels").innerText = (data.cached_models || []).join(", ");
      showToast(`${t("toast_preloaded")} (${model})`, "zap");
    }
  } catch (err) {
    showToast(err.message, "alert-circle");
  } finally {
    btn.disabled = false;
  }
}

function setupEvents() {
  const dropzone = document.getElementById("dropzoneContainer");
  const fileInput = document.getElementById("fileInput");
  const featherSlider = document.getElementById("featherSlider");
  const featherValue = document.getElementById("featherValue");

  dropzone.addEventListener("click", () => fileInput.click());

  ["dragenter", "dragover"].forEach(evt => {
    dropzone.addEventListener(evt, e => {
      e.preventDefault();
      dropzone.classList.add("drag-over");
    });
  });

  ["dragleave", "drop"].forEach(evt => {
    dropzone.addEventListener(evt, e => {
      e.preventDefault();
      dropzone.classList.remove("drag-over");
    });
  });

  dropzone.addEventListener("drop", e => {
    const files = e.dataTransfer.files;
    if (files && files.length > 0) handleImageSelection(files[0]);
  });

  fileInput.addEventListener("change", e => {
    if (e.target.files && e.target.files.length > 0) handleImageSelection(e.target.files[0]);
  });

  featherSlider.addEventListener("input", e => {
    featherValue.innerText = `${e.target.value} px`;
  });

  const batchDropzone = document.getElementById("batchDropzone");
  const batchFileInput = document.getElementById("batchFileInput");
  if (batchDropzone && batchFileInput) {
    batchFileInput.addEventListener("change", e => {
      if (e.target.files) handleBatchFiles(e.target.files);
    });
    batchDropzone.addEventListener("dragover", e => e.preventDefault());
    batchDropzone.addEventListener("drop", e => {
      e.preventDefault();
      if (e.dataTransfer.files) handleBatchFiles(e.dataTransfer.files);
    });
  }
}

function setupClipboardPaste() {
  window.addEventListener("paste", e => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          switchTab("single");
          handleImageSelection(file);
          showToast(t("toast_pasted"), "check-circle");
          break;
        }
      }
    }
  });
}

function triggerFileInput() {
  document.getElementById("fileInput").click();
}

// Stage image without automatic rendering
function handleImageSelection(file) {
  if (!file || !file.type.startsWith("image/")) {
    showToast(t("toast_invalid_file"), "alert-circle");
    return;
  }

  currentFile = file;
  const reader = new FileReader();

  reader.onload = e => {
    const dataUrl = e.target.result;
    const img = new Image();
    img.onload = () => {
      document.getElementById("originalPreview").src = dataUrl;
      document.getElementById("stagedFileName").innerText = file.name;

      const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
      document.getElementById("imageMetaDetails").innerText =
        `${img.width} × ${img.height} px • ${sizeMB} MB`;

      document.getElementById("splitOriginalImage").src = dataUrl;
      document.getElementById("sideOriginalImg").src = dataUrl;

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

function backToStaging() {
  document.getElementById("resultsContainer").classList.add("hidden");
  document.getElementById("stagingContainer").classList.remove("hidden");
}

// Manual render triggered by button click
async function executeRender() {
  if (!currentFile) return;

  // If auto_save is enabled and no output_folder is set, prompt user to pick one now
  if (appSettings.auto_save && !(appSettings.output_folder || "").trim()) {
    showToast(t("toast_select_folder_prompt"), "folder");
    const chosen = await selectOutputFolder();
    if (!chosen) return;
  }

  document.getElementById("stagingContainer").classList.add("hidden");
  const loader = document.getElementById("processingLoader");
  loader.classList.remove("hidden");

  let seconds = 0.0;
  const timerElem = document.getElementById("processingTimer");
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    seconds += 0.1;
    timerElem.innerText = `${seconds.toFixed(1)}s`;
  }, 100);

  const formData = new FormData();
  formData.append("file", currentFile);
  formData.append("model_name", document.getElementById("modelSelect").value);
  formData.append("post_process_mask", document.getElementById("postProcessToggle").checked);
  formData.append("alpha_matting", document.getElementById("alphaMattingToggle").checked);
  formData.append("alpha_matting_erode_size", 10);
  formData.append("edge_feather", document.getElementById("featherSlider").value);
  formData.append("only_mask", document.getElementById("maskOnlyToggle").checked);

  try {
    const res = await fetch("/api/process", {
      method: "POST",
      body: formData
    });

    clearInterval(timerInterval);

    if (res.status === 428) {
      loader.classList.add("hidden");
      document.getElementById("stagingContainer").classList.remove("hidden");
      const chosen = await selectOutputFolder();
      if (chosen) return executeRender();
      return;
    }

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || "Processing error");
    }

    const data = await res.json();
    currentProcessedData = data;

    document.getElementById("metricTime").innerText = `${data.elapsed_seconds}s`;
    document.getElementById("metricResolution").innerText = `${data.width} × ${data.height} px`;

    const savedBanner = document.getElementById("savedPathBanner");
    if (data.saved_path) {
      savedBanner.innerText = `${t("toast_saved_to")}${data.saved_path}`;
      savedBanner.classList.remove("hidden");
    } else {
      savedBanner.innerText = "";
      savedBanner.classList.add("hidden");
    }

    document.getElementById("resultImageAfter").src = data.image;
    document.getElementById("sideResultImg").src = data.image;
    document.getElementById("cutoutOnlyImg").src = data.image;

    await initBrushEditorForCurrentResult(
      document.getElementById("originalPreview").src,
      data.image
    );

    setSplitPosition(50);
    setViewMode("split");

    loader.classList.add("hidden");
    document.getElementById("resultsContainer").classList.remove("hidden");

    if (data.saved_path) {
      showToast(`${t("toast_saved_to")}${data.saved_path}`, "check-circle");
    }
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    clearInterval(timerInterval);
    loader.classList.add("hidden");
    document.getElementById("stagingContainer").classList.remove("hidden");
    showToast(err.message, "alert-circle");
  }
}

function setupSplitSlider() {
  const container = document.getElementById("splitViewContainer");
  const divider = document.getElementById("splitDivider");
  if (!container || !divider) return;

  const startDrag = e => {
    isDraggingSplit = true;
    e.preventDefault();
  };
  const stopDrag = () => {
    isDraggingSplit = false;
  };
  const onDrag = e => {
    if (!isDraggingSplit) return;
    const rect = container.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    let pct = ((clientX - rect.left) / rect.width) * 100;
    pct = Math.max(0, Math.min(100, pct));
    setSplitPosition(pct);
  };

  divider.addEventListener("mousedown", startDrag);
  window.addEventListener("mouseup", stopDrag);
  window.addEventListener("mousemove", onDrag);

  divider.addEventListener("touchstart", startDrag, { passive: false });
  window.addEventListener("touchend", stopDrag);
  window.addEventListener("touchmove", onDrag, { passive: false });
}

function setSplitPosition(pct) {
  const divider = document.getElementById("splitDivider");
  const beforeLayer = document.getElementById("splitBeforeLayer");
  if (divider && beforeLayer) {
    divider.style.left = `${pct}%`;
    beforeLayer.style.width = `${pct}%`;
  }
}

function setViewMode(mode) {
  const splitContainer = document.getElementById("splitViewContainer");
  const sideContainer = document.getElementById("sideBySideContainer");
  const cutoutContainer = document.getElementById("cutoutOnlyContainer");
  const editContainer = document.getElementById("editViewContainer");

  const btnSplit = document.getElementById("viewSplitBtn");
  const btnSide = document.getElementById("viewSideBtn");
  const btnCutout = document.getElementById("viewCutoutBtn");
  const btnEdit = document.getElementById("viewEditBtn");

  // If leaving edit mode and user painted strokes, sync preview images automatically
  if (editContainer && !editContainer.classList.contains("hidden") && mode !== "edit") {
    syncEditorCanvasToPreviews();
  }

  [btnSplit, btnSide, btnCutout].forEach(b => {
    if (b) b.className = "px-3 py-1 rounded-lg text-xs font-medium text-secondary-theme";
  });
  if (btnEdit) {
    btnEdit.className = "px-3 py-1 rounded-lg text-xs font-medium text-secondary-theme flex items-center gap-1.5";
  }

  splitContainer.classList.add("hidden");
  sideContainer.classList.add("hidden");
  cutoutContainer.classList.add("hidden");
  if (editContainer) editContainer.classList.add("hidden");

  if (mode === "split") {
    splitContainer.classList.remove("hidden");
    btnSplit.className = "px-3 py-1 rounded-lg text-xs font-medium btn-primary";
  } else if (mode === "side") {
    sideContainer.classList.remove("hidden");
    btnSide.className = "px-3 py-1 rounded-lg text-xs font-medium btn-primary";
  } else if (mode === "edit" && editContainer) {
    editContainer.classList.remove("hidden");
    fitEditorCanvasToViewport();
    btnEdit.className = "px-3 py-1 rounded-lg text-xs font-medium btn-primary flex items-center gap-1.5";
  } else {
    cutoutContainer.classList.remove("hidden");
    btnCutout.className = "px-3 py-1 rounded-lg text-xs font-medium btn-primary";
  }
}

// ==========================================
// INTERACTIVE BRUSH EDITOR (RESTORE, ERASE & PAN/ZOOM)
// ==========================================
let brushMode = "restore"; // 'restore' | 'erase' | 'pan'
let brushSize = 32;
let editorZoom = 1.0;
let editorPanX = 0;
let editorPanY = 0;
let isPainting = false;
let isPanningEditor = false;
let isSpacePressed = false;
let panStartScreen = { x: 0, y: 0 };
let panStartOffset = { x: 0, y: 0 };
let lastMouseClient = { x: 0, y: 0 };
let lastPaintPt = null;
let editorUndoStack = [];
let editorRedoStack = [];
let editorHasUnsavedChanges = false;

let origOffscreenCanvas = null;
let initialCutoutCanvas = null;
let brushStampCanvas = null;

function setupBrushEditor() {
  const canvas = document.getElementById("editorCanvas");
  const viewport = document.getElementById("editorViewport");
  const cursor = document.getElementById("brushCursor");
  if (!canvas || !viewport) return;

  origOffscreenCanvas = document.createElement("canvas");
  initialCutoutCanvas = document.createElement("canvas");
  brushStampCanvas = document.createElement("canvas");

  // Prevent browser context menu inside editor so Right-Click Drag pans smoothly
  viewport.addEventListener("contextmenu", e => e.preventDefault());

  const getCanvasCoords = e => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      scale: scaleX
    };
  };

  const updateCursorRing = (clientX, clientY) => {
    if (!cursor) return;
    const editContainer = document.getElementById("editViewContainer");
    if (!editContainer || editContainer.classList.contains("hidden")) {
      cursor.classList.add("hidden");
      return;
    }

    if (isPanningEditor || isSpacePressed || brushMode === "pan") {
      cursor.classList.add("hidden");
      viewport.style.cursor = isPanningEditor ? "grabbing" : "grab";
      return;
    }

    viewport.style.cursor = "none";
    const vRect = viewport.getBoundingClientRect();
    if (
      clientX < vRect.left ||
      clientX > vRect.right ||
      clientY < vRect.top ||
      clientY > vRect.bottom
    ) {
      cursor.classList.add("hidden");
      return;
    }

    const cRect = canvas.getBoundingClientRect();
    cursor.classList.remove("hidden");
    const displayScale = cRect.width / (canvas.width || 1);
    const screenDiameter = Math.max(6, brushSize * displayScale);
    cursor.style.width = `${screenDiameter}px`;
    cursor.style.height = `${screenDiameter}px`;
    cursor.style.left = `${clientX - vRect.left}px`;
    cursor.style.top = `${clientY - vRect.top}px`;
  };

  const startInteraction = e => {
    const editContainer = document.getElementById("editViewContainer");
    if (!editContainer || editContainer.classList.contains("hidden")) return;

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Right-click (2), Middle-click (1), Space + Left-click, or Move tool -> Pan canvas
    if (
      e.button === 1 ||
      e.button === 2 ||
      isSpacePressed ||
      brushMode === "pan"
    ) {
      e.preventDefault();
      isPanningEditor = true;
      panStartScreen = { x: clientX, y: clientY };
      panStartOffset = { x: editorPanX, y: editorPanY };
      updateCursorRing(clientX, clientY);
      return;
    }

    if (e.button !== undefined && e.button !== 0) return;

    // Left-click with Restore or Erase -> Paint stroke
    e.preventDefault();
    pushEditorUndoState();
    editorRedoStack = [];
    isPainting = true;
    editorHasUnsavedChanges = true;
    const pt = getCanvasCoords(e);
    lastPaintPt = pt;
    paintBrushSegment(pt, pt);
    updateCursorRing(clientX, clientY);
  };

  const moveInteraction = e => {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    lastMouseClient = { x: clientX, y: clientY };

    if (isPanningEditor) {
      e.preventDefault();
      editorPanX = panStartOffset.x + (clientX - panStartScreen.x);
      editorPanY = panStartOffset.y + (clientY - panStartScreen.y);
      applyEditorTransform();
      updateCursorRing(clientX, clientY);
      return;
    }

    updateCursorRing(clientX, clientY);
    if (!isPainting) return;
    e.preventDefault();
    const pt = getCanvasCoords(e);
    paintBrushSegment(lastPaintPt || pt, pt);
    lastPaintPt = pt;
  };

  const endInteraction = () => {
    if (isPanningEditor) {
      isPanningEditor = false;
      updateCursorRing(lastMouseClient.x, lastMouseClient.y);
    }
    if (isPainting) {
      isPainting = false;
      lastPaintPt = null;
    }
  };

  viewport.addEventListener("mousedown", startInteraction);
  window.addEventListener("mousemove", moveInteraction);
  window.addEventListener("mouseup", endInteraction);
  viewport.addEventListener("mouseleave", () => {
    if (cursor) cursor.classList.add("hidden");
  });

  canvas.addEventListener("touchstart", startInteraction, { passive: false });
  canvas.addEventListener("touchmove", moveInteraction, { passive: false });
  window.addEventListener("touchend", endInteraction);

  // Direct Mouse Wheel Zoom anchored at cursor (or Alt+Wheel for Brush Size)
  viewport.addEventListener("wheel", e => {
    e.preventDefault();
    lastMouseClient = { x: e.clientX, y: e.clientY };

    // Alt + Wheel or Shift + Wheel -> Adjust Brush Size on the fly
    if (e.altKey || e.shiftKey) {
      const step = Math.max(2, Math.round(brushSize * 0.12));
      const nextSize = Math.max(2, Math.min(140, brushSize + (e.deltaY < 0 ? step : -step)));
      updateBrushSize(nextSize);
      const slider = document.getElementById("brushSizeSlider");
      if (slider) slider.value = nextSize;
      updateCursorRing(e.clientX, e.clientY);
      return;
    }

    // Normal Mouse Wheel -> Smooth Zoom toward mouse cursor position
    const zoomFactor = e.deltaY < 0 ? 1.18 : 1 / 1.18;
    const oldZoom = editorZoom;
    const newZoom = Math.max(0.5, Math.min(6.0, Math.round(oldZoom * zoomFactor * 100) / 100));
    if (newZoom === oldZoom) return;

    const vRect = viewport.getBoundingClientRect();
    const cx = vRect.left + vRect.width / 2;
    const cy = vRect.top + vRect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const ratio = newZoom / oldZoom;

    editorPanX = dx - (dx - editorPanX) * ratio;
    editorPanY = dy - (dy - editorPanY) * ratio;
    editorZoom = newZoom;

    if (editorZoom === 1.0 && Math.hypot(editorPanX, editorPanY) < 25) {
      editorPanX = 0;
      editorPanY = 0;
    }

    applyEditorTransform();
    updateCursorRing(e.clientX, e.clientY);
  }, { passive: false });

  // Keyboard shortcuts inside editor (Space to pan, Ctrl+Z undo, Ctrl+Y redo, R/E/H tools, [/] size)
  window.addEventListener("keydown", e => {
    const editContainer = document.getElementById("editViewContainer");
    if (!editContainer || editContainer.classList.contains("hidden")) return;
    if (e.target && ["INPUT", "SELECT", "TEXTAREA"].includes(e.target.tagName)) return;

    if (e.code === "Space" && !isSpacePressed) {
      e.preventDefault();
      isSpacePressed = true;
      updateCursorRing(lastMouseClient.x, lastMouseClient.y);
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
      e.preventDefault();
      if (e.shiftKey) {
        redoBrushStroke();
      } else {
        undoBrushStroke();
      }
      return;
    }

    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
      e.preventDefault();
      redoBrushStroke();
      return;
    }

    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      const k = e.key.toLowerCase();
      if (k === "r") setBrushMode("restore");
      else if (k === "e") setBrushMode("erase");
      else if (k === "h") setBrushMode("pan");
      else if (k === "0") resetEditorZoom();
      else if (e.key === "[" || e.key === "]") {
        const delta = e.key === "]" ? 6 : -6;
        const nextSize = Math.max(2, Math.min(140, brushSize + delta));
        updateBrushSize(nextSize);
        const slider = document.getElementById("brushSizeSlider");
        if (slider) slider.value = nextSize;
        updateCursorRing(lastMouseClient.x, lastMouseClient.y);
      }
    }
  });

  window.addEventListener("keyup", e => {
    if (e.code === "Space") {
      isSpacePressed = false;
      updateCursorRing(lastMouseClient.x, lastMouseClient.y);
    }
  });
}

async function initBrushEditorForCurrentResult(origDataUrl, cutoutDataUrl) {
  const canvas = document.getElementById("editorCanvas");
  const ghostImg = document.getElementById("editorGhostImg");
  if (!canvas || !origDataUrl || !cutoutDataUrl) return;

  if (ghostImg) {
    ghostImg.src = origDataUrl;
    const showGhost = document.getElementById("editorGhostToggle")?.checked ?? true;
    ghostImg.style.opacity = showGhost ? "0.25" : "0";
  }

  const loadImg = src =>
    new Promise((resolve, reject) => {
      const im = new Image();
      im.onload = () => resolve(im);
      im.onerror = reject;
      im.src = src;
    });

  try {
    const [origImg, cutoutImg] = await Promise.all([
      loadImg(origDataUrl),
      loadImg(cutoutDataUrl)
    ]);

    const w = cutoutImg.width;
    const h = cutoutImg.height;

    canvas.width = w;
    canvas.height = h;
    origOffscreenCanvas.width = w;
    origOffscreenCanvas.height = h;
    initialCutoutCanvas.width = w;
    initialCutoutCanvas.height = h;
    brushStampCanvas.width = w;
    brushStampCanvas.height = h;

    origOffscreenCanvas.getContext("2d").drawImage(origImg, 0, 0, w, h);
    initialCutoutCanvas.getContext("2d").drawImage(cutoutImg, 0, 0, w, h);
    canvas.getContext("2d").drawImage(cutoutImg, 0, 0, w, h);

    // Scale default brush size proportionally to image resolution
    const defaultBrush = Math.max(12, Math.min(90, Math.round(Math.min(w, h) * 0.04)));
    updateBrushSize(defaultBrush);
    const slider = document.getElementById("brushSizeSlider");
    if (slider) slider.value = defaultBrush;

    editorUndoStack = [];
    editorRedoStack = [];
    editorHasUnsavedChanges = false;
    resetOutlineControls();
    fitEditorCanvasToViewport();
    resetEditorZoom();
  } catch (err) {
    console.error("Failed to initialize brush editor:", err);
  }
}

function pushEditorUndoState() {
  const canvas = document.getElementById("editorCanvas");
  if (!canvas || !canvas.width) return;
  const ctx = canvas.getContext("2d");
  if (editorUndoStack.length >= 20) {
    editorUndoStack.shift();
  }
  editorUndoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
}

function undoBrushStroke() {
  const canvas = document.getElementById("editorCanvas");
  if (!canvas || editorUndoStack.length === 0) return;
  const ctx = canvas.getContext("2d");
  editorRedoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  const prev = editorUndoStack.pop();
  ctx.putImageData(prev, 0, 0);
  editorHasUnsavedChanges = true;
}

function redoBrushStroke() {
  const canvas = document.getElementById("editorCanvas");
  if (!canvas || editorRedoStack.length === 0) return;
  const ctx = canvas.getContext("2d");
  editorUndoStack.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
  const next = editorRedoStack.pop();
  ctx.putImageData(next, 0, 0);
  editorHasUnsavedChanges = true;
}

function resetBrushEdits() {
  const canvas = document.getElementById("editorCanvas");
  if (!canvas || !initialCutoutCanvas || !initialCutoutCanvas.width) return;
  pushEditorUndoState();
  editorRedoStack = [];
  const ctx = canvas.getContext("2d");
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(initialCutoutCanvas, 0, 0);
  editorHasUnsavedChanges = true;
}

function paintBrushSegment(p0, p1) {
  const canvas = document.getElementById("editorCanvas");
  if (!canvas || !canvas.width) return;
  const ctx = canvas.getContext("2d");
  const radius = Math.max(1.5, brushSize / 2);
  const isSoft = document.getElementById("brushSoftToggle")?.checked ?? true;

  const dist = Math.hypot(p1.x - p0.x, p1.y - p0.y);
  const step = Math.max(1, radius * 0.22);
  const steps = Math.max(1, Math.ceil(dist / step));

  if (brushMode === "erase") {
    ctx.save();
    ctx.globalCompositeOperation = "destination-out";
    for (let i = 0; i <= steps; i++) {
      const tVal = steps === 0 ? 0 : i / steps;
      const x = p0.x + (p1.x - p0.x) * tVal;
      const y = p0.y + (p1.y - p0.y) * tVal;
      ctx.beginPath();
      if (isSoft) {
        const grad = ctx.createRadialGradient(x, y, radius * 0.25, x, y, radius);
        grad.addColorStop(0, "rgba(0,0,0,1)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = "rgba(0,0,0,1)";
      }
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  } else if (brushMode === "restore") {
    // Restore mode: stamp original image pixels onto canvas inside bounding box of stroke
    const minX = Math.max(0, Math.floor(Math.min(p0.x, p1.x) - radius - 2));
    const minY = Math.max(0, Math.floor(Math.min(p0.y, p1.y) - radius - 2));
    const maxX = Math.min(canvas.width, Math.ceil(Math.max(p0.x, p1.x) + radius + 2));
    const maxY = Math.min(canvas.height, Math.ceil(Math.max(p0.y, p1.y) + radius + 2));
    const bw = maxX - minX;
    const bh = maxY - minY;
    if (bw <= 0 || bh <= 0) return;

    const sCtx = brushStampCanvas.getContext("2d");
    sCtx.save();
    sCtx.clearRect(minX, minY, bw, bh);
    sCtx.globalCompositeOperation = "source-over";

    for (let i = 0; i <= steps; i++) {
      const tVal = steps === 0 ? 0 : i / steps;
      const x = p0.x + (p1.x - p0.x) * tVal;
      const y = p0.y + (p1.y - p0.y) * tVal;
      sCtx.beginPath();
      if (isSoft) {
        const grad = sCtx.createRadialGradient(x, y, radius * 0.25, x, y, radius);
        grad.addColorStop(0, "rgba(0,0,0,1)");
        grad.addColorStop(1, "rgba(0,0,0,0)");
        sCtx.fillStyle = grad;
      } else {
        sCtx.fillStyle = "rgba(0,0,0,1)";
      }
      sCtx.arc(x, y, radius, 0, Math.PI * 2);
      sCtx.fill();
    }

    sCtx.globalCompositeOperation = "source-in";
    sCtx.drawImage(origOffscreenCanvas, minX, minY, bw, bh, minX, minY, bw, bh);
    sCtx.restore();

    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.drawImage(brushStampCanvas, minX, minY, bw, bh, minX, minY, bw, bh);
    ctx.restore();
  }
}

function setBrushMode(mode) {
  brushMode = mode;
  const restoreBtn = document.getElementById("brushRestoreBtn");
  const eraseBtn = document.getElementById("brushEraseBtn");
  const panBtn = document.getElementById("brushPanBtn");
  const cursor = document.getElementById("brushCursor");
  const viewport = document.getElementById("editorViewport");

  const inactiveCls = "px-3 py-1.5 rounded-lg text-xs font-semibold btn-secondary flex items-center gap-1.5";
  const activeCls = "px-3 py-1.5 rounded-lg text-xs font-semibold btn-primary flex items-center gap-1.5";

  if (restoreBtn) restoreBtn.className = mode === "restore" ? activeCls : inactiveCls;
  if (eraseBtn) eraseBtn.className = mode === "erase" ? activeCls : inactiveCls;
  if (panBtn) panBtn.className = mode === "pan" ? activeCls : inactiveCls;

  if (mode === "restore") {
    if (cursor) {
      cursor.className = "hidden pointer-events-none absolute z-50 rounded-full border-2 border-emerald-400 bg-emerald-400/10 flex items-center justify-center";
    }
    if (viewport) viewport.style.cursor = "none";
  } else if (mode === "erase") {
    if (cursor) {
      cursor.className = "hidden pointer-events-none absolute z-50 rounded-full border-2 border-rose-400 bg-rose-400/10 flex items-center justify-center";
    }
    if (viewport) viewport.style.cursor = "none";
  } else {
    if (cursor) cursor.classList.add("hidden");
    if (viewport) viewport.style.cursor = "grab";
  }
}

function updateBrushSize(val) {
  brushSize = parseInt(val, 10) || 32;
  const label = document.getElementById("brushSizeValue");
  if (label) label.innerText = `${brushSize}px`;
}

function toggleEditorGhost(show) {
  const ghostImg = document.getElementById("editorGhostImg");
  if (ghostImg) {
    ghostImg.style.opacity = show ? "0.25" : "0";
  }
}

function changeEditorZoom(delta) {
  const oldZoom = editorZoom;
  const newZoom = Math.max(0.5, Math.min(6.0, Math.round((oldZoom + delta) * 100) / 100));
  if (newZoom === oldZoom) return;
  const ratio = newZoom / oldZoom;
  editorPanX *= ratio;
  editorPanY *= ratio;
  editorZoom = newZoom;
  applyEditorTransform();
}

function resetEditorZoom() {
  editorZoom = 1.0;
  editorPanX = 0;
  editorPanY = 0;
  applyEditorTransform();
}

function applyEditorTransform() {
  const inner = document.getElementById("editorStageInner");
  const badge = document.getElementById("editorZoomBadge");
  if (inner) {
    inner.style.transform = `translate(${editorPanX}px, ${editorPanY}px) scale(${editorZoom})`;
  }
  if (badge) {
    badge.innerText = `${Math.round(editorZoom * 100)}%`;
  }
}

function syncEditorCanvasToPreviews() {
  const canvas = document.getElementById("editorCanvas");
  if (!canvas || !canvas.width || !currentProcessedData) return null;
  const updatedDataUrl = composeCutoutWithOutline();
  currentProcessedData.image = updatedDataUrl;
  document.getElementById("resultImageAfter").src = updatedDataUrl;
  document.getElementById("sideResultImg").src = updatedDataUrl;
  document.getElementById("cutoutOnlyImg").src = updatedDataUrl;
  return updatedDataUrl;
}

async function applyAndSaveBrushEdits() {
  const canvas = document.getElementById("editorCanvas");
  if (!canvas || !canvas.width || !currentProcessedData) return;

  editorHasUnsavedChanges = true;
  syncEditorCanvasToPreviews();
  editorHasUnsavedChanges = false;
  await saveCurrentResultToDisk();
}

// ==========================================
// POST-GENERATION SUBJECT OUTLINE (STROKE)
// ==========================================
let outlineWidth = 0;
let outlineColor = "#FFFFFF";
let outlineSilhouetteCanvas = null;
let outlineOutputCanvas = null;

function resetOutlineControls() {
  outlineWidth = 0;
  const slider = document.getElementById("outlineWidthSlider");
  const valLabel = document.getElementById("outlineWidthValue");
  const clearBtn = document.getElementById("outlineClearBtn");
  const saveBtn = document.getElementById("outlineSaveBtn");
  if (slider) slider.value = 0;
  if (valLabel) valLabel.innerText = "0px";
  if (clearBtn) clearBtn.classList.add("hidden");
  if (saveBtn) saveBtn.classList.add("hidden");
}

function setOutlineColor(hexColor) {
  outlineColor = hexColor;
  const picker = document.getElementById("outlineColorPicker");
  const swatch = document.getElementById("outlineActiveSwatch");
  if (picker) picker.value = hexColor;
  if (swatch) swatch.style.backgroundColor = hexColor;

  // If user clicks a color while thickness is 0, automatically set thickness to 8px so outline is immediately visible
  const slider = document.getElementById("outlineWidthSlider");
  if (slider && parseInt(slider.value, 10) === 0) {
    slider.value = 8;
  }
  onOutlineControlsChange();
}

function clearSubjectOutline() {
  resetOutlineControls();
  syncEditorCanvasToPreviews();
}

function onOutlineControlsChange() {
  const slider = document.getElementById("outlineWidthSlider");
  const valLabel = document.getElementById("outlineWidthValue");
  const clearBtn = document.getElementById("outlineClearBtn");
  const saveBtn = document.getElementById("outlineSaveBtn");

  outlineWidth = slider ? parseInt(slider.value, 10) || 0 : 0;
  if (valLabel) valLabel.innerText = `${outlineWidth}px`;

  if (outlineWidth > 0) {
    if (clearBtn) clearBtn.classList.remove("hidden");
    if (saveBtn) saveBtn.classList.remove("hidden");
  } else {
    if (clearBtn) clearBtn.classList.add("hidden");
    if (saveBtn) saveBtn.classList.add("hidden");
  }

  syncEditorCanvasToPreviews();
}

function composeCutoutWithOutline() {
  const canvas = document.getElementById("editorCanvas");
  if (!canvas || !canvas.width) return currentProcessedData ? currentProcessedData.image : "";

  if (outlineWidth <= 0) {
    return canvas.toDataURL("image/png");
  }

  const w = canvas.width;
  const h = canvas.height;

  if (!outlineSilhouetteCanvas) outlineSilhouetteCanvas = document.createElement("canvas");
  if (!outlineOutputCanvas) outlineOutputCanvas = document.createElement("canvas");

  outlineSilhouetteCanvas.width = w;
  outlineSilhouetteCanvas.height = h;
  outlineOutputCanvas.width = w;
  outlineOutputCanvas.height = h;

  // 1. Build solid colored silhouette from cutout alpha
  const sCtx = outlineSilhouetteCanvas.getContext("2d");
  sCtx.clearRect(0, 0, w, h);
  sCtx.globalCompositeOperation = "source-over";
  sCtx.drawImage(canvas, 0, 0);
  sCtx.globalCompositeOperation = "source-in";
  sCtx.fillStyle = outlineColor;
  sCtx.fillRect(0, 0, w, h);

  // 2. Multi-ring circular dilation for smooth sticker/contour stroke
  const oCtx = outlineOutputCanvas.getContext("2d");
  oCtx.clearRect(0, 0, w, h);
  oCtx.globalCompositeOperation = "source-over";

  // Scale pixel radius proportionally to image dimensions
  const scaleFactor = Math.max(1.0, Math.min(w, h) / 900);
  const radiusPx = Math.max(1, outlineWidth * scaleFactor);

  const rings = [0.35, 0.7, 1.0];
  for (const rFrac of rings) {
    const r = radiusPx * rFrac;
    const steps = Math.max(16, Math.min(40, Math.ceil(2 * Math.PI * r * 0.75)));
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      const dx = Math.cos(angle) * r;
      const dy = Math.sin(angle) * r;
      oCtx.drawImage(outlineSilhouetteCanvas, dx, dy);
    }
  }

  // 3. Draw sharp original/edited subject cutout on top
  oCtx.drawImage(canvas, 0, 0);

  return outlineOutputCanvas.toDataURL("image/png");
}

async function saveCurrentResultToDisk() {
  if (!currentProcessedData) return;
  const finalDataUrl = syncEditorCanvasToPreviews();
  if (!finalDataUrl) return;

  try {
    const res = await fetch("/api/save-edited", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: finalDataUrl,
        saved_path: currentProcessedData.saved_path || "",
        filename: currentFile ? currentFile.name : "image.png"
      })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.saved_path) {
        currentProcessedData.saved_path = data.saved_path;
        const savedBanner = document.getElementById("savedPathBanner");
        if (savedBanner) {
          savedBanner.innerText = `${t("toast_saved_to")}${data.saved_path}`;
          savedBanner.classList.remove("hidden");
        }
        showToast(`${t("toast_edits_saved")}: ${data.saved_path}`, "check-circle");
      } else {
        showToast(t("toast_edits_saved"), "check-circle");
      }
    }
  } catch (err) {
    showToast(err.message, "alert-circle");
  }
}

function applyBg(color) {
  currentBgColor = color;
  const stage = document.getElementById("stageWrapper");
  if (color === "transparent") {
    stage.style.backgroundColor = "";
    stage.className = "w-full flex items-center justify-center min-h-[460px] bg-transparency-grid rounded-xl relative overflow-hidden p-2";
  } else {
    stage.className = "w-full flex items-center justify-center min-h-[460px] rounded-xl relative overflow-hidden p-2 transition-colors";
    stage.style.backgroundColor = color;
  }
}

async function copyToClipboard() {
  if (!currentProcessedData || !currentProcessedData.image) return;
  try {
    const res = await fetch(currentProcessedData.image);
    const blob = await res.blob();
    await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
    showToast(t("toast_copied"), "check-circle");
  } catch (err) {
    showToast(err.message, "alert-circle");
  }
}

function downloadCutout(format = "png") {
  if (!currentProcessedData || !currentProcessedData.image) return;
  const a = document.createElement("a");
  a.href = currentProcessedData.image;
  const stem = currentFile ? currentFile.name.replace(/\.[^/.]+$/, "") : "image";
  a.download = `${stem}_removo.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

function resetToHome() {
  currentFile = null;
  currentProcessedData = null;
  document.getElementById("fileInput").value = "";
  document.getElementById("stagingContainer").classList.add("hidden");
  document.getElementById("resultsContainer").classList.add("hidden");
  document.getElementById("processingLoader").classList.add("hidden");
  document.getElementById("dropzoneContainer").classList.remove("hidden");
  applyBg("transparent");
}

function switchTab(tab) {
  const singleView = document.getElementById("singleView");
  const batchView = document.getElementById("batchView");
  const settingsView = document.getElementById("settingsView");

  const tabSingleBtn = document.getElementById("tabSingleBtn");
  const tabBatchBtn = document.getElementById("tabBatchBtn");
  const tabSettingsBtn = document.getElementById("tabSettingsBtn");

  [singleView, batchView, settingsView].forEach(v => v.classList.add("hidden"));
  [tabSingleBtn, tabBatchBtn, tabSettingsBtn].forEach(b => {
    b.className = "flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium text-secondary-theme hover:opacity-90";
  });

  if (tab === "single") {
    singleView.classList.remove("hidden");
    tabSingleBtn.className = "flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium btn-primary";
  } else if (tab === "batch") {
    batchView.classList.remove("hidden");
    tabBatchBtn.className = "flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium btn-primary";
  } else if (tab === "settings") {
    settingsView.classList.remove("hidden");
    tabSettingsBtn.className = "flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-sm font-medium btn-primary";
    fetchSettings();
  }
}

function handleBatchFiles(fileList) {
  batchFilesQueue = Array.from(fileList).filter(f => f.type.startsWith("image/"));
  if (batchFilesQueue.length === 0) return;

  const batchList = document.getElementById("batchList");
  const batchCount = document.getElementById("batchCount");
  const queueContainer = document.getElementById("batchQueueContainer");

  batchList.innerHTML = "";
  batchCount.innerText = batchFilesQueue.length;
  queueContainer.classList.remove("hidden");

  batchFilesQueue.forEach(file => {
    const card = document.createElement("div");
    card.className = "surface-input p-1.5 rounded-xl flex flex-col items-center";
    const img = document.createElement("img");
    img.className = "w-full h-20 object-cover rounded-lg";
    img.src = URL.createObjectURL(file);
    const name = document.createElement("p");
    name.className = "text-[11px] text-secondary-theme truncate w-full text-center mt-1";
    name.innerText = file.name;
    card.appendChild(img);
    card.appendChild(name);
    batchList.appendChild(card);
  });
}

async function executeBatchRender() {
  if (batchFilesQueue.length === 0) return;

  if (appSettings.auto_save && !(appSettings.output_folder || "").trim()) {
    showToast(t("toast_select_folder_prompt"), "folder");
    const chosen = await selectOutputFolder();
    if (!chosen) return;
  }

  const btn = document.getElementById("batchProcessBtn");
  const progressContainer = document.getElementById("batchProgress");
  const progressBar = document.getElementById("batchProgressBar");

  btn.disabled = true;
  progressContainer.classList.remove("hidden");
  progressBar.style.width = "45%";

  const formData = new FormData();
  batchFilesQueue.forEach(f => formData.append("files", f));
  formData.append("model_name", appSettings.default_model || "bria-rmbg");

  try {
    const res = await fetch("/api/batch", {
      method: "POST",
      body: formData
    });

    if (res.status === 428) {
      const chosen = await selectOutputFolder();
      if (chosen) return executeBatchRender();
      return;
    }

    if (!res.ok) throw new Error("Batch processing failed");

    progressBar.style.width = "100%";
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `removo_batch_${Date.now()}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (err) {
    showToast(err.message, "alert-circle");
  } finally {
    btn.disabled = false;
  }
}

function showToast(message, iconName = "check-circle") {
  const toast = document.getElementById("toast");
  const toastMsg = document.getElementById("toastMsg");
  const toastIcon = document.getElementById("toastIcon");

  toastMsg.innerText = message;
  toastIcon.setAttribute("data-lucide", iconName);
  if (window.lucide) lucide.createIcons();

  toast.classList.remove("translate-y-20", "opacity-0");
  toast.classList.add("translate-y-0", "opacity-100");

  setTimeout(() => {
    toast.classList.remove("translate-y-0", "opacity-100");
    toast.classList.add("translate-y-20", "opacity-0");
  }, 3200);
}

// Size the canvas with exact pixel dimensions (keeps aspect ratio so brush coords map 1:1)
function fitEditorCanvasToViewport() {
  const canvas = document.getElementById("editorCanvas");
  const viewport = document.getElementById("editorViewport");
  if (!canvas || !viewport || !canvas.width) return;
  let vw = viewport.clientWidth;
  let vh = viewport.clientHeight;
  if (!vw || !vh) { vw = 900; vh = 480; }
  const scale = Math.min((vw - 24) / canvas.width, (vh - 24) / canvas.height);
  canvas.style.width = `${Math.max(50, Math.floor(canvas.width * scale))}px`;
  canvas.style.height = `${Math.max(50, Math.floor(canvas.height * scale))}px`;
}

window.addEventListener("resize", () => {
  const ec = document.getElementById("editViewContainer");
  if (ec && !ec.classList.contains("hidden")) fitEditorCanvasToViewport();
});