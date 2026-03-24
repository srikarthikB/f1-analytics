import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ padding: "10px 20px", borderBottom: "1px solid #ccc", display: "flex", gap: "20px" }}>
      <Link to="/drivers">Drivers</Link>
      <Link to="/teams">Teams</Link>
      <Link to="/standings">Standings</Link>
      <Link to="/races">Races</Link>
      <Link to="/compare">Compare</Link>
      <Link to="/strategy-simulator">Strategy</Link>
      <Link to="/fantasy">Fantasy</Link>
    </nav>
  );
}

export default Navbar;