import { useState } from "react";
import { AppProvider } from "./context/AppContext";

// Components
import Navbar  from "./assets/components/Navbar";
import Footer  from "./assets/components/Footer";

// Pages
import Home    from "./assets/pages/Home";
import Detect  from "./assets/pages/Detect";
import History from "./assets/pages/History";
import About   from "./assets/pages/About";

// Global styles
import "./styles/global.css";

export default function App() {
  const [page, setPage] = useState("Home");

  return (
    <AppProvider>
      <div className="app">
        <Navbar page={page} setPage={setPage} />

        <main className="main-content">
          {page === "Home"    && <Home    setPage={setPage} />}
          {page === "Detect"  && <Detect  />}
          {page === "History" && <History />}
          {page === "About"   && <About   />}
        </main>

        <Footer />
      </div>
    </AppProvider>
  );
}
