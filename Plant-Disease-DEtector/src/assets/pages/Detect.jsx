import { useState } from "react";
import { useApp } from "../../context/AppContext";
import { detectDisease } from "../../services/api";
import ImageUploader   from "../components/ImageUploader";
import LoadingSpinner  from "../components/LoadingSpinner";
import AnnotatedImage  from "../components/AnnotatedImage";
import ResultCard      from "../components/ResultCard";
import DiseaseInfo     from "../components/DiseaseInfo";

const Detect = () => {
  const { addToHistory } = useApp();

  const [imageFile,    setImageFile]    = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading,      setLoading]      = useState(false);
  const [result,       setResult]       = useState(null);
  const [error,        setError]        = useState(null);

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
        id:      Date.now(),
        image:   imagePreview,
        disease: data.disease,
        date:    new Date().toLocaleDateString("en-PK"),
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
      <div className="page-header" style={{ justifyContent: "center" }}>
        <div style={{ textAlign: "center", width: "100%" }}>
          <h2 className="page-title">Disease Detection</h2>
          <p className="page-sub">Upload a plant image to get an instant AI-powered diagnosis</p>
        </div>
      </div>

      {error && <div className="error-banner">⚠️ {error}</div>}

      <div className="detect-layout" style={{ justifyContent: "center", maxWidth: "1000px", margin: "0 auto" }}>
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
            <AnnotatedImage imagePreview={imagePreview} annotations={result.annotations} />
          )}
        </div>

        {result && !loading && (
          <div className="detect-right">
            <ResultCard  disease={result.disease} />
            <DiseaseInfo info={result.info}       />
          </div>
        )}
      </div>
    </div>
  );
};

export default Detect;
