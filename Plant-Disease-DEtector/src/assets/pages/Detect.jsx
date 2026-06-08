const Detect = () => {
  const { addToHistory } = useApp();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleImageSelected = (file, preview) => {
    setImageFile(file);
    setImagePreview(preview);
    setResult(null);
  };

  const handleAnalyze = async () => {
    if (!imageFile) return;
    setLoading(true);
    setResult(null);
    try {
      const data = await mockDetect();
      setResult(data);
      addToHistory({ id: Date.now(), image: imagePreview, disease: data.disease, date: new Date().toLocaleDateString() });
    } catch (e) {
      alert("Analysis failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page detect-page">
      <div className="page-header">
        <h2 className="page-title">Disease Detection</h2>
        <p className="page-sub">Upload a plant image to get an instant AI-powered diagnosis</p>
      </div>

      <div className="detect-layout">
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
            <ResultCard disease={result.disease} />
            <DiseaseInfo info={result.info} />
          </div>
        )}
      </div>
    </div>
  );
};
export default Detect