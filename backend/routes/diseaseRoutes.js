const express = require("express");
const router  = express.Router();

const upload = require("../middleware/uploadMiddleware");
const {
  detectDisease,
  getHistory,
  clearHistory,
} = require("../controllers/diseaseController");

// POST /api/v1/detect  — image upload + disease detection
router.post("/detect", upload.single("image"), detectDisease);

// GET  /api/v1/history — past detections
router.get("/history", getHistory);

// DELETE /api/v1/history — clear history
router.delete("/history", clearHistory);

module.exports = router;