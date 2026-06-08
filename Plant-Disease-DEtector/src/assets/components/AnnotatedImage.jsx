import { useRef, useState, useEffect, useCallback } from "react";

const AnnotatedImage = ({ imagePreview, annotations }) => {
  const canvasRef = useRef();
  const imgRef   = useRef();
  const [loaded, setLoaded] = useState(false);

  const drawAnnotations = useCallback(() => {
    const canvas = canvasRef.current;
    const img    = imgRef.current;
    if (!canvas || !img) return;

    const rect = img.getBoundingClientRect();
    canvas.width  = rect.width;
    canvas.height = rect.height;

    const ctx    = canvas.getContext("2d");
    const scaleX = rect.width  / img.naturalWidth;
    const scaleY = rect.height / img.naturalHeight;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    annotations.forEach(({ x, y, width, height, confidence, label }) => {
      const sx = x * scaleX;
      const sy = y * scaleY;
      const sw = width  * scaleX;
      const sh = height * scaleY;

      // Color by confidence
      const color =
        confidence > 0.85 ? "#ef4444" :
        confidence > 0.70 ? "#f59e0b" : "#22c55e";
      const bg =
        confidence > 0.85 ? "rgba(239,68,68,0.15)"  :
        confidence > 0.70 ? "rgba(245,158,11,0.15)" : "rgba(34,197,94,0.15)";

      // Filled background
      ctx.fillStyle = bg;
      ctx.fillRect(sx, sy, sw, sh);

      // Outer border
      ctx.strokeStyle = color;
      ctx.lineWidth   = 2.5;
      ctx.strokeRect(sx, sy, sw, sh);

      // Corner accents
      const cs = 8;
      ctx.lineWidth   = 3;
      ctx.strokeStyle = color;
      [
        [sx,      sy,      cs,  0, 0,  cs ],
        [sx + sw, sy,      -cs, 0, 0,  cs ],
        [sx,      sy + sh, cs,  0, 0, -cs ],
        [sx + sw, sy + sh, -cs, 0, 0, -cs ],
      ].forEach(([px, py, dx1, dy1, dx2, dy2]) => {
        ctx.beginPath();
        ctx.moveTo(px + dx1, py + dy1);
        ctx.lineTo(px,       py      );
        ctx.lineTo(px + dx2, py + dy2);
        ctx.stroke();
      });

      // Label pill
      ctx.font = "bold 11px 'DM Sans', sans-serif";
      const labelText = `${label} ${(confidence * 100).toFixed(0)}%`;
      const textW = ctx.measureText(labelText).width + 12;

      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(sx, sy - 22, textW, 20, 4);
      ctx.fill();

      ctx.fillStyle = "#fff";
      ctx.fillText(labelText, sx + 6, sy - 7);
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
      <h4 className="annotated-title">🗺️ Annotated Disease Map</h4>

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

      {/* Legend */}
      <div className="annotation-legend">
        {[
          ["#ef4444", "High (>85%)"],
          ["#f59e0b", "Moderate (70–85%)"],
          ["#22c55e", "Low (<70%)"],
        ].map(([color, label]) => (
          <span key={label} className="legend-item">
            <span className="legend-dot" style={{ background: color }} />
            {label}
          </span>
        ))}
      </div>
    </div>
  );
};

export default AnnotatedImage;
