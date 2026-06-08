
import { useState, useRef, useEffect, useCallback, createContext, useContext } from "react";

import './App.css'

export default function App() {
  const [page, setPage] = useState("Home");
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("phytoscan_history") || "[]"); } catch { return []; }
  });

  const addToHistory = (item) => {
    setHistory((prev) => {
      const next = [item, ...prev].slice(0, 20);
      localStorage.setItem("phytoscan_history", JSON.stringify(next));
      return next;
    });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("phytoscan_history");
  };

  return (
    <AppContext.Provider value={{ history, addToHistory, clearHistory }}>
      <style>{css}</style>
      <div className="app">
        <Navbar page={page} setPage={setPage} />
        <main className="main-content">
          {page === "Home" && <Home setPage={setPage} />}
          {page === "Detect" && <Detect />}
          {page === "History" && <History />}
          {page === "About" && <About />}
        </main>
        <Footer />
      </div>
    </AppContext.Provider>
  );
}
