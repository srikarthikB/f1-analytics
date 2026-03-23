import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "./config";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/drivers`)
      .then(res => res.json())
      .then(data => {
        setDrivers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading drivers...</p>;
  if (error)   return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Drivers ({drivers.length})</h1>
      <ul>
        {drivers.map(driver => (
          <li key={driver.driver_number} style={{ marginBottom: "6px" }}>
            <button onClick={() => navigate(`/driver/${driver.driver_number}`)}>
              #{driver.driver_number} — {driver.full_name} ({driver.team_name})
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Drivers;