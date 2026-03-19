import { BrowserRouter, Routes, Route } from "react-router-dom";
import Drivers from "./drivers.jsx";
import DriverDetail from "./DriverDetail.jsx";
import Teams from "./Teams.jsx";
import TeamDetail from "./TeamDetail.jsx";
import Standings from "./Standings.jsx";

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
        {/* <Route path="/standings/constructors" element={<Standings />} /> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;