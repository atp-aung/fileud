const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

const IMAGE_MAX_SIZE = 2 * 1024 * 1024;
const FILE_MAX_SIZE = 1 * 1024 * 1024;

const imageTypes = {
  ".jpg": ["image/jpeg"],
  ".jpeg": ["image/jpeg"],
  ".png": ["image/png"],
  ".gif": ["image/gif"],
  ".tiff": ["image/tiff"],
};

const documentTypes = {
  ".pdf": ["application/pdf"],
  ".doc": ["application/msword"],
  ".docx": [
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  ".xls": ["application/vnd.ms-excel"],
  ".xlsx": [
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  ],
  ".ppt": ["application/vnd.ms-powerpoint"],
  ".pptx": [
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ],
  ".txt": ["text/plain"],
};

// Create storage configuration
const createStorage = (folder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "..", "uploads", folder));
    },

    filename: (req, file, cb) => {
      const extension = path.extname(file.originalname).toLowerCase();
      const uniqueName = `${crypto.randomUUID()}${extension}`;

      cb(null, uniqueName);
    },
  });
};

// Validate file extension and MIME type
const createFileFilter = (allowedTypes) => {
  return (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    const allowedMimeTypes = allowedTypes[extension];

    if (!allowedMimeTypes || !allowedMimeTypes.includes(file.mimetype)) {
      const error = new Error("Invalid file type.");
      error.status = 400;

      return cb(error);
    }

    cb(null, true);
  };
};

// Image upload configuration
const imageUpload = multer({
  storage: createStorage("images"),
  limits: {
    fileSize: IMAGE_MAX_SIZE,
    files: 1,
  },
  fileFilter: createFileFilter(imageTypes),
});

// Document upload configuration
const documentUpload = multer({
  storage: createStorage("files"),
  limits: {
    fileSize: FILE_MAX_SIZE,
    files: 1,
  },
  fileFilter: createFileFilter(documentTypes),
});

module.exports = {
  imageUpload,
  documentUpload,
};
