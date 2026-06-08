import { useState } from "react";

const AccordionItem = ({ title, open, onToggle, children }) => (
  <div className={`accordion ${open ? "open" : ""}`}>
    <button className="accordion-header" onClick={onToggle}>
      <span>{title}</span>
      <span className="accordion-arrow">{open ? "▲" : "▼"}</span>
    </button>
    {open && <div className="accordion-body">{children}</div>}
  </div>
);

const DiseaseInfo = ({ info }) => {
  const [open, setOpen] = useState({ description: true, causes: false, treatment: false, prevention: false });
  const toggle = (key) => setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="disease-info fade-in">
      <h3 className="info-title">Disease Information</h3>

      <AccordionItem title="📋 Description" open={open.description} onToggle={() => toggle("description")}>
        <p className="accordion-text">{info.description}</p>
      </AccordionItem>

      <AccordionItem title="⚠️ Causes" open={open.causes} onToggle={() => toggle("causes")}>
        <ul className="accordion-list">
          {info.causes.map((c, i) => <li key={i}>{c}</li>)}
        </ul>
      </AccordionItem>

      <AccordionItem title="💊 Treatment" open={open.treatment} onToggle={() => toggle("treatment")}>
        <ul className="accordion-list treatment">
          {info.treatment.map((t, i) => <li key={i}>{t}</li>)}
        </ul>
      </AccordionItem>

      <AccordionItem title="🛡️ Prevention" open={open.prevention} onToggle={() => toggle("prevention")}>
        <ul className="accordion-list prevention">
          {info.prevention.map((p, i) => <li key={i}>{p}</li>)}
        </ul>
      </AccordionItem>
    </div>
  );
};

export default DiseaseInfo;
