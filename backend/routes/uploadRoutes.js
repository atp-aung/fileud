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

const requireFile = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: "Please select a file to upload.",
    });
  }

  next();
};

// Image APIs
router.post("/image", imageUpload.single("image"), requireFile, uploadImage);

router.get("/images", getImages);

router.get("/images/:filename/preview", previewImage);

router.get("/images/:filename/download", downloadImage);

router.delete("/images/:filename", deleteImage);

// Document APIs
router.post("/file", documentUpload.single("file"), requireFile, uploadFile);

router.get("/files", getFiles);

router.get("/files/:filename/download", downloadFile);

router.delete("/files/:filename", deleteFile);

module.exports = router;
