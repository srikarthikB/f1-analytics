import { AnimatePresence, motion } from "framer-motion";
import { useLocation, BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Drivers from "./drivers.jsx";
import DriverDetail from "./DriverDetail.jsx";
import Teams from "./Teams.jsx";
import TeamDetail from "./TeamDetail.jsx";
import Standings from "./Standings.jsx";
import RaceExplorer from "./RaceExplorer.jsx";
import DriverComparision from "./DriverComparision.jsx";
import StrategySimulator from "./StrategySimulator.jsx";

function AppShell() {
  const location = useLocation();

  return (
    <div className="min-h-screen text-white bg-[#07070f] relative">
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-48 -left-32 w-[700px] h-[600px] rounded-full bg-red-800/[0.06] blur-[130px]" />
        <div className="absolute top-1/3 -right-48 w-[600px] h-[500px] rounded-full bg-red-900/[0.04] blur-[110px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-zinc-900/40 blur-[90px]" />
      </div>
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />
      <div className="relative z-10">
        <Navbar />
        <main>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <Routes location={location}>
                <Route path="/"                       element={<Drivers />}           />
                <Route path="/drivers"                element={<Drivers />}           />
                <Route path="/driver/:id"             element={<DriverDetail />}      />
                <Route path="/teams"                  element={<Teams />}             />
                <Route path="/team/:id"               element={<TeamDetail />}        />
                <Route path="/standings/drivers"      element={<Standings />}         />
                <Route path="/standings/constructors" element={<Standings />}         />
                <Route path="/races"                  element={<RaceExplorer />}      />
                <Route path="/races/:year"            element={<RaceExplorer />}      />
                <Route path="/compare"                element={<DriverComparision />} />
                <Route path="/strategy-simulator"     element={<StrategySimulator />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}

export default App;