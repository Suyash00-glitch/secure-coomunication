const multer = require("multer");
const path = require("path");
const crypto = require("crypto");

// ======================================================
// Allowed Extensions
// ======================================================

const ALLOWED_EXTENSIONS = new Set([
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".csv",
  ".txt",
  ".jpg",
  ".jpeg",
  ".png",
]);

// ======================================================
// Allowed MIME Types
// ======================================================

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",

  "application/msword",

  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",

  "application/vnd.ms-excel",

  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",

  "text/csv",

  "text/plain",

  "image/jpeg",

  "image/png",
]);

// ======================================================
// Multer Storage
// ======================================================

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "uploads/");
  },

  filename(req, file, cb) {
    // ==========================================
    // Generate secure random filename
    // Keeps original extension only
    // ==========================================

    const extension = path.extname(file.originalname).toLowerCase();

    const randomName = crypto.randomBytes(16).toString("hex") + extension;

    cb(null, randomName);
  },
});

// ======================================================
// File Validation
// ======================================================

function fileFilter(req, file, cb) {
  const extension = path.extname(file.originalname).toLowerCase();

  if (!ALLOWED_EXTENSIONS.has(extension)) {
    return cb(
      new Error(
        "Unsupported file type. Allowed: PDF, DOC, DOCX, XLS, XLSX, CSV, TXT, JPG, JPEG, PNG.",
      ),
    );
  }

  if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
    return cb(new Error("Invalid file content. MIME type not allowed."));
  }

  cb(null, true);
}

// ======================================================
// Upload Middleware
// ======================================================

const upload = multer({
  storage,

  fileFilter,

  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
  },
});

module.exports = upload;
