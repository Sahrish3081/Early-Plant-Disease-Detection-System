const DiseaseInfo = ({ info }) => {
  const [open, setOpen] = useState({ description: true, causes: false, treatment: false, prevention: false });
  const toggle = (k) => setOpen((prev) => ({ ...prev, [k]: !prev[k] }));

  const sections = [
    { key: "description", title: "📋 Description", content: <p className="accordion-text">{info.description}</p> },
    { key: "causes", title: "⚠️ Causes", content: <ul className="accordion-list">{info.causes.map((c, i) => <li key={i}>{c}</li>)}</ul> },
    { key: "treatment", title: "💊 Treatment", content: <ul className="accordion-list treatment">{info.treatment.map((t, i) => <li key={i}>{t}</li>)}</ul> },
    { key: "prevention", title: "🛡️ Prevention", content: <ul className="accordion-list prevention">{info.prevention.map((p, i) => <li key={i}>{p}</li>)}</ul> },
  ];

  return (
    <div className="disease-info fade-in">
      <h3 className="info-title">Disease Information</h3>
      {sections.map(({ key, title, content }) => (
        <div key={key} className={`accordion ${open[key] ? "open" : ""}`}>
          <button className="accordion-header" onClick={() => toggle(key)}>
            <span>{title}</span>
            <span className="accordion-arrow">{open[key] ? "▲" : "▼"}</span>
          </button>
          {open[key] && <div className="accordion-body">{content}</div>}
        </div>
      ))}
    </div>
  );
};
export default DiseaseInfo
