"""
Multi-Crop Plant Disease Detector API
--------------------------------------
Loads the trained .keras model (crop_disease_model.keras) and class_names.json,
returns the predicted disease, confidence, a Grad-CAM annotated image, and
per-disease agronomic info.

Run locally:
    pip install fastapi uvicorn tensorflow opencv-python-headless numpy python-multipart
    uvicorn app:app --host 0.0.0.0 --port 8000

Keep these three files in the same folder:
    app.py, crop_disease_model.keras, class_names.json

NOTE on advice fields: the treatment/prevention text below is general agronomic
guidance for educational use. Always confirm specific chemicals/dosages with your
local agricultural extension office before applying.
"""

import json
import base64
import numpy as np
import cv2
import tensorflow as tf
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

# ───────────────────────── App / CORS ─────────────────────────
app = FastAPI(title="Multi-Crop Plant Disease Detector API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ───────────────────────── Load model (the RIGHT way) ─────────────────────────
MODEL_PATH   = "crop_disease_model.keras"   # <-- your new trained model
CLASSES_PATH = "class_names.json"           # <-- saved alongside it

print("Loading model...")
model = tf.keras.models.load_model(MODEL_PATH)
with open(CLASSES_PATH) as f:
    class_names = json.load(f)
num_classes = len(class_names)
print(f"Model loaded. {num_classes} classes: {class_names}")

# References for Grad-CAM. Match MobileNetV2 by NAME (the augmentation layer is
# also a Model, so isinstance(..., Model) would grab the wrong one).
_base  = next(l for l in model.layers if "mobilenet" in l.name.lower())
_dense = model.get_layer("predictions")
_pp    = tf.keras.applications.mobilenet_v2.preprocess_input

# ───────────────────────── Label parsing ─────────────────────────
# Class labels look like "Crop___Disease". Split cleanly for display.
CROP_DISPLAY = {
    "Rice Leaf Disease Images": "Rice",
    "Sugarcane_leafs":          "Sugarcane",
    "Tomato":                   "Tomato",
    "WHEAT":                    "Wheat",
}

def split_label(label: str):
    if "___" in label:
        crop_raw, disease_raw = label.split("___", 1)
    else:
        crop_raw, disease_raw = label, ""
    crop = CROP_DISPLAY.get(crop_raw, crop_raw.replace("_", " ").title())
    disease = disease_raw.replace("_", " ").strip()
    return crop, disease

# ───────────────────────── Per-disease knowledge base ─────────────────────────
# Keyed by the EXACT class label so lookups never miss.
DISEASE_INFO = {
    "Rice Leaf Disease Images___Bacterialblight": {
        "severity": "High",
        "pathogen": "Bacterium (Xanthomonas oryzae pv. oryzae)",
        "description": "Bacterial blight of rice: water-soaked yellow lesions along leaf margins that enlarge and dry, causing wilting in severe cases.",
        "causes": ["Bacterial infection spread by irrigation water, rain splash and wind", "Entry through wounds and natural openings", "Favored by high humidity, warm weather and excess nitrogen"],
        "treatment": ["No reliable chemical cure once infected", "Remove and destroy infected plants and debris", "Drain the field and avoid water flow from infected to healthy plots", "Reduce nitrogen application"],
        "prevention": ["Plant resistant varieties", "Use certified disease-free seed", "Balanced fertilization (avoid excess N)", "Good field sanitation and water management"],
    },
    "Rice Leaf Disease Images___Blast": {
        "severity": "High",
        "pathogen": "Fungus (Magnaporthe oryzae)",
        "description": "Rice blast: spindle/diamond-shaped lesions with grey centers and brown margins on leaves; can also attack the neck and panicle.",
        "causes": ["Fungal infection favored by long leaf wetness and high humidity", "Excessive nitrogen", "Dense planting and poor air movement"],
        "treatment": ["Apply a recommended fungicide early (e.g. tricyclazole class) per local guidance", "Remove infected debris", "Stop excess nitrogen"],
        "prevention": ["Resistant varieties", "Balanced nitrogen, split applications", "Proper spacing for airflow", "Avoid prolonged standing water on leaves"],
    },
    "Rice Leaf Disease Images___Brownspot": {
        "severity": "Medium",
        "pathogen": "Fungus (Bipolaris oryzae)",
        "description": "Brown spot: small oval brown lesions scattered on leaves; strongly linked to nutrient-poor or stressed soils.",
        "causes": ["Fungal infection", "Nutrient deficiency (especially potassium and silicon)", "Drought-stressed or poor soils"],
        "treatment": ["Fungicide seed treatment plus foliar spray if severe", "Correct the underlying nutrient deficiency", "Improve soil fertility"],
        "prevention": ["Balanced fertilization", "Seed treatment before sowing", "Maintain healthy, fertile soil"],
    },
    "Rice Leaf Disease Images___Healthy Rice Leaf": {
        "severity": "Low",
        "pathogen": "None",
        "description": "Healthy rice leaf — no disease symptoms detected.",
        "causes": ["Plant appears healthy"],
        "treatment": ["No treatment needed"],
        "prevention": ["Continue good crop hygiene, balanced nutrition and regular monitoring"],
    },
    "Sugarcane_leafs___BacterialBlights": {
        "severity": "High",
        "pathogen": "Bacterial infection",
        "description": "Bacterial blight of sugarcane: streaks and reddening on leaves, leaf scald and dieback in severe cases.",
        "causes": ["Bacteria spread through infected setts (seed cane), tools and water", "Warm, humid conditions"],
        "treatment": ["Remove and destroy infected stools", "Disinfect cutting tools", "Hot-water treatment of setts before planting"],
        "prevention": ["Use disease-free certified setts", "Field and tool sanitation", "Resistant varieties"],
    },
    "Sugarcane_leafs___Healthy": {
        "severity": "Low",
        "pathogen": "None",
        "description": "Healthy sugarcane leaf — no disease symptoms detected.",
        "causes": ["Plant appears healthy"],
        "treatment": ["No treatment needed"],
        "prevention": ["Maintain good nutrition, drainage and regular monitoring"],
    },
    "Sugarcane_leafs___RedRot": {
        "severity": "High",
        "pathogen": "Fungus (Colletotrichum falcatum)",
        "description": "Red rot: drying of leaves with internal stalk reddening crossed by white patches and a sour smell when split. A highly destructive disease.",
        "causes": ["Fungal infection carried in setts, soil and water", "Spread through wounds and waterlogging"],
        "treatment": ["No in-field cure — remove and burn affected clumps immediately", "Improve drainage to limit spread"],
        "prevention": ["Plant resistant varieties", "Use healthy, fungicide-treated setts", "Crop rotation", "Avoid waterlogging"],
    },
    "Sugarcane_leafs___Rust": {
        "severity": "Medium",
        "pathogen": "Fungus (Puccinia spp.)",
        "description": "Sugarcane rust: orange-brown pustules mostly on the underside of leaves, reducing photosynthesis.",
        "causes": ["Fungal spores spread by wind", "Humid conditions and dense canopy"],
        "treatment": ["Apply a recommended fungicide if infection is severe", "Remove heavily infected leaves"],
        "prevention": ["Resistant varieties", "Avoid overly dense planting", "Balanced nutrition"],
    },
    "Sugarcane_leafs___Yellow": {
        "severity": "Medium",
        "pathogen": "Sugarcane yellow leaf virus (aphid-transmitted) / nutrient stress",
        "description": "Yellowing of the leaf midrib that spreads to the blade, often with reddening; can be viral (aphid-spread) or nutrient-related.",
        "causes": ["Virus transmitted by aphids", "Infected setts", "Sometimes nitrogen/iron deficiency"],
        "treatment": ["No cure for the viral form — remove infected stools", "Control aphid populations", "Correct nutrient deficiency if that is the cause"],
        "prevention": ["Virus-free certified setts", "Aphid monitoring and control", "Resistant varieties"],
    },
    "Tomato___Bacteria": {
        "severity": "High",
        "pathogen": "Bacteria (Xanthomonas / Pseudomonas spp.)",
        "description": "Bacterial spot/speck on tomato: small dark water-soaked spots on leaves and fruit, sometimes with yellow halos.",
        "causes": ["Bacteria spread by rain/overhead water splash", "Warm, humid weather", "Infected seed or transplants"],
        "treatment": ["Apply copper-based bactericide sprays", "Remove and destroy infected leaves/fruit", "Avoid working with wet plants"],
        "prevention": ["Certified disease-free seed/transplants", "Drip instead of overhead irrigation", "Crop rotation and sanitation"],
    },
    "Tomato___Tomato Mosaic virus": {
        "severity": "Medium",
        "pathogen": "Tomato mosaic virus (ToMV/TMV)",
        "description": "Mosaic virus: mottled light- and dark-green patches with leaf curling and distortion; stunted growth.",
        "causes": ["Virus spread by contact — hands, tools, clothing", "Infected seed or plant debris"],
        "treatment": ["No chemical cure — remove and destroy infected plants", "Disinfect hands and tools"],
        "prevention": ["Resistant varieties", "Strict sanitation, wash hands/tools", "Avoid tobacco use near plants"],
    },
    "Tomato___Tomato healthy": {
        "severity": "Low",
        "pathogen": "None",
        "description": "Healthy tomato leaf — no disease symptoms detected.",
        "causes": ["Plant appears healthy"],
        "treatment": ["No treatment needed"],
        "prevention": ["Continue balanced nutrition, good spacing and regular monitoring"],
    },
    "Tomato___Tomato_YellowLeaf__Curl_Virus": {
        "severity": "High",
        "pathogen": "Tomato yellow leaf curl virus (whitefly-transmitted)",
        "description": "TYLCV: upward curling and yellowing of leaves, severe stunting, and heavy flower/fruit drop.",
        "causes": ["Virus transmitted by whiteflies", "Spread accelerates in warm, dry conditions"],
        "treatment": ["No cure — remove and destroy infected plants", "Control whitefly populations aggressively"],
        "prevention": ["Resistant/tolerant varieties", "Whitefly control (traps, insect netting, reflective mulch)", "Remove weed hosts"],
    },
    "WHEAT___Brown_Rust": {
        "severity": "Medium",
        "pathogen": "Fungus (Puccinia triticina)",
        "description": "Brown/leaf rust of wheat: scattered orange-brown pustules on the upper leaf surface, reducing grain fill.",
        "causes": ["Fungal spores spread by wind", "Cool-moist nights followed by warm days"],
        "treatment": ["Apply a recommended foliar fungicide (e.g. triazole class) at early infection"],
        "prevention": ["Resistant varieties", "Timely sowing", "Regular scouting at tillering/booting stages"],
    },
    "WHEAT___Healthy": {
        "severity": "Low",
        "pathogen": "None",
        "description": "Healthy wheat leaf — no disease symptoms detected.",
        "causes": ["Plant appears healthy"],
        "treatment": ["No treatment needed"],
        "prevention": ["Maintain balanced nutrition and monitor regularly"],
    },
    "WHEAT___Loose Smut": {
        "severity": "High",
        "pathogen": "Fungus (Ustilago tritici), seed-borne",
        "description": "Loose smut: grain heads are replaced by masses of black powdery spores that blow away, leaving a bare stalk.",
        "causes": ["Seed-borne fungus living inside the seed embryo", "Spread to healthy heads at flowering"],
        "treatment": ["No effective in-season cure — rogue out smutted heads before they release spores"],
        "prevention": ["Systemic fungicide seed treatment (e.g. carboxin) before sowing", "Use certified clean seed", "Resistant varieties"],
    },
}

GENERIC_INFO = {
    "severity": "Medium",
    "pathogen": "Unknown",
    "description": "Disease detected. Confirm with a local agricultural expert.",
    "causes": ["See expert assessment"],
    "treatment": ["Consult your local agricultural extension office"],
    "prevention": ["Good crop hygiene and regular monitoring"],
}

# ───────────────────────── Grad-CAM (proven approach from the notebook) ─────────────────────────
def compute_gradcam(batch_raw: np.ndarray, idx: int) -> np.ndarray:
    """batch_raw: (1,224,224,3) float32 in 0-255. Returns a 0-1 heatmap (7x7-ish, upsample later)."""
    inp = _pp(tf.identity(tf.constant(batch_raw, dtype=tf.float32)))
    with tf.GradientTape() as tape:
        conv = _base(inp, training=False)
        tape.watch(conv)
        pooled = tf.reduce_mean(conv, axis=[1, 2])   # = GlobalAveragePooling2D
        out = _dense(pooled)                         # dropout is identity at inference
        channel = out[:, idx]
    grads = tape.gradient(channel, conv)[0]
    weights = tf.reduce_mean(grads, axis=(0, 1))
    cam = tf.reduce_sum(conv[0] * weights, axis=-1)
    cam = tf.maximum(cam, 0) / (tf.reduce_max(cam) + 1e-8)
    return cam.numpy()

# ───────────────────────── Prediction endpoint ─────────────────────────
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    bgr = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    if bgr is None:
        return {"error": "Could not read the uploaded image."}

    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    resized = cv2.resize(rgb, (224, 224)).astype("float32")   # KEEP 0-255, do NOT /255
    batch = np.expand_dims(resized, axis=0)

    preds = model.predict(batch, verbose=0)[0]
    idx = int(np.argmax(preds))
    confidence = float(preds[idx] * 100)
    label = class_names[idx]
    crop, disease = split_label(label)
    is_healthy = "healthy" in label.lower()

    info = DISEASE_INFO.get(label, GENERIC_INFO)

    # Grad-CAM heatmap + annotations
    annotations = []
    result_bgr = bgr.copy()
    affected_percent = 0.0
    if not is_healthy:
        try:
            cam = compute_gradcam(batch, idx)
            h, w = bgr.shape[:2]
            cam_resized = cv2.resize(cam, (w, h))
            heat = cv2.applyColorMap(np.uint8(255 * cam_resized), cv2.COLORMAP_JET)
            result_bgr = cv2.addWeighted(bgr, 0.6, heat, 0.4, 0)

            mask = np.uint8(cam_resized * 255)
            _, binary = cv2.threshold(mask, 130, 255, cv2.THRESH_BINARY)
            affected_percent = round(float(np.count_nonzero(binary)) / (h * w) * 100, 1)

            contours, _ = cv2.findContours(binary, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
            for c in contours:
                if cv2.contourArea(c) < 100:
                    continue
                x, y, bw, bh = cv2.boundingRect(c)
                M = cv2.moments(c)
                if M["m00"] != 0:
                    cx, cy = int(M["m10"] / M["m00"]), int(M["m01"] / M["m00"])
                    cv2.circle(result_bgr, (cx, cy), 10, (255, 0, 0), -1)
                annotations.append({
                    "x": int(x), "y": int(y), "width": int(bw), "height": int(bh),
                    "confidence": float(np.max(cam_resized[y:y+bh, x:x+bw])),
                    "label": f"{disease} region",
                })
        except Exception as e:
            print(f"Grad-CAM error: {e}")

    final_bgr = bgr if is_healthy else result_bgr
    _, encoded = cv2.imencode(".jpg", final_bgr)
    b64 = base64.b64encode(encoded).decode("utf-8")

    # ---- Top-3 (sorted by probability) ----
    order = np.argsort(preds)[::-1]
    top_predictions = []
    for i in order[:3]:
        c, d = split_label(class_names[int(i)])
        top_predictions.append({"label": f"{c} — {d}" if d else c, "prob": round(float(preds[i]) * 100, 2)})

    # ---- Uncertainty logic (3 signals) ----
    # 1) low absolute confidence
    # 2) small margin between #1 and #2 (model is "torn")
    # 3) cross-crop sanity: #1 and #2 are different crops (a clean single-leaf
    #    photo should not be split across two different plants)
    top1_p = float(preds[order[0]]) * 100
    top2_p = float(preds[order[1]]) * 100
    margin = top1_p - top2_p
    crop1, _ = split_label(class_names[int(order[0])])
    crop2, _ = split_label(class_names[int(order[1])])

    reasons = []
    if top1_p < 70:
        reasons.append("low confidence")
    if margin < 25:
        reasons.append("two diseases scored closely")
    if crop1 != crop2 and top2_p > 15:
        reasons.append("model is unsure which crop this is")

    uncertain = len(reasons) > 0
    if uncertain:
        message = ("Result may be unreliable (" + "; ".join(reasons) +
                   "). For a clearer diagnosis, upload a single close-up leaf "
                   "on a plain background in good lighting, then try again.")
    else:
        message = "Confident prediction."

    print(f"Prediction: {label}  conf={confidence:.2f}%  margin={margin:.1f}  uncertain={uncertain}")

    return {
        "cropName":               crop,
        "diseaseName":            "Healthy" if is_healthy else disease,
        "scientificName":         info["pathogen"],   # Node reads result.scientificName
        "confidence":             round(confidence, 2),
        "uncertain":              uncertain,          # frontend: show warning banner if true
        "uncertaintyMessage":     message,
        "severity":               info["severity"],
        # Same number under both names: old key keeps existing frontend working,
        # new key is the honest label ("where the model looked", not severity).
        "affectedAreaPercent":      affected_percent,
        "attentionCoveragePercent": affected_percent,
        "annotatedImage":         f"data:image/jpeg;base64,{b64}",
        "annotations":            annotations,
        "rawPredictedLabel":      label,
        "topPredictions":         top_predictions,
        "info": {
            "pathogen":    info["pathogen"],
            "description": info["description"],
            "causes":      info["causes"],
            "treatment":   info["treatment"],
            "prevention":  info["prevention"],
            "disclaimer":  "General guidance for educational use. Confirm chemicals/dosages with your local agricultural extension office.",
        },
    }

@app.get("/")
def health():
    return {"status": "running", "model_loaded": model is not None, "classes": class_names}
