const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// ─── MOCK DATA (jab tak real model nahi lagta) ────────────────────────────────
const mockResponse = {
  success: true,
  disease: {
    name: "Late Blight",
    scientificName: "Phytophthora infestans",
    confidence: 87.4,
    severity: "High",
    affectedAreaPercent: 34,
  },
  annotations: [
    { x: 80,  y: 60,  width: 90, height: 70, confidence: 0.91, label: "Lesion" },
    { x: 220, y: 140, width: 60, height: 50, confidence: 0.78, label: "Spot"   },
    { x: 150, y: 200, width: 45, height: 40, confidence: 0.65, label: "Early Spot" },
  ],
  info: {
    description:
      "Late blight is a devastating disease caused by Phytophthora infestans. It rapidly destroys foliage and can spread to tubers and fruit within days.",
    causes: [
      "High humidity above 90%",
      "Cool temperatures 10–25°C",
      "Infected plant material",
      "Poor air circulation",
    ],
    treatment: [
      "Apply copper-based fungicide immediately",
      "Remove and destroy all infected leaves",
      "Improve air circulation between plants",
      "Apply mancozeb or chlorothalonil sprays",
    ],
    prevention: [
      "Use certified disease-resistant varieties",
      "Practice 3-year crop rotation",
      "Avoid overhead irrigation",
      "Monitor plants weekly during humid periods",
    ],
  },
};

// ─── DETECT DISEASE ───────────────────────────────────────────────────────────
// USE_MOCK = true  → fake data (development)
// USE_MOCK = false → real Node.js backend
const USE_MOCK = true;

export const detectDisease = async (imageFile) => {
  if (USE_MOCK) {
    // Simulate network delay
    await new Promise((res) => setTimeout(res, 3000));
    return mockResponse;
  }

  // Real backend call — Node.js POST /api/v1/detect
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(`${BASE_URL}/detect`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Server error: ${response.status}`);
  }

  return response.json();
};

// ─── GET HISTORY FROM BACKEND (optional) ─────────────────────────────────────
export const getHistory = async () => {
  if (USE_MOCK) return [];

  const response = await fetch(`${BASE_URL}/history`);
  if (!response.ok) throw new Error("Failed to fetch history");
  return response.json();
};
