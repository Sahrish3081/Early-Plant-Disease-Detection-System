const multer = require("multer");
const path   = require("path");
const { v4: uuidv4 } = require("uuid");

// ── Storage config ────────────────────────────────────────────────────────────
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || "./uploads");
  },
  filename: (req, file, cb) => {
    // Unique filename: uuid + original extension
    const ext      = path.extname(file.originalname);
    const filename = `plant_${uuidv4()}${ext}`;
    cb(null, filename);
  },
});

// ── File filter (only images) ─────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/jpg", "image/png"];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Sirf JPG ya PNG image upload karein."), false);
  }
};

// ── Multer instance ───────────────────────────────────────────────────────────
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: (parseInt(process.env.MAX_FILE_SIZE) || 10) * 1024 * 1024,
  },
});

module.exports = upload;