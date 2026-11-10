require("dotenv").config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const path = require("path");
const fs = require("fs");

const app = express();

const PORT = process.env.PORT || 3000;

// Create upload directories if they do not exist
const uploadDirectories = ["uploads/images", "uploads/files"];

uploadDirectories.forEach((directory) => {
  const fullPath = path.join(__dirname, directory);

  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

// Security middleware
app.use(
  helmet({
    crossOriginResourcePolicy: {
      policy: "cross-origin",
    },
  }),
);

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://127.0.0.1:5500",
  }),
);

// Body parsing middleware
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running successfully.",
  });
});

const uploadRoutes = require("./routes/uploadRoutes");

// Upload API routes
app.use("/api/uploads", uploadRoutes);

// Global error handler

app.use((err, req, res, next) => {
  console.error(err);

  let statusCode = err.status || 500;
  let message = err.message || "Internal Server Error.";

  // Multer errors
  if (err instanceof require("multer").MulterError) {
    statusCode = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;

    if (err.code === "LIMIT_FILE_SIZE") {
      message = "File size exceeds the allowed limit.";
    } else if (err.code === "LIMIT_UNEXPECTED_FILE") {
      message = "Unexpected file field or multiple files are not allowed.";
    } else {
      message = "File upload error.";
    }
  }

  res.status(statusCode).json({
    success: false,
    message,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
