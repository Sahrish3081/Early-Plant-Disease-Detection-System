import { useState, useEffect } from "react";

const messages = [
  "Scanning leaf cells...",
  "Identifying patterns...",
  "Analyzing chlorophyll density...",
  "Mapping affected regions...",
  "Cross-referencing disease database...",
  "Generating diagnosis...",
];

const LoadingSpinner = () => {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const iv = setInterval(
      () => setMsgIdx((i) => (i + 1) % messages.length),
      1200
    );
    return () => clearInterval(iv);
  }, []);

  return (
    <div className="loading-container">
      <div className="spinner-ring">
        <span className="spinner-leaf">🌿</span>
        <svg className="spinner-svg" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#52b788"
            strokeWidth="3" strokeDasharray="70 210" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate"
              from="0 50 50" to="360 50 50" dur="1.5s" repeatCount="indefinite" />
          </circle>
          <circle cx="50" cy="50" r="35" fill="none" stroke="#2d6a4f"
            strokeWidth="2" strokeDasharray="40 180" strokeLinecap="round">
            <animateTransform attributeName="transform" type="rotate"
              from="360 50 50" to="0 50 50" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>

      <p className="loading-msg">{messages[msgIdx]}</p>

      <div className="loading-dots">
        <span /><span /><span />
      </div>
    </div>
  );
};

export default LoadingSpinner;
