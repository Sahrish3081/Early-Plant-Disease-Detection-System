import { useState, useRef } from "react";

const ImageUploader = ({ onImageSelected, onAnalyze, imageFile, imagePreview, loading }) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = (file) => {
    if (!file) return;
    const valid = ["image/jpeg", "image/jpg", "image/png"];
    if (!valid.includes(file.type)) {
      alert("❌ Sirf JPG ya PNG image upload karein.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("❌ File size 10MB se kam honi chahiye.");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => onImageSelected(file, e.target.result);
    reader.readAsDataURL(file);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  // ── No image selected yet ──────────────────────────────────────────────────
  if (!imagePreview) {
    return (
      <div className="uploader-section">
        <div
          className={`drop-zone ${dragging ? "dragging" : ""}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current.click()}
        >
          <div className="drop-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0
                   0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
                strokeLinecap="round" strokeLinejoin="round"
              />
            </svg>
          </div>
          <p className="drop-title">Drop your plant image here</p>
          <p className="drop-sub">or click to browse — JPG, JPEG, PNG accepted</p>
          <div className="drop-badge">📁 Upload Image</div>

          <input
            ref={inputRef}
            type="file"
            accept=".jpg,.jpeg,.png"
            hidden
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>
      </div>
    );
  }

  // ── Image selected — show preview ──────────────────────────────────────────
  return (
    <div className="uploader-section">
      <div className="preview-container">
        {/* Image preview */}
        <div className="preview-img-wrap">
          <img src={imagePreview} alt="Preview" className="preview-img" />
          <button
            className="preview-remove"
            onClick={() => onImageSelected(null, null)}
            title="Remove image"
          >
            ✕
          </button>
        </div>

        {/* File info */}
        <div className="file-meta">
          <span className="file-icon">🖼️</span>
          <div>
            <p className="file-name">{imageFile?.name}</p>
            <p className="file-size">
              {imageFile ? (imageFile.size / 1024).toFixed(1) + " KB" : ""}
            </p>
          </div>
        </div>

        {/* Analyze button */}
        <button
          className="analyze-btn"
          onClick={onAnalyze}
          disabled={loading}
        >
          {loading ? "⏳ Analyzing..." : "🔬 Analyze Image"}
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;
