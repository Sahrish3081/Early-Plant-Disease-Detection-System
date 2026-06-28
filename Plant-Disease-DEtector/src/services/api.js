// src/services/api.js  ← yeh file frontend mein replace karo

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api/v1";

// ─────────────────────────────────────────────────────────────────────────────
// POST /detect — image bhejo, disease result lo
// ─────────────────────────────────────────────────────────────────────────────
export const detectDisease = async (imageFile) => {
  const formData = new FormData();
  formData.append("image", imageFile);

  const response = await fetch(`${BASE_URL}/detect`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error || "Server error");
  }

  return response.json();
};

// ─────────────────────────────────────────────────────────────────────────────
// GET /history — past detections
// ─────────────────────────────────────────────────────────────────────────────
export const getHistory = async () => {
  const response = await fetch(`${BASE_URL}/history`);
  if (!response.ok) throw new Error("History fetch failed");
  return response.json();
};

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /history — clear all
// ─────────────────────────────────────────────────────────────────────────────
export const clearHistoryApi = async () => {
  const response = await fetch(`${BASE_URL}/history`, { method: "DELETE" });
  if (!response.ok) throw new Error("Clear failed");
  return response.json();
};
