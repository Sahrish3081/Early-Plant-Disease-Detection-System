# 🌿 PhytoScan — Plant Disease Detection System

> AI-powered web application that detects plant diseases from leaf images using Deep Learning (MobileNetV2 + Grad-CAM)

---

## 🎯 About The Project

PhytoScan is a Final Year Project that helps farmers detect plant diseases early by simply uploading a photo of the affected leaf. The system identifies the crop, disease name, confidence score, and highlights diseased areas with visual markers.

---

## ✨ Features

- 📷 **Drag & Drop** image upload
- 🔵 **Grad-CAM visualization** — blue spots on diseased areas  
- 🌿 **Crop Detection** — Tomato, Rice, Wheat, Sugarcane
- 🦠 **Disease Identification** — 16+ specific diseases
- 📊 **Confidence Score** with uncertainty warning
- 💊 **Treatment & Prevention** recommendations
- 📋 **Detection History** 
- 📱 **Mobile Responsive** design

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React.js + Vite |
| Backend | Node.js + Express |
| ML API | Python + FastAPI |
| Model | MobileNetV2 (Transfer Learning) |
| Visualization | Grad-CAM + OpenCV |
| Styling | Custom CSS |

---

## 📁 Project Structure

```
plant-disease-detector/
├── Plant-Disease-DEtector/     ← React Frontend
│   ├── src/
│   │   ├── assets/
│   │   │   ├── components/
│   │   │   └── pages/
│   │   ├── context/
│   │   ├── services/
│   │   └── styles/
│   └── package.json
│
├── backend/                    ← Node.js Backend
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── services/
│   └── server.js
│
└── ml-model/                   ← Python FastAPI ML Server
    ├── app.py
    ├── class_names.json
    └── requirements.txt
```

---

## 🚀 How To Run

### Prerequisites
- Node.js v18+
- Python 3.11
- Git

### 1. Clone Repository
```bash
git clone https://github.com/YOUR_USERNAME/plant-disease-detector.git
cd plant-disease-detector
```

### 2. Frontend Setup
```bash
cd Plant-Disease-DEtector
npm install
npm run dev
```

### 3. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 4. ML Model Setup
```bash
cd ml-model
python -m venv venv
venv\Scripts\activate      # Windows
pip install -r requirements.txt

# Add your trained model files:
# - crop_disease_model.keras
# - class_names.json

uvicorn app:app --reload --port 8000
```

---

## ⚙️ Environment Variables

### Backend `.env`
```
PORT=5000
USE_MOCK=false
ML_API_URL=http://localhost:8000/predict
```

### Frontend `.env`
```
VITE_API_URL=http://localhost:5000/api/v1
```

---

## 🤖 ML Model

- **Architecture:** MobileNetV2 (Transfer Learning)
- **Training Platform:** Kaggle (GPU)
- **Input Size:** 224 × 224 × 3
- **Supported Crops:** Tomato, Rice, Wheat, Sugarcane
- **Diseases:** 16+ specific plant diseases

> ⚠️ Model files (`.keras`) are not included due to size. Train your own using the provided architecture or contact the author.

---

## 🌿 Supported Diseases

| Crop | Diseases |
|------|---------|
| 🍅 Tomato | Bacterial Spot, Mosaic Virus, Yellow Leaf Curl Virus, Healthy |
| 🌾 Wheat | Brown Rust, Loose Smut, Healthy |
| 🍚 Rice | Bacterial Blight, Blast, Brown Spot, Healthy |
| 🌿 Sugarcane | Bacterial Blight, Red Rot, Rust, Yellow, Healthy |

---

## 👩‍💻 Developer

**[Your Name]**  
Final Year Project — BS Computer Science  
[Your University Name] — 2025

---

## 📄 License

This project is for educational purposes only.  
Always consult a local agricultural expert for confirmed diagnosis.
