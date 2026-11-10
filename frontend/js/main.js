// ========================================
// 1. API CONFIGURATION
// ========================================

const API_URL = "http://localhost:3000/api/uploads";

const IMAGE_MAX_SIZE = 2 * 1024 * 1024;
const FILE_MAX_SIZE = 1 * 1024 * 1024;

const IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".gif", ".tiff"];

const FILE_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".txt",
];

// ========================================
// 2. DOM ELEMENTS
// ========================================

const imageInput = document.getElementById("imageInput");
const fileInput = document.getElementById("fileInput");

const imagePreview = document.getElementById("imagePreview");
const filePreview = document.getElementById("filePreview");

const uploadImageBtn = document.getElementById("uploadImageBtn");
const uploadFileBtn = document.getElementById("uploadFileBtn");

const imageGallery = document.getElementById("imageGallery");
const fileList = document.getElementById("fileList");

const totalImages = document.getElementById("totalImages");
const totalFiles = document.getElementById("totalFiles");

const imageCount = document.getElementById("imageCount");
const fileCount = document.getElementById("fileCount");

const notification = document.getElementById("notification");

// ========================================
// 3. APPLICATION STATE
// ========================================

let selectedImage = null;
let selectedFile = null;
let imageObjectUrl = null;

// ========================================
// 4. HELPER FUNCTIONS
// ========================================

// Format file size
function formatFileSize(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(2)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

// Get file extension
function getExtension(filename) {
  return filename.slice(filename.lastIndexOf(".")).toLowerCase();
}

// Validate file
function validateFile(file, allowedExtensions, maxSize) {
  if (!file) {
    return "Please select a file.";
  }

  const extension = getExtension(file.name);

  if (!allowedExtensions.includes(extension)) {
    return "This file format is not allowed.";
  }

  if (file.size > maxSize) {
    return `File size must not exceed ${formatFileSize(maxSize)}.`;
  }

  if (file.size === 0) {
    return "Empty files are not allowed.";
  }

  return null;
}

// Show notification
let notificationTimeout;

function showNotification(message, type = "info") {
  notification.textContent = message;

  notification.className = `notification show ${type}`;

  clearTimeout(notificationTimeout);

  notificationTimeout = setTimeout(() => {
    notification.classList.remove("show");
  }, 3000);
}

// Show empty state
function showEmptyState(container, icon, message) {
  const wrapper = document.createElement("div");
  wrapper.className = "empty-state";

  const iconElement = document.createElement("span");
  iconElement.textContent = icon;

  const textElement = document.createElement("p");
  textElement.textContent = message;

  wrapper.append(iconElement, textElement);

  container.replaceChildren(wrapper);
}

// Create a button safely
function createButton(text, className, onClick) {
  const button = document.createElement("button");

  button.type = "button";
  button.textContent = text;
  button.className = className;

  button.addEventListener("click", onClick);

  return button;
}

// ========================================
// 5. IMAGE PREVIEW
// ========================================

imageInput.addEventListener("change", () => {
  const file = imageInput.files[0];

  selectedImage = null;
  uploadImageBtn.disabled = true;

  if (imageObjectUrl) {
    URL.revokeObjectURL(imageObjectUrl);
    imageObjectUrl = null;
  }

  if (!file) {
    imagePreview.textContent = "No image selected";
    return;
  }

  const error = validateFile(file, IMAGE_EXTENSIONS, IMAGE_MAX_SIZE);

  if (error) {
    imageInput.value = "";
    imagePreview.textContent = "No image selected";
    showNotification(error, "error");
    return;
  }

  selectedImage = file;

  imageObjectUrl = URL.createObjectURL(file);

  const img = document.createElement("img");
  img.src = imageObjectUrl;
  img.alt = "Selected image preview";

  const info = document.createElement("div");
  info.className = "preview-info";

  const name = document.createElement("strong");
  name.textContent = file.name;

  const size = document.createElement("p");
  size.textContent = formatFileSize(file.size);

  info.append(name, size);

  imagePreview.replaceChildren(img, info);

  uploadImageBtn.disabled = false;
});

// ========================================
// 6. DOCUMENT PREVIEW
// ========================================

fileInput.addEventListener("change", () => {
  const file = fileInput.files[0];

  selectedFile = null;
  uploadFileBtn.disabled = true;

  if (!file) {
    filePreview.textContent = "No document selected";
    return;
  }

  const error = validateFile(file, FILE_EXTENSIONS, FILE_MAX_SIZE);

  if (error) {
    fileInput.value = "";
    filePreview.textContent = "No document selected";
    showNotification(error, "error");
    return;
  }

  selectedFile = file;

  const icon = document.createElement("span");
  icon.textContent = "📄";
  icon.style.fontSize = "35px";

  const info = document.createElement("div");
  info.className = "preview-info";

  const name = document.createElement("strong");
  name.textContent = file.name;

  const size = document.createElement("p");
  size.textContent = formatFileSize(file.size);

  info.append(name, size);

  filePreview.replaceChildren(icon, info);

  uploadFileBtn.disabled = false;
});

// ========================================
// 7. IMAGE UPLOAD
// ========================================

uploadImageBtn.addEventListener("click", async () => {
  if (!selectedImage) return;

  const formData = new FormData();

  formData.append("image", selectedImage);

  uploadImageBtn.disabled = true;
  uploadImageBtn.textContent = "Uploading...";

  try {
    const response = await fetch(`${API_URL}/image`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    showNotification("Image uploaded successfully!", "success");

    selectedImage = null;
    imageInput.value = "";
    imagePreview.textContent = "No image selected";

    if (imageObjectUrl) {
      URL.revokeObjectURL(imageObjectUrl);
      imageObjectUrl = null;
    }

    await loadImages();
  } catch (error) {
    showNotification(error.message || "Image upload failed.", "error");
  } finally {
    uploadImageBtn.textContent = "Upload Image";
    uploadImageBtn.disabled = true;
  }
});

// ========================================
// 8. DOCUMENT UPLOAD
// ========================================

uploadFileBtn.addEventListener("click", async () => {
  if (!selectedFile) return;

  const formData = new FormData();

  formData.append("file", selectedFile);

  uploadFileBtn.disabled = true;
  uploadFileBtn.textContent = "Uploading...";

  try {
    const response = await fetch(`${API_URL}/file`, {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    showNotification("Document uploaded successfully!", "success");

    selectedFile = null;
    fileInput.value = "";
    filePreview.textContent = "No document selected";

    await loadFiles();
  } catch (error) {
    showNotification(error.message || "File upload failed.", "error");
  } finally {
    uploadFileBtn.textContent = "Upload Document";
    uploadFileBtn.disabled = true;
  }
});

// ========================================
// 9. LOAD IMAGE GALLERY
// ========================================

async function loadImages() {
  try {
    const response = await fetch(`${API_URL}/images`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    const images = result.data;

    totalImages.textContent = images.length;
    imageCount.textContent = `${images.length} Images`;

    imageGallery.replaceChildren();

    if (images.length === 0) {
      showEmptyState(imageGallery, "🖼️", "No images uploaded yet.");

      return;
    }

    images.forEach((image) => {
      const card = document.createElement("div");
      card.className = "image-card";

      const img = document.createElement("img");

      img.src = `${API_URL}/images/${encodeURIComponent(image.filename)}/preview`;
      img.alt = "Uploaded image";
      img.loading = "lazy";

      img.addEventListener("error", () => {
        img.alt = "Image preview unavailable";
      });

      const info = document.createElement("div");
      info.className = "image-card-info";

      const name = document.createElement("p");
      name.textContent = image.filename;

      const size = document.createElement("p");
      size.textContent = formatFileSize(image.size);

      const actions = document.createElement("div");
      actions.className = "file-actions";

      const downloadBtn = createButton("Download", "btn btn-primary", () =>
        downloadItem(
          `${API_URL}/images/${encodeURIComponent(image.filename)}/download`,
          image.filename,
        ),
      );

      const deleteBtn = createButton("Delete", "btn btn-success", () =>
        deleteItem("images", image.filename),
      );

      actions.append(downloadBtn, deleteBtn);

      info.append(name, size, actions);

      card.append(img, info);

      imageGallery.appendChild(card);
    });
  } catch (error) {
    showNotification("Unable to load images.", "error");
  }
}

// ========================================
// 10. LOAD DOCUMENT LIST
// ========================================

async function loadFiles() {
  try {
    const response = await fetch(`${API_URL}/files`);

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    const files = result.data;

    totalFiles.textContent = files.length;
    fileCount.textContent = `${files.length} Files`;

    fileList.replaceChildren();

    if (files.length === 0) {
      showEmptyState(fileList, "📂", "No documents uploaded yet.");

      return;
    }

    files.forEach((file) => {
      const card = document.createElement("div");
      card.className = "file-card";

      const info = document.createElement("div");
      info.className = "file-info";

      const icon = document.createElement("span");
      icon.textContent = "📄";
      icon.style.fontSize = "28px";

      const details = document.createElement("div");

      const name = document.createElement("p");
      name.textContent = file.filename;

      const size = document.createElement("small");
      size.textContent = formatFileSize(file.size);

      details.append(name, size);

      info.append(icon, details);

      const actions = document.createElement("div");
      actions.className = "file-actions";

      const downloadBtn = createButton("Download", "btn btn-primary", () =>
        downloadItem(
          `${API_URL}/files/${encodeURIComponent(file.filename)}/download`,
          file.filename,
        ),
      );

      const deleteBtn = createButton("Delete", "btn btn-success", () =>
        deleteItem("files", file.filename),
      );

      actions.append(downloadBtn, deleteBtn);

      card.append(info, actions);

      fileList.appendChild(card);
    });
  } catch (error) {
    showNotification("Unable to load documents.", "error");
  }
}

// ========================================
// 11. DOWNLOAD ITEM
// ========================================

async function downloadItem(url, filename) {
  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Download failed.");
    }

    const blob = await response.blob();

    const objectUrl = URL.createObjectURL(blob);

    const link = document.createElement("a");

    link.href = objectUrl;
    link.download = filename;

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(objectUrl);
  } catch (error) {
    showNotification(error.message, "error");
  }
}

// ========================================
// 12. DELETE ITEM
// ========================================

async function deleteItem(type, filename) {
  const confirmed = window.confirm(
    `Are you sure you want to delete ${filename}?`,
  );

  if (!confirmed) return;

  try {
    const response = await fetch(
      `${API_URL}/${type}/${encodeURIComponent(filename)}`,
      {
        method: "DELETE",
      },
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message);
    }

    showNotification("File deleted successfully!", "success");

    if (type === "images") {
      await loadImages();
    } else {
      await loadFiles();
    }
  } catch (error) {
    showNotification(error.message, "error");
  }
}

// ========================================
// 13. INITIALIZE APPLICATION
// ========================================

async function initializeApp() {
  await Promise.all([loadImages(), loadFiles()]);
}

initializeApp();
