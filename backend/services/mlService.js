// services/mlService.js
// USE_MOCK=true  → mock data (abhi ke liye)
// USE_MOCK=false → real Flask model connect hoga

const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const analyzeImage = async (imagePath) => {
  if (process.env.USE_MOCK === "true") {
    await new Promise((res) => setTimeout(res, 1500));
    return {
      cropName: "Tomato",
      diseaseName: "Late Blight",
      scientificName: "Phytophthora infestans",
      confidence: 87.4,
      severity: "High",
      affectedAreaPercent: 34,
      annotatedImage: null,   // Mock mein null, real mein base64 aayega
      annotations: [
        { x: 80, y: 60, width: 90, height: 70, confidence: 0.91, label: "Disease Spot" },
        { x: 220, y: 140, width: 60, height: 50, confidence: 0.78, label: "Disease Spot" },
        { x: 150, y: 200, width: 45, height: 40, confidence: 0.65, label: "Disease Spot" },
      ],
      info: {
        description: "Late blight is caused by Phytophthora infestans. It rapidly destroys foliage.",
        causes: ["High humidity", "Cool temperatures", "Infected material"],
        treatment: ["Apply copper fungicide", "Remove infected leaves", "Improve air circulation"],
        prevention: ["Use resistant varieties", "Crop rotation", "Avoid overhead irrigation"],
      },
    };
  }

  // ── Real Flask Model Call ─────────────────────────────────────────────────
  // .env mein USE_MOCK=false karo jab model ready ho
  const mlUrl = process.env.ML_API_URL || "http://localhost:8000/predict";
  const formData = new FormData();
  formData.append("file", fs.createReadStream(imagePath));

  try {
    const response = await axios.post(mlUrl, formData, {
      headers: {
        ...formData.getHeaders(),
      },
      maxContentLength: Infinity,
      maxBodyLength: Infinity,
    });

    return response.data;
  } catch (error) {
    let errorMessage = "ML service error. Please check the model server.";

    if (error.response) {
      const status = error.response.status;
      const statusText = error.response.statusText || "";
      const serverError = error.response.data?.error || error.response.data || "No details provided.";
      errorMessage = `ML server returned ${status} ${statusText}: ${serverError}`;
    } else if (error.request) {
      errorMessage = `No response from ML server at ${mlUrl}. Is the model server running?`;
    } else if (error.message) {
      errorMessage = `ML request failed: ${error.message}`;
    }

    throw new Error(errorMessage);
  }
};

module.exports = { analyzeImage };