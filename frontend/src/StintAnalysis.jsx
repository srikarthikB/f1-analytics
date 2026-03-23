import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE from "./config";

function StintAnalysis() {
  const { session_key } = useParams();

  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");

  const [stints, setStints] = useState([]);
  const [summary, setSummary] = useState(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!session_key) return;

    fetch(`${API_BASE}/drivers?session_key=${session_key}`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;

        setDrivers(data);

        if (data.length > 0) {
          setSelectedDriver(data[0].driver_number);
        }
      });
  }, [session_key]);

  const fetchStints = () => {
    if (!session_key || !selectedDriver) return;

    setLoading(true);

    fetch(
      `${API_BASE}/stint-analysis?session_key=${session_key}&driver_number=${selectedDriver}`
    )
      .then(res => res.json())
      .then(data => {
        setStints(Array.isArray(data.stints) ? data.stints : []);
        setSummary(data.summary || null);
        setLoading(false);
      });
  };

  return (
    <div>
      <h1>Stint Analysis</h1>

      {/* Driver Dropdown */}
      <div style={{ marginBottom: "12px" }}>
        <label>Driver: </label>
        <select
          value={selectedDriver}
          onChange={(e) => setSelectedDriver(e.target.value)}
        >
          {drivers.map(d => (
            <option key={d.driver_number} value={d.driver_number}>
              {d.full_name}
            </option>
          ))}
        </select>
      </div>

      <button onClick={fetchStints}>Load Stints</button>

      {loading && <p>Loading...</p>}

      {/* 🔥 SUMMARY SECTION */}
      {!loading && summary && (
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <h2>Strategy Summary</h2>

          <p><strong>Strategy:</strong> {summary.strategy}</p>
          <p><strong>Total Laps:</strong> {summary.total_laps}</p>
          <p><strong>Stints:</strong> {summary.stint_count}</p>
          <p><strong>Pit Stops:</strong> {summary.pit_stops}</p>

          <h3>Tyre Usage</h3>
          <ul>
            {Object.entries(summary.tyre_usage || {}).map(([tyre, laps]) => (
              <li key={tyre}>
                {tyre}: {laps} laps
              </li>
            ))}
          </ul>

          <p>
            <strong>Longest Stint:</strong>{" "}
            {summary.longest_stint?.compound} ({summary.longest_stint?.laps} laps)
          </p>

          <p>
            <strong>Shortest Stint:</strong>{" "}
            {summary.shortest_stint?.compound} ({summary.shortest_stint?.laps} laps)
          </p>
        </div>
      )}

      {/* TABLE */}
      {!loading && stints.length > 0 && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Stint</th>
              <th>Tyre</th>
              <th>Laps</th>
              <th>Lap Range</th>
            </tr>
          </thead>
          <tbody>
            {stints.map((s, i) => (
              <tr key={i}>
                <td>{s.stint}</td>
                <td>{s.compound}</td>
                <td>{s.laps}</td>
                <td>{s.lap_start} - {s.lap_end}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && stints.length === 0 && (
        <p style={{ marginTop: "20px" }}>No stint data available.</p>
      )}
    </div>
  );
}

export default StintAnalysis;