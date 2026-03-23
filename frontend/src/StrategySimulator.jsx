import { useState, useEffect } from "react";
import API_BASE from "./config";

const TIRES = {
  soft:   { label: "Soft" },
  medium: { label: "Medium" },
  hard:   { label: "Hard" },
};

// Returns true only if the API response is a valid simulation result
function isValidResult(res) {
  return res && typeof res === "object" && !res.error && res.total_time != null;
}

// Format raw seconds → HH:MM:SS.mmm or MM:SS.mmm if under an hour
function formatTime(totalSeconds) {
  const h   = Math.floor(totalSeconds / 3600);
  const m   = Math.floor((totalSeconds % 3600) / 60);
  const s   = Math.floor(totalSeconds % 60);
  const ms  = Math.round((totalSeconds % 1) * 1000);
  const mm  = String(m).padStart(2, "0");
  const ss  = String(s).padStart(2, "0");
  const mmm = String(ms).padStart(3, "0");
  if (h > 0) {
    return `${String(h).padStart(2, "0")}:${mm}:${ss}.${mmm}`;
  }
  return `${mm}:${ss}.${mmm}`;
}


function StrategySimulator() {
  const [races, setRaces]               = useState([]);
  const [selectedRace, setSelectedRace] = useState("");

  const [tyresA, setTyresA] = useState(["soft"]);
  const [tyresB, setTyresB] = useState(["medium"]);

  const [resultA, setResultA]       = useState(null);
  const [resultB, setResultB]       = useState(null);
  const [errorA, setErrorA]         = useState(null);
  const [errorB, setErrorB]         = useState(null);
  const [simulating, setSimulating] = useState(false);

  // Fetch race sessions for current year
  useEffect(() => {
    fetch(`${API_BASE}/sessions`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const currentYear = new Date().getFullYear();
        const filtered = data
          .filter(r => r.year === currentYear)
          .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
        console.log("Race sessions loaded:", filtered.length);
        setRaces(filtered);
        if (filtered.length > 0) {
          setSelectedRace(filtered[filtered.length - 1].session_key);
        }
      })
      .catch(err => console.error("Failed to load sessions:", err));
  }, []);

  const addStint = (setFn, tyres) => setFn([...tyres, "medium"]);

  const removeStint = (setFn, tyres, index) => {
    if (tyres.length === 1) return;
    setFn(tyres.filter((_, i) => i !== index));
  };

  const updateTyre = (setFn, tyres, index, value) => {
    const updated = [...tyres];
    updated[index] = value;
    setFn(updated);
  };

  const simulate = async () => {
    if (!selectedRace) {
      console.warn("No race selected");
      return;
    }

    setResultA(null);
    setResultB(null);
    setErrorA(null);
    setErrorB(null);
    setSimulating(true);

    console.log("Simulating — session:", selectedRace);
    console.log("Strategy A tyres:", tyresA);
    console.log("Strategy B tyres:", tyresB);

    const urlA = `${API_BASE}/simulate-strategy?session_key=${selectedRace}&tyres=${tyresA.join(",")}`;
    const urlB = `${API_BASE}/simulate-strategy?session_key=${selectedRace}&tyres=${tyresB.join(",")}`;

    try {
      const [resA, resB] = await Promise.all([
        fetch(urlA).then(r => r.json()),
        fetch(urlB).then(r => r.json()),
      ]);

      console.log("Strategy A response:", resA);
      console.log("Strategy B response:", resB);

      if (isValidResult(resA)) {
        setResultA(resA);
      } else {
        const msg = resA?.error || "Strategy A returned no data";
        console.error("Strategy A error:", msg);
        setErrorA(msg);
      }

      if (isValidResult(resB)) {
        setResultB(resB);
      } else {
        const msg = resB?.error || "Strategy B returned no data";
        console.error("Strategy B error:", msg);
        setErrorB(msg);
      }

    } catch (err) {
      console.error("Simulation fetch failed:", err);
      setErrorA("Network error — could not reach the server");
      setErrorB("Network error — could not reach the server");
    } finally {
      setSimulating(false);
    }
  };

  const bothValid = resultA !== null && resultB !== null;

  return (
    <div>
      <h1>Strategy Simulator</h1>

      {/* Race selector */}
      <div style={{ marginBottom: "12px" }}>
        <label>Race: </label>
        <select
          value={selectedRace}
          onChange={(e) => setSelectedRace(e.target.value)}
          style={{ width: "320px", padding: "6px" }}
        >
          {races.map(r => (
            <option key={r.session_key} value={r.session_key}>
              {r.country_name} - {r.circuit_short_name} ({new Date(r.date_start).toLocaleDateString()})
            </option>
          ))}
        </select>
      </div>

      {/* Strategy A */}
      <div style={{ marginBottom: "12px" }}>
        <h3>Strategy A</h3>
        {tyresA.map((t, i) => (
          <div key={i}>
            <select value={t} onChange={(e) => updateTyre(setTyresA, tyresA, i, e.target.value)}>
              {Object.entries(TIRES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <button onClick={() => removeStint(setTyresA, tyresA, i)}>❌</button>
          </div>
        ))}
        <button onClick={() => addStint(setTyresA, tyresA)}>+ Add Stint</button>
      </div>

      {/* Strategy B */}
      <div style={{ marginBottom: "12px" }}>
        <h3>Strategy B</h3>
        {tyresB.map((t, i) => (
          <div key={i}>
            <select value={t} onChange={(e) => updateTyre(setTyresB, tyresB, i, e.target.value)}>
              {Object.entries(TIRES).map(([key, val]) => (
                <option key={key} value={key}>{val.label}</option>
              ))}
            </select>
            <button onClick={() => removeStint(setTyresB, tyresB, i)}>❌</button>
          </div>
        ))}
        <button onClick={() => addStint(setTyresB, tyresB)}>+ Add Stint</button>
      </div>

      <button onClick={simulate} disabled={simulating}>
        {simulating ? "Simulating..." : "Run Simulation"}
      </button>

      {/* Per-strategy error messages */}
      {errorA && (
        <p style={{ color: "red" }}>
          <strong>Strategy A failed:</strong> {errorA}
        </p>
      )}
      {errorB && (
        <p style={{ color: "red" }}>
          <strong>Strategy B failed:</strong> {errorB}
        </p>
      )}

      {/* Results — only shown when BOTH strategies succeeded */}
      {bothValid && (
        <div style={{ marginTop: "20px" }}>

          {/* Strategy A breakdown */}
          <h3>Strategy A</h3>
          <p><strong>Total Time:</strong> {formatTime(resultA.total_time)}</p>
          <p><strong>Pit Stops:</strong> {resultA.pit_stops}</p>
          <table border="1" cellPadding="6">
            <thead>
              <tr><th>Stint</th><th>Tyre</th><th>Laps</th></tr>
            </thead>
            <tbody>
              {resultA.stints.map((s, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td style={{ textTransform: "capitalize" }}>{s.tyre}</td>
                  <td>{s.laps}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Strategy B breakdown */}
          <h3 style={{ marginTop: "16px" }}>Strategy B</h3>
          <p><strong>Total Time:</strong> {formatTime(resultB.total_time)}</p>
          <p><strong>Pit Stops:</strong> {resultB.pit_stops}</p>
          <table border="1" cellPadding="6">
            <thead>
              <tr><th>Stint</th><th>Tyre</th><th>Laps</th></tr>
            </thead>
            <tbody>
              {resultB.stints.map((s, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td style={{ textTransform: "capitalize" }}>{s.tyre}</td>
                  <td>{s.laps}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Winner */}
          <h3 style={{ marginTop: "16px" }}>
            Winner:{" "}
            {resultA.total_time < resultB.total_time
              ? "Strategy A 🏆"
              : resultB.total_time < resultA.total_time
              ? "Strategy B 🏆"
              : "Tie 🤝"}
          </h3>
          <p>Gap: {formatTime(Math.abs(resultA.total_time - resultB.total_time))}</p>
        </div>
      )}
    </div>
  );
}

export default StrategySimulator;