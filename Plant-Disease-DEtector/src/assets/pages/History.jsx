const History = () => {
  const { history, clearHistory } = useApp();
  const severityColor = { High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e" };

  return (
    <div className="page history-page">
      <div className="page-header">
        <div>
          <h2 className="page-title">Detection History</h2>
          <p className="page-sub">Your past plant disease analyses</p>
        </div>
        {history.length > 0 && (
          <button className="clear-btn" onClick={clearHistory}>Clear History</button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🌱</span>
          <p>No detections yet. Upload a plant image to get started!</p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((item) => (
            <div key={item.id} className="history-card fade-in">
              <div className="history-thumb-wrap">
                <img src={item.image} alt="Plant" className="history-thumb" />
                <span className="history-severity" style={{ background: severityColor[item.disease.severity] }}>
                  {item.disease.severity}
                </span>
              </div>
              <div className="history-info">
                <h4 className="history-disease">{item.disease.name}</h4>
                <p className="history-sci">{item.disease.scientificName}</p>
                <div className="history-meta">
                  <span className="history-conf">🎯 {item.disease.confidence}% confidence</span>
                  <span className="history-date">📅 {item.date}</span>
                </div>
                <div className="history-area">
                  <span>Affected: </span>
                  <div className="mini-bar-track">
                    <div className="mini-bar-fill" style={{ width: `${item.disease.affectedAreaPercent}%` }} />
                  </div>
                  <span>{item.disease.affectedAreaPercent}%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default History