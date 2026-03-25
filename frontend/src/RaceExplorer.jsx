import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "./config";

function RaceExplorer() {
  const [year, setYear] = useState("2024");
  const [years, setYears] = useState([]);
  const [races, setRaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [sessionsCache, setSessionsCache] = useState(null);

  const navigate = useNavigate();

  // Get available years dynamically
  useEffect(() => {
    fetch(`${API_BASE}/sessions`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;

        const uniqueYears = [...new Set(data.map(s => s.year))].sort((a, b) => b - a);
        setYears(uniqueYears.map(String));

        if (uniqueYears.length > 0) {
          setYear(String(uniqueYears[0]));
        }
      });
  }, []);

  // Fetch races
  useEffect(() => {
    if (!year) return;

    setLoading(true);
    setError(null);
    setRaces([]);

    fetch(`${API_BASE}/races/${year}`)
      .then(res => res.json())
      .then(data => {
        setRaces(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [year]);

  return (
    <div>
      <h1>Race Calendar</h1>

      {/* Year selector */}
      <div style={{ marginBottom: "12px" }}>
        {years.map(y => (
          <button
            key={y}
            onClick={() => setYear(y)}
            style={{
              marginRight: "8px",
              fontWeight: year === y ? "bold" : "normal"
            }}
          >
            {y}
          </button>
        ))}
      </div>

      {loading && <p>Loading races...</p>}
      {error && <p>Error: {error}</p>}

      {!loading && races.length === 0 && (
        <p>No races found for {year}.</p>
      )}

      {races.length > 0 && (
        <table border="1" cellPadding="8">
          <thead>
            <tr>
              <th>Round</th>
              <th>Name</th>
              <th>Circuit</th>
              <th>Location</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {races.map(race => (
              <tr
                key={race.session_key}
                onClick={() => navigate(`/race/${race.session_key}`)}
                style={{ cursor: "pointer" }}
              >
                <td>{race.round}</td>
                <td>{race.name}</td>
                <td>{race.circuit}</td>
                <td>{race.location}</td>
                <td>
                  {race.date
                    ? new Date(race.date).toLocaleDateString()
                    : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default RaceExplorer;