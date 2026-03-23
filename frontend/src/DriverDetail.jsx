import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API_BASE from "./config";

function DriverDetail() {
  const { id } = useParams();

  const [driver, setDriver]           = useState(null);
  const [performance, setPerformance] = useState([]);
  const [sessions, setSessions]       = useState([]);
  const [years, setYears]             = useState([]);
  const [selectedYear, setSelectedYear]       = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionKey, setSessionKey]           = useState(null);
  const [laps, setLaps]               = useState([]);
  const [consistency, setConsistency] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [lapsLoading, setLapsLoading] = useState(false);
  const [error, setError]             = useState(null);

  // ✅ Fetch driver info + set session_key (PRIMARY SOURCE)
  useEffect(() => {
    fetch(`${API_BASE}/drivers/${id}`)
      .then(res => res.json())
      .then(data => {
        if (!data.error) {
          setDriver(data);
          setSessionKey(data.session_key); // ✅ MAIN FIX
        } else {
          setDriver(null);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  // Fetch career performance
  useEffect(() => {
    fetch(`${API_BASE}/drivers/${id}/performance`)
      .then(res => res.json())
      .then(data => setPerformance(Array.isArray(data) ? data : []));
  }, [id]);

  // Fetch sessions list (ONLY for dropdown)
  useEffect(() => {
    fetch(`${API_BASE}/sessions`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;

        setSessions(data);

        const uniqueYears = [...new Set(data.map(s => s.year))]
          .sort((a, b) => b - a);

        setYears(uniqueYears);
      });
  }, []);

  // ✅ Only override sessionKey when user selects manually
  useEffect(() => {
    if (selectedSession?.session_key) {
      setSessionKey(selectedSession.session_key);
    }
  }, [selectedSession]);

  // Fetch laps + consistency
  useEffect(() => {
    if (!sessionKey) return;

    setLapsLoading(true);

    Promise.all([
      fetch(`${API_BASE}/laps?session_key=${sessionKey}&driver_number=${id}`)
        .then(r => r.json()),
      fetch(`${API_BASE}/consistency?session_key=${sessionKey}&driver_number=${id}`)
        .then(r => r.json()),
    ])
      .then(([lapsData, consData]) => {
        setLaps(Array.isArray(lapsData) ? lapsData : []);
        setConsistency(
          consData && typeof consData === "object" ? consData : null
        );
        setLapsLoading(false);
      })
      .catch(() => setLapsLoading(false));
  }, [sessionKey, id]);

  const raceSessions = sessions.filter(
    s => String(s.year) === String(selectedYear)
  );

  if (loading || !sessionKey) return <p>Loading driver...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!driver) return <p>Driver not found.</p>;

  return (
    <div>
      <h1>{driver.full_name}</h1>
      <p>Team: {driver.team_name}</p>
      <p>Number: #{driver.driver_number}</p>
      <p>Points: {driver.points ?? "—"}</p>

      <hr />

      <h2>Career Performance</h2>
      {performance.length === 0 ? (
        <p>No career data.</p>
      ) : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Year</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {performance.map(p => (
              <tr key={p.year}>
                <td>{p.year}</td>
                <td>{p.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <hr />

      <h2>Lap Times</h2>

      {/* Dropdown */}
      <div style={{ marginBottom: "10px" }}>
        <label>Year: </label>
        <select
          value={selectedYear}
          onChange={e => {
            setSelectedYear(e.target.value);
            setSelectedSession(null);
            setLaps([]);
          }}
        >
          <option value="">Select year</option>
          {years.map(y => (
            <option key={y} value={y}>
              {y}
            </option>
          ))}
        </select>

        <label style={{ marginLeft: "10px" }}>Race: </label>
        <select
          disabled={!selectedYear || raceSessions.length === 0}
          value={selectedSession?.session_key ?? ""}
          onChange={e => {
            const s = raceSessions.find(
              r => String(r.session_key) === e.target.value
            );
            setSelectedSession(s ?? null);
          }}
        >
          <option value="">Select race</option>
          {raceSessions.map(s => (
            <option key={s.session_key} value={s.session_key}>
              {s.circuit_short_name || s.country_name}
            </option>
          ))}
        </select>
      </div>

      {consistency && (
        <p>
          Consistency score: {consistency.consistency_score ?? "—"} |
          Avg lap: {consistency.avg_lap_time ?? "—"}s |
          Laps: {consistency.laps_count}
        </p>
      )}

      {lapsLoading ? (
        <p>Loading laps...</p>
      ) : laps.length === 0 ? (
        <p>No lap data for this session.</p>
      ) : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Lap</th>
              <th>Time (s)</th>
              <th>Pit Out</th>
            </tr>
          </thead>
          <tbody>
            {laps.map(l => (
              <tr key={l.lap}>
                <td>{l.lap}</td>
                <td>{l.time}</td>
                <td>{l.is_pit_out ? "Yes" : ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DriverDetail;