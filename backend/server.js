require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const path    = require("path");

const diseaseRoutes = require("./routes/diseaseRoutes");
const errorHandler  = require("./middleware/errorHandler");

const app  = express();
const PORT = process.env.PORT || 5000;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors({
  origin: "http://localhost:5173",   // Vite frontend
  methods: ["GET", "POST", "DELETE"],
  allowedHeaders: ["Content-Type"],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Static files (uploaded images) ───────────────────────────────────────────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ── Routes ────────────────────────────────────────────────────────────────────
app.use("/api/v1", diseaseRoutes);

// ── Health check ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    status:  "running",
    message: "Plant Disease Detector API",
    version: "1.0.0",
  });
});

// ── Error handler ─────────────────────────────────────────────────────────────
app.use(errorHandler);

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  console.log(`🤖 Mock mode: ${process.env.USE_MOCK === "true" ? "ON" : "OFF"}`);
});