const fs = require("fs");
const { analyzeImage } = require("../services/mlService");

// In-memory history (server restart pe reset hoga)
// Baad mein MongoDB ya JSON file se replace kar sakte hain
let detectionHistory = [];

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/v1/detect
// Image receive karo, model se analyze karo, result return karo
// ─────────────────────────────────────────────────────────────────────────────
const detectDisease = async (req, res, next) => {
  try {
    // Check: image upload hua?
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: "Koi image upload nahi ki.",
      });
    }

    const imagePath = req.file.path;
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    console.log("Image path and URL: ", imagePath, imageUrl);
    console.log(`🔍 Analyzing image: ${req.file.filename}`);

    // ML model se analyze karo
    const result = await analyzeImage(imagePath);

    // Response tayyar karo
    const response = {
      success: true,
      imageUrl,                          // Frontend image show karega
      cropName: result.cropName,      // e.g. "Tomato"
      diseaseName: result.diseaseName,   // e.g. "Late Blight"
      disease: {
        name: result.diseaseName,
        scientificName: result.scientificName,
        confidence: result.confidence,
        severity: result.severity,
        affectedAreaPercent: result.affectedAreaPercent,
      },
      annotations: result.annotations,  // Blue spots for canvas
      info: result.info,          // Description, causes, treatment
    };

    // History mein save karo
    detectionHistory.unshift({
      id: Date.now(),
      imageUrl,
      cropName: result.cropName,
      diseaseName: result.diseaseName,
      confidence: result.confidence,
      severity: result.severity,
      date: new Date().toLocaleDateString("en-PK"),
    });

    // Max 50 history entries
    if (detectionHistory.length > 50) detectionHistory.pop();

    res.status(200).json(response);

  } catch (error) {
    // Uploaded file delete karo agar error aaye
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/v1/history
// ─────────────────────────────────────────────────────────────────────────────
const getHistory = (req, res) => {
  res.status(200).json({
    success: true,
    count: detectionHistory.length,
    history: detectionHistory,
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/v1/history
// ─────────────────────────────────────────────────────────────────────────────
const clearHistory = (req, res) => {
  detectionHistory = [];
  res.status(200).json({
    success: true,
    message: "History clear ho gayi.",
  });
};

module.exports = { detectDisease, getHistory, clearHistory };