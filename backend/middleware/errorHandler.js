const errorHandler = (err, req, res, next) => {
  console.error("❌ Error:", err.message);

  // Multer errors
  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: "File size bohat bari hai. Max 10MB allowed hai.",
    });
  }

  if (err.message === "Sirf JPG ya PNG image upload karein.") {
    return res.status(400).json({
      success: false,
      error: err.message,
    });
  }

  // Generic error
  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Server error. Please try again.",
  });
};

module.exports = errorHandler;