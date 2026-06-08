const About = () => {
  const plants = ["🍅 Tomato", "🥔 Potato", "🌽 Corn", "🍇 Grape", "🍎 Apple", "🌾 Wheat", "🫑 Pepper", "🥬 Lettuce", "🫘 Soybean", "🌿 Mint"];
  const tech = [
    { name: "React.js", desc: "Frontend UI framework", icon: "⚛️" },
    { name: "Node.js", desc: "Backend runtime", icon: "🟢" },
    { name: "Express.js", desc: "REST API server", icon: "🚀" },
    { name: "Canvas API", desc: "Image annotation", icon: "🎨" },
    { name: "Python / Flask", desc: "ML model serving", icon: "🐍" },
    { name: "Deep Learning", desc: "Disease classification", icon: "🧠" },
  ];

  return (
    <div className="page about-page">
      <div className="page-header">
        <h2 className="page-title">About PhytoScan</h2>
        <p className="page-sub">AI-powered early plant disease detection system</p>
      </div>

      <div className="about-grid">
        <div className="about-card">
          <h3 className="about-card-title">🎓 Final Year Project</h3>
          <p className="about-text">
            PhytoScan is developed as a Final Year Project focused on applying computer vision and deep learning to solve real agricultural challenges. The system enables farmers and researchers to detect plant diseases early — before they spread and cause major crop loss.
          </p>
          <p className="about-text">
            By simply uploading a photo of an affected plant, users receive an instant AI diagnosis with annotated disease regions, confidence scores, and actionable treatment advice.
          </p>
        </div>

        <div className="about-card">
          <h3 className="about-card-title">🛠️ Technology Stack</h3>
          <div className="tech-grid">
            {tech.map((t) => (
              <div key={t.name} className="tech-item">
                <span className="tech-icon">{t.icon}</span>
                <div>
                  <p className="tech-name">{t.name}</p>
                  <p className="tech-desc">{t.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="about-card">
          <h3 className="about-card-title">🌿 Supported Plants</h3>
          <div className="plants-grid">
            {plants.map((p) => (
              <span key={p} className="plant-tag">{p}</span>
            ))}
          </div>
        </div>

        <div className="about-card">
          <h3 className="about-card-title">⚙️ How the Model Works</h3>
          <div className="model-steps">
            {[
              ["1", "Image Preprocessing", "Resize, normalize, and augment the input image"],
              ["2", "CNN Feature Extraction", "Deep convolutional layers extract disease patterns"],
              ["3", "Classification", "Softmax layer identifies disease type with confidence"],
              ["4", "Localization", "Bounding box regression marks affected regions"],
            ].map(([n, title, desc]) => (
              <div key={n} className="model-step">
                <span className="model-step-num">{n}</span>
                <div>
                  <p className="model-step-title">{title}</p>
                  <p className="model-step-desc">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
export default About