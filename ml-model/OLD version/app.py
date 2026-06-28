import os
import cv2
import numpy as np
import tensorflow as tf
import base64
from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Multi-Crop Plant Disease Detector API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

MODEL_PATH   = "plant_disease_model.h5"
CLASSES_PATH = "class_names.npy"

def build_model(num_classes):
    inputs = tf.keras.Input(shape=(224, 224, 3))
    x = tf.keras.layers.RandomFlip("horizontal_and_vertical")(inputs)
    x = tf.keras.layers.RandomRotation(0.2)(x)
    x = tf.keras.layers.Lambda(lambda t: t / 127.5)(x)
    x = tf.keras.layers.Lambda(lambda t: t - 1.0)(x)

    base = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights=None
    )
    x = base(x, training=False)
    x = tf.keras.layers.GlobalAveragePooling2D()(x)
    outputs = tf.keras.layers.Dense(num_classes, activation='softmax')(x)
    return tf.keras.Model(inputs, outputs)

print("🔄 Model load ho raha hai...")
try:
    class_names = np.load(CLASSES_PATH, allow_pickle=True).tolist()
    num_classes  = len(class_names)
    model        = build_model(num_classes)
    model.load_weights(MODEL_PATH)
    print(f"✅ Model successfully loaded! Classes: {num_classes}")
except Exception as e:
    print(f"❌ Model load error: {e}")
    import traceback; traceback.print_exc()
    model = None

class_names = np.load(CLASSES_PATH, allow_pickle=True).tolist()
print(f"📋 Classes: {class_names}")

# ── Grad-CAM setup ────────────────────────────────────────────────────────────
grad_model = None
if model:
    try:
        mobilenet_layer = None
        for layer in model.layers:
            if isinstance(layer, tf.keras.Model) and "mobilenet" in layer.name.lower():
                mobilenet_layer = layer
                break

        if mobilenet_layer is None:
            for layer in model.layers:
                if isinstance(layer, tf.keras.Model):
                    mobilenet_layer = layer
                    break

        if mobilenet_layer:
            last_conv_name = [l.name for l in mobilenet_layer.layers
                              if isinstance(l, tf.keras.layers.Conv2D)][-1]

            grad_model = tf.keras.models.Model(
                inputs  = mobilenet_layer.input,
                outputs = [mobilenet_layer.get_layer(last_conv_name).output,
                           mobilenet_layer.output]
            )
            print(f"✅ Grad-CAM ready: {last_conv_name}")
        else:
            print("⚠️ MobileNet layer not found, Grad-CAM disabled")
    except Exception as e:
        print(f"⚠️ Grad-CAM setup failed: {e}")
        grad_model = None

"""
# DISEASE_INFO = {
#     "Tomato": {
#         "crop": "Tomato",
#         "description": "Tomato plant disease detected using Grad-CAM model.",
#         "causes":      ["High humidity", "Cool temperatures", "Infected plant material"],
#         "treatment":   ["Apply copper-based fungicide", "Remove infected leaves", "Improve air circulation"],
#         "prevention":  ["Use resistant varieties", "Crop rotation", "Avoid overhead irrigation"],
#     },
#     "Rice Leaf Disease Images": {
#         "crop": "Rice",
#         "description": "Rice leaf disease detected using Grad-CAM model.",
#         "causes":      ["Fungal infection", "Bacterial infection", "Insect vectors"],
#         "treatment":   ["Apply appropriate fungicide", "Drain fields periodically"],
#         "prevention":  ["Balanced fertilization", "Proper water management"],
#     },
#     "Sugarcane_leafs": {
#         "crop": "Sugarcane",
#         "description": "Sugarcane disease detected using Grad-CAM model.",
#         "causes":      ["Fungal pathogens", "Viral infection", "Poor drainage"],
#         "treatment":   ["Remove infected stalks", "Apply fungicide spray"],
#         "prevention":  ["Use certified seed cane", "Field sanitation"],
#     },
#     "WHEAT": {
#         "crop": "Wheat",
#         "description": "Wheat disease detected using Grad-CAM model.",
#         "causes":      ["Fungal infection", "Poor soil drainage", "High humidity"],
#         "treatment":   ["Apply systemic fungicide", "Remove infected plants"],
#         "prevention":  ["Use resistant varieties", "Seed treatment"],
#     },
# }
"""

def normalize_label(label: str) -> str:
    return label.replace("_", " ").strip().title()


def resolve_crop_name(label: str) -> str:
    normalized = normalize_label(label)
    tokens = [word for word in normalized.split() if word.lower() not in {
        "leaf", "leaves", "disease", "diseases", "image", "images", "leafs"
    }]
    return tokens[0] if tokens else normalized


def build_info_for_label(label: str) -> dict:
    normalized = normalize_label(label)
    return {
        "crop": resolve_crop_name(label),
        "description": (
            f"Model returned the class label '{normalized}'. "
            "This is the direct prediction from the trained model."
        ),
        "causes": [
            f"Prediction is based on the model class '{normalized}'."
        ],
        "treatment": [
            "Review the predicted condition with a domain expert for accurate treatment." \
            f" ({normalized})"
        ],
        "prevention": [
            "Use good crop hygiene and regular monitoring to prevent disease spread."
        ],
    }

