const ResultCard = ({ disease }) => {
  const severityColor = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };

  return (
    <div className="result-card fade-in">
      <div className="result-header">
        <div>
          <h3 className="disease-name">{disease.name}</h3>
          <p className="disease-sci">{disease.scientificName}</p>
        </div>
        <span className="severity-badge" style={{ background: severityColor[disease.severity] + "22", color: severityColor[disease.severity], border: `1px solid ${severityColor[disease.severity]}44` }}>
          {disease.severity} Severity
        </span>
      </div>

      <div className="result-metrics">
        <div className="metric">
          <p className="metric-label">Confidence</p>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${disease.confidence}%`, background: `linear-gradient(90deg, #2d6a4f, #52b788)` }} />
          </div>
          <p className="metric-value">{disease.confidence}%</p>
        </div>
        <div className="metric">
          <p className="metric-label">Affected Area</p>
          <div className="progress-bar-track">
            <div className="progress-bar-fill" style={{ width: `${disease.affectedAreaPercent}%`, background: `linear-gradient(90deg, #ef4444, #f59e0b)` }} />
          </div>
          <p className="metric-value">{disease.affectedAreaPercent}%</p>
        </div>
      </div>
    </div>
  );
};
export default ResultCard