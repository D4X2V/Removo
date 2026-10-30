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
  default_model: "bria-rmbg",
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
    post_process_label: "Mask Post-Processing",
    post_process_desc: "Morphological cleanup for cleaner contours",
    alpha_matting_label: "Alpha Matting",
    alpha_matting_desc: "Sub-pixel edge estimation for hair and semi-transparency",
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
    post_process_label: "Post-Procesamiento de Máscara",
    post_process_desc: "Limpieza morfológica para bordes definidos",
    alpha_matting_label: "Alpha Matting",
    alpha_matting_desc: "Estimación subpíxel para cabello y semitransparencias",
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

// Upscayl-style native OS folder picker
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

  // Upscayl check: if auto_save is enabled and no output_folder is set, ask user to pick one now
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

    setSplitPosition(50);

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

  const btnSplit = document.getElementById("viewSplitBtn");
  const btnSide = document.getElementById("viewSideBtn");
  const btnCutout = document.getElementById("viewCutoutBtn");

  [btnSplit, btnSide, btnCutout].forEach(b => {
    b.className = "px-3 py-1 rounded-lg text-xs font-medium text-secondary-theme";
  });

  splitContainer.classList.add("hidden");
  sideContainer.classList.add("hidden");
  cutoutContainer.classList.add("hidden");

  if (mode === "split") {
    splitContainer.classList.remove("hidden");
    btnSplit.className = "px-3 py-1 rounded-lg text-xs font-medium btn-primary";
  } else if (mode === "side") {
    sideContainer.classList.remove("hidden");
    btnSide.className = "px-3 py-1 rounded-lg text-xs font-medium btn-primary";
  } else {
    cutoutContainer.classList.remove("hidden");
    btnCutout.className = "px-3 py-1 rounded-lg text-xs font-medium btn-primary";
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
