import { createContext, useContext, useState } from "react";

export const AppContext = createContext();

export const useApp = () => useContext(AppContext);

export const AppProvider = ({ children }) => {
  const [history, setHistory] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("phytoscan_history") || "[]");
    } catch {
      return [];
    }
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
      {children}
    </AppContext.Provider>
  );
};
