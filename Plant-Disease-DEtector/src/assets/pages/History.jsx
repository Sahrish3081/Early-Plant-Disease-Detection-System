import { useApp } from "../../context/AppContext";

const severityColor = {
  High:   "#ef4444",
  Medium: "#f59e0b",
  Low:    "#22c55e",
};

const History = () => {
  const { history, clearHistory } = useApp();

  return (
    <div className="page history-page">
      <div className="page-header">
        <div style={{ textAlign: "center", width: "100%" }}>
          <h2 className="page-title ">Detection History</h2>
          <p className="page-sub">Your past plant disease analyses</p>
        </div>
        {history.length > 0 && (
          <button className="clear-btn" onClick={clearHistory}>🗑️ Clear History</button>
        )}
      </div>

      {history.length === 0 ? (
        <div className="empty-state">
          <span className="empty-icon">🌱</span>
          <p>No detections yet. Upload a plant image to get started!</p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((item) => {
            const color = severityColor[item.disease?.severity] || "#6b7280";
            return (
              <div key={item.id} className="history-card fade-in">
                <div className="history-thumb-wrap">
                  <img src={item.image} alt="Plant" className="history-thumb"/>
                  <span className="history-severity" style={{ background: color }}>
                    {item.disease?.severity}
                  </span>
                </div>
                <div className="history-info">
                  <h4 className="history-disease">{item.disease?.name}</h4>
                  <p className="history-sci">{item.disease?.scientificName}</p>
                  <div className="history-meta">
                    <span className="history-conf">🎯 {item.disease?.confidence}% confidence</span>
                    <span className="history-date">📅 {item.date}</span>
                  </div>
                  <div className="history-area">
                    <span>Affected: </span>
                    <div className="mini-bar-track">
                      <div className="mini-bar-fill" style={{ width: `${item.disease?.affectedAreaPercent}%` }}/>
                    </div>
                    <span>{item.disease?.affectedAreaPercent}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
