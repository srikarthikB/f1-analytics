import { BrowserRouter, Routes, Route } from "react-router-dom";
import Drivers from "./drivers.jsx";
import DriverDetail from "./DriverDetail.jsx";
import Teams from "./Teams.jsx";
import TeamDetail from "./TeamDetail.jsx";
import Standings from "./Standings.jsx";
import RaceExplorer from "./RaceExplorer.jsx";
import DriverComparision from "./DriverComparision.jsx";
import StrategySimulator from "./StrategySimulator.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Drivers />} />
        <Route path="/drivers" element={<Drivers />} />
        <Route path="/driver/:id" element={<DriverDetail />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/team/:id" element={<TeamDetail />} />
        <Route path="/standings/drivers" element={<Standings />} />
        <Route path="/standings/constructors" element={<Standings />} />
        <Route path="/races" element={<RaceExplorer />} />
        <Route path="/races/:year" element={<RaceExplorer />} />
        <Route path="/compare" element={<DriverComparision />} />
        <Route path="/strategy-simulator" element={<StrategySimulator />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;