const AnnotatedImage = ({ imagePreview, annotations }) => {
  const canvasRef = useRef();
  const imgRef = useRef();
  const [loaded, setLoaded] = useState(false);

  const drawAnnotations = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const rect = img.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const scaleX = rect.width / img.naturalWidth;
    const scaleY = rect.height / img.naturalHeight;

    annotations.forEach(({ x, y, width, height, confidence, label }) => {
      const sx = x * scaleX;
      const sy = y * scaleY;
      const sw = width * scaleX;
      const sh = height * scaleY;

      const color = confidence > 0.85 ? "#ef4444" : confidence > 0.7 ? "#f59e0b" : "#22c55e";
      const bg = confidence > 0.85 ? "rgba(239,68,68,0.15)" : confidence > 0.7 ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.15)";

      ctx.fillStyle = bg;
      ctx.fillRect(sx, sy, sw, sh);

      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.strokeRect(sx, sy, sw, sh);

      // Corner accents
      const cSize = 8;
      ctx.lineWidth = 3;
      [[sx, sy], [sx + sw, sy], [sx, sy + sh], [sx + sw, sy + sh]].forEach(([cx, cy], i) => {
        ctx.beginPath();
        if (i === 0) { ctx.moveTo(cx, cy + cSize); ctx.lineTo(cx, cy); ctx.lineTo(cx + cSize, cy); }
        if (i === 1) { ctx.moveTo(cx - cSize, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy + cSize); }
        if (i === 2) { ctx.moveTo(cx, cy - cSize); ctx.lineTo(cx, cy); ctx.lineTo(cx + cSize, cy); }
        if (i === 3) { ctx.moveTo(cx - cSize, cy); ctx.lineTo(cx, cy); ctx.lineTo(cx, cy - cSize); }
        ctx.strokeStyle = color;
        ctx.stroke();
      });

      // Label
      ctx.font = "bold 11px DM Sans, sans-serif";
      const textW = ctx.measureText(`${label} ${(confidence * 100).toFixed(0)}%`).width + 10;
      ctx.fillStyle = color;
      ctx.fillRect(sx, sy - 22, textW, 20);
      ctx.fillStyle = "#fff";
      ctx.fillText(`${label} ${(confidence * 100).toFixed(0)}%`, sx + 5, sy - 7);
    });
  }, [annotations]);

  useEffect(() => {
    if (loaded) drawAnnotations();
  }, [loaded, drawAnnotations]);

  useEffect(() => {
    window.addEventListener("resize", drawAnnotations);
    return () => window.removeEventListener("resize", drawAnnotations);
  }, [drawAnnotations]);

  return (
    <div className="annotated-wrap">
      <div className="annotated-img-container">
        <img
          ref={imgRef}
          src={imagePreview}
          alt="Analyzed plant"
          className="annotated-img"
          onLoad={() => { setLoaded(true); setTimeout(drawAnnotations, 100); }}
        />
        <canvas ref={canvasRef} className="annotation-canvas" />
      </div>
      <div className="annotation-legend">
        {[["#ef4444", "High Confidence (>85%)"], ["#f59e0b", "Moderate (70–85%)"], ["#22c55e", "Low (<70%)"]].map(([c, l]) => (
          <span key={l} className="legend-item">
            <span className="legend-dot" style={{ background: c }} />{l}
          </span>
        ))}
      </div>
    </div>
  );
};
export default AnnotatedImage