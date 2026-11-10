const express = require("express");

const router = express.Router();

const {
  imageUpload,
  documentUpload,
} = require("../middleware/uploadMiddleware");

const {
  getImages,
  getFiles,
  previewImage,
  downloadImage,
  downloadFile,
  deleteImage,
  deleteFile,
  uploadImage,
  uploadFile,
} = require("../controllers/uploadController");

// Image APIs
router.post("/image", imageUpload.single("image"), uploadImage);

router.get("/images", getImages);

router.get("/images/:filename/preview", previewImage);

router.get("/images/:filename/download", downloadImage);

router.delete("/images/:filename", deleteImage);

// Document APIs
router.post("/file", documentUpload.single("file"), uploadFile);

router.get("/files", getFiles);

router.get("/files/:filename/download", downloadFile);

router.delete("/files/:filename", deleteFile);

module.exports = router;
