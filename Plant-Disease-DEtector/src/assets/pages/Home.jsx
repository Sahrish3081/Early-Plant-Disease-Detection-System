const Home = ({ setPage }) => {
  const stats = [
    { val: "50+", label: "Disease Types" },
    { val: "30+", label: "Plant Species" },
    { val: "95%", label: "Accuracy Rate" },
    { val: "2s", label: "Avg. Detection Time" },
  ];
  const steps = [
    { icon: "📷", title: "Upload Image", desc: "Take or upload a clear photo of the affected plant leaf or stem." },
    { icon: "🔬", title: "AI Analyzes", desc: "Our model scans for disease patterns, spots, and discoloration." },
    { icon: "📋", title: "Get Diagnosis", desc: "Receive a detailed report with treatment and prevention tips." },
  ];

  return (
    <div className="page home-page">
      <LeafBg />
      <section className="hero">
        <div className="hero-content">
          <div className="hero-badge">🌱 AI-Powered Plant Pathology</div>
          <h1 className="hero-title">
            Detect Plant Disease<br />
            <span className="hero-accent">Before It Spreads</span>
          </h1>
          <p className="hero-sub">
            Upload a photo of your plant and get an instant AI diagnosis with annotated disease spots, severity analysis, and expert treatment recommendations.
          </p>
          <div className="hero-actions">
            <button className="cta-btn" onClick={() => setPage("Detect")}>
              🔍 Start Detection
            </button>
            <button className="cta-btn-outline" onClick={() => setPage("About")}>
              Learn More
            </button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card-float">
            <div className="scan-animation">
              <div className="scan-frame">
                <svg viewBox="0 0 200 200" className="scan-svg">
                  <rect x="10" y="10" width="180" height="180" rx="12" fill="#1b4332" opacity="0.5"/>
                  <text x="100" y="95" textAnchor="middle" fill="#52b788" fontSize="60">🌿</text>
                  <text x="100" y="130" textAnchor="middle" fill="#95d5b2" fontSize="13">Scanning...</text>
                  <rect x="10" y="10" width="180" height="180" rx="12" fill="none" stroke="#52b788" strokeWidth="2" strokeDasharray="20 10">
                    <animateTransform attributeName="transform" type="rotate" from="0 100 100" to="360 100 100" dur="8s" repeatCount="indefinite"/>
                  </rect>
                  <line x1="10" y1="100" x2="190" y2="100" stroke="#52b788" strokeWidth="1.5" opacity="0.7">
                    <animate attributeName="y1" values="10;190;10" dur="2s" repeatCount="indefinite"/>
                    <animate attributeName="y2" values="10;190;10" dur="2s" repeatCount="indefinite"/>
                  </line>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats-section">
        {stats.map((s, i) => (
          <div key={i} className="stat-card" style={{ animationDelay: `${i * 0.1}s` }}>
            <span className="stat-val">{s.val}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      <section className="how-section">
        <h2 className="section-title">How It Works</h2>
        <p className="section-sub">Three simple steps to diagnose your plant</p>
        <div className="steps-grid">
          {steps.map((s, i) => (
            <div key={i} className="step-card" style={{ animationDelay: `${i * 0.15}s` }}>
              <div className="step-num">{i + 1}</div>
              <div className="step-icon">{s.icon}</div>
              <h3 className="step-title">{s.title}</h3>
              <p className="step-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
export default Home