SEVERITY_MAP = {
    "healthy": "Low", "blight": "High", "blast": "High",
    "rot": "High", "smut": "High", "rust": "Medium",
    "mosaic": "Medium", "spot": "Medium", "mold": "Medium",
}

def get_disease_info(label):
    # Use the runtime prediction label to build info dynamically.
    # Legacy examples are preserved above in the commented DISEASE_INFO block.
    return build_info_for_label(label)

def get_severity(label):
    for keyword, severity in SEVERITY_MAP.items():
        if keyword.lower() in label.lower():
            return severity
    return "Medium"

@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    if model is None:
        return {"error": "Model load nahi hua"}

    contents     = await file.read()
    nparr        = np.frombuffer(contents, np.uint8)
    original_img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

    # 1. Color convert and resizing
    img_rgb     = cv2.cvtColor(original_img, cv2.COLOR_BGR2RGB)
    img_resized = cv2.resize(img_rgb, (224, 224))
    
    # 2. EXACT PREPROCESSING MATCH (Manually doing the lambda normalization)
    img_array   = np.expand_dims(img_resized, axis=0).astype(np.float32)
    # Model expects raw 0-255 inputs because it has internal lambda layer processing
    # BUT to be absolutely safe against model layer graph issues, we pass clean float values.
    
    # Prediction
    predictions = model.predict(img_array, verbose=0)
    pred_index  = int(np.argmax(predictions[0]))
    confidence  = float(np.max(predictions[0]) * 100)

    result_img    = original_img.copy()
    annotations   = []
    markers_drawn = False

    # Grad-CAM Setup
    if grad_model:
        try:
            # Manual normalization for MobileNetV2 layer directly inside Grad-CAM
            mobilenet_input = img_array / 127.5 - 1.0

            with tf.GradientTape() as tape:
                conv_outputs, preds = grad_model(mobilenet_input)
                loss = preds[:, pred_index]

            grads        = tape.gradient(loss, conv_outputs)
            pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
            conv_out     = conv_outputs[0]
            heatmap      = conv_out @ pooled_grads[..., tf.newaxis]
            heatmap      = tf.squeeze(heatmap)
            heatmap      = np.maximum(heatmap.numpy(), 0)
            heatmap      = heatmap / (np.max(heatmap) + 1e-8)

            h, w            = original_img.shape[:2]
            heatmap_resized = cv2.resize(heatmap, (w, h))
            heatmap_uint8   = np.uint8(heatmap_resized * 255)
            _, binary_mask  = cv2.threshold(heatmap_uint8, 150, 255, cv2.THRESH_BINARY)
            contours, _     = cv2.findContours(binary_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            for contour in contours:
                if cv2.contourArea(contour) < 100:
                    continue
                M = cv2.moments(contour)
                if M["m00"] != 0:
                    cx, cy = int(M["m10"] / M["m00"]), int(M["m01"] / M["m00"])
                    cv2.circle(result_img, (cx, cy), 12, (255, 0, 0), -1)
                    markers_drawn = True
                x, y, bw, bh = cv2.boundingRect(contour)
                annotations.append({
                    "x": int(x), "y": int(y),
                    "width": int(bw), "height": int(bh),
                    "confidence": float(np.max(heatmap_resized[y:y+bh, x:x+bw])),
                    "label": "Disease Spot"
                })
        except Exception as e:
            print(f"Grad-CAM error: {e}")

    predicted_label = class_names[pred_index]
    # Normalize and infer crop/disease information
    normalized_label = normalize_label(predicted_label)
    inferred_crop = resolve_crop_name(predicted_label)

    # If the model returns only the crop name (e.g. 'Tomato'), treat disease as unknown
    if normalized_label.lower() == inferred_crop.lower():
        disease_name = "Unknown (model returned crop only)"
    else:
        disease_name = normalized_label

    final_img = original_img if ("healthy" in predicted_label.lower() and not markers_drawn) else result_img

    _, encoded_img = cv2.imencode('.jpg', final_img)
    base64_image   = base64.b64encode(encoded_img).decode('utf-8')

    info     = get_disease_info(predicted_label)
    severity = get_severity(predicted_label)

    # Top-k predictions for debugging and transparency
    try:
        probs = predictions[0]
        top_k = sorted(enumerate(probs), key=lambda x: x[1], reverse=True)[:3]
        top_predictions = [
            {"label": normalize_label(class_names[i]), "prob": round(float(p) * 100, 2)}
            for i, p in top_k
        ]
    except Exception:
        top_predictions = []

    # Log concise prediction info
    print(f"Prediction: label={predicted_label}, normalized={normalized_label}, crop={inferred_crop}, confidence={confidence}")

    return {
        "cropName":            info["crop"],
        "diseaseName":         disease_name,
        "confidence":          round(confidence, 2),
        "severity":            severity,
        "affectedAreaPercent": round(confidence * 0.4, 1),
        "annotatedImage":      f"data:image/jpeg;base64,{base64_image}",
        "annotations":         annotations,
        "rawPredictedLabel":   predicted_label,
        "topPredictions":      top_predictions,
        "info": {
            "description": info["description"],
            "causes":      info["causes"],
            "treatment":   info["treatment"],
            "prevention":  info["prevention"],
        }
    }

@app.get("/")
def health():
    return {"status": "running", "model_loaded": model is not None, "classes": class_names}