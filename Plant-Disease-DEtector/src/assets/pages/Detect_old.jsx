import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { detectDisease } from "../../services/api";
import ImageUploader from "../components/ImageUploader";
import LoadingSpinner from "../components/LoadingSpinner";
import AnnotatedImage from "../components/AnnotatedImage";
import ResultCard from "../components/ResultCard";
import DiseaseInfo from "../components/DiseaseInfo";

const Detect = () => {
  const { addToHistory } = useApp();

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleImageSelected = (file, preview) => {
    setImageFile(file);
    setImagePreview(preview);
    setResult(null);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await detectDisease(imageFile);
      setResult(data);
      addToHistory({
        id: Date.now(),
        image: imagePreview,
        disease: data.disease,
        date: new Date().toLocaleDateString("en-PK"),
      });
    } catch (err) {
      setError("Analysis failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page detect-page">

      {/* Header */}
      <div className="page-header" style={{ justifyContent: "center" }}>
        <div style={{ textAlign: "center", width: "100%" }}>
          <h2 className="page-title">Disease Detection</h2>
          <p className="page-sub">Upload a plant image to get an instant  diagnosis</p>
        </div>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <div className="detect-layout">

        {/* Left — Upload + Annotated Image */}
        <div className="detect-left">
          <ImageUploader
            onImageSelected={handleImageSelected}
            onAnalyze={handleAnalyze}
            imageFile={imageFile}
            imagePreview={imagePreview}
            loading={loading}
          />

          {loading && <LoadingSpinner />}

          {result && !loading && (
            <AnnotatedImage
              /* 
                annotatedImage → Flask model ki base64 image (blue spots already drawn)
                imagePreview   → original image fallback (mock mode)
                annotations    → canvas drawing ke liye (mock mode)
              */
              imagePreview={result.annotatedImage || imagePreview}
              annotations={result.annotatedImage ? [] : result.annotations}
            />
          )}
        </div>

        {/* Right — Results */}
        {result && !loading && (
          <div className="detect-right">

            {/* Crop + Disease Name Card */}
            <div className="crop-info-card">
              <div className="crop-info-row">
                <span className="crop-label">🌿 Crop </span>
                <span className="crop-value">{result.cropName}</span>
              </div>
              <div className="crop-info-row">
                <span className="crop-label">🦠 Disease </span>
                <span className="crop-value">{result.disease?.name}</span>
              </div>
            </div>

            <ResultCard disease={result.disease} />
            <DiseaseInfo info={result.info} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Detect;
