import { useState, useEffect,  createContext, useContext } from "react";
const Navbar = ({ page, setPage }) => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const links = ["Home", "Detect", "History", "About"];

  return (
    <nav className={`navbar ${scrolled ? "scrolled" : ""}`}>
      <div className="nav-brand" onClick={() => setPage("Home")}>
        <span className="nav-logo">🌿</span>
        <span className="nav-title">PhytoScan</span>
      </div>
      <div className={`nav-links ${menuOpen ? "open" : ""}`}>
        {links.map((l) => (
          <button
            key={l}
            className={`nav-link ${page === l ? "active" : ""}`}
            onClick={() => { setPage(l); setMenuOpen(false); }}
          >
            {l}
          </button>
        ))}
      </div>
      <button className="hamburger" onClick={() => setMenuOpen(!menuOpen)}>
        <span /><span /><span />
      </button>
    </nav>
  );
};
export default Navbar