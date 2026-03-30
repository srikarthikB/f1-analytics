import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import Dashboard from "./Dashboard.jsx";
import Drivers from "./drivers.jsx";
import DriverDetail from "./DriverDetail.jsx";
import Teams from "./Teams.jsx";
import TeamDetail from "./TeamDetail.jsx";
import Standings from "./Standings.jsx";
import RaceExplorer from "./RaceExplorer.jsx";
import DriverComparision from "./DriverComparision.jsx";
import StrategySimulator from "./StrategySimulator.jsx";
import RaceDetail from "./RaceDetail";
import StintAnalysis from "./StintAnalysis.jsx";
import FantasyMode from "./Fantasymode.jsx";
import AboutDev from "./AboutDev.jsx";

function App() {
  return (
    <BrowserRouter>
      {/* Single global Navbar — do NOT add <Navbar /> inside any page component */}
      <Navbar />
      <main style={{ padding: 0 }}>
        <Routes>
          <Route path="/"                      element={<Dashboard />} />
          <Route path="/drivers"               element={<Drivers />} />
          <Route path="/driver/:id"            element={<DriverDetail />} />
          <Route path="/teams"                 element={<Teams />} />
          <Route path="/team/:id"              element={<TeamDetail />} />
          <Route path="/standings"             element={<Standings />} />
          <Route path="/standings/:year"       element={<Standings />} />
          <Route path="/races"                 element={<RaceExplorer />} />
          <Route path="/race/:session_key"     element={<RaceDetail />} />
          <Route path="/compare"               element={<DriverComparision />} />
          <Route path="/strategy-simulator"    element={<StrategySimulator />} />
          <Route path="/stints/:session_key"   element={<StintAnalysis />} />
          <Route path="/fantasy"               element={<FantasyMode />} />
          <Route path="/about"             element={<AboutDev />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}

export default App;