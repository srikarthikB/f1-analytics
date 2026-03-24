import { useEffect, useState } from "react";
import API_BASE from "./config";
import DriverAvatar from "./DriverAvatar";

const REQUIRED_DRIVERS = 3;

function FantasyMode() {
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");

  const [allDrivers, setAllDrivers] = useState([]);
  const [allTeams, setAllTeams] = useState([]);

  const [pickedDrivers, setPickedDrivers] = useState(["", "", ""]);
  const [pickedTeam, setPickedTeam] = useState("");

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [showRules, setShowRules] = useState(false);

  // Load sessions
  useEffect(() => {
    fetch(`${API_BASE}/sessions`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const currentYear = new Date().getFullYear();

        const filtered = data
          .filter(s => s.year === currentYear)
          .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));

        setSessions(filtered);

        if (filtered.length > 0) {
          setSelectedSession(String(filtered[0].session_key));
        }
      })
      .catch(() => {});
  }, []);

  // Load drivers + teams
  useEffect(() => {
    if (!selectedSession) return;

    fetch(`${API_BASE}/drivers?session_key=${selectedSession}`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;

        setAllDrivers(data);

        setPickedDrivers([
          data[0]?.driver_number ? String(data[0].driver_number) : "",
          data[1]?.driver_number ? String(data[1].driver_number) : "",
          data[2]?.driver_number ? String(data[2].driver_number) : "",
        ]);
      })
      .catch(() => {});

    fetch(`${API_BASE}/teams`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;

        setAllTeams(data);

        if (data.length > 0) {
          setPickedTeam(data[0].name || "");
        }
      })
      .catch(() => {});
  }, [selectedSession]);

  const isRaceFinished = () => {
    const session = sessions.find(
      s => String(s.session_key) === selectedSession
    );
    if (!session) return false;

    return new Date(session.date_start) < new Date();
  };

  const updateDriver = (index, value) => {
    const updated = [...pickedDrivers];
    updated[index] = value;
    setPickedDrivers(updated);
  };

  const calculate = async () => {
    const validDrivers = pickedDrivers.filter(d => d !== "");

    if (validDrivers.length !== REQUIRED_DRIVERS) {
      setError(`Please select exactly ${REQUIRED_DRIVERS} drivers.`);
      return;
    }

    if (!pickedTeam) {
      setError("Please select a team.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    const url = `${API_BASE}/fantasy_score?session_key=${selectedSession}&driver_numbers=${validDrivers.join(",")}&team_name=${encodeURIComponent(pickedTeam)}`;

    try {
      const res = await fetch(url);
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err) {
      setError("Network error — could not reach the server.");
    } finally {
      setLoading(false);
    }
  };

  const sessionLabel = s =>
    `${s.country_name || ""} - ${s.circuit_short_name || ""} (${
      s.date_start
        ? new Date(s.date_start).toLocaleDateString()
        : "?"
    })`;

  return (
    <div>
      <h1>Fantasy Mode</h1>

      {/* RULES */}
      <div
        style={{
          marginBottom: "20px",
          border: "1px solid #333",
          borderRadius: "8px",
          padding: "10px",
          background: "#0f172a",
        }}
      >
        <button
          onClick={() => setShowRules(!showRules)}
          style={{
            fontWeight: "bold",
            color: "#f87171",
            cursor: "pointer",
          }}
        >
          {showRules ? "Hide Rules ▲" : "Show Rules ▼"}
        </button>

        {showRules && (
          <div
            style={{
              marginTop: "10px",
              fontSize: "14px",
              color: "#ccc",
            }}
          >
            <h3>How to Play</h3>
            <p>
              Select 3 drivers and 1 team. After the race, calculate your
              fantasy score based on performance, strategy, and consistency.
            </p>

            <h3>Scoring System</h3>
            <ul>
              <li><b>Finish Position:</b> 25–1 points (Top 10)</li>
              <li><b>Positions Gained:</b> +2 / -2 per position</li>
              <li><b>Overtakes:</b> +1 each (capped)</li>
              <li><b>DNF:</b> -10 | <b>DSQ:</b> -20</li>
              <li><b>Strategy:</b> +10 / +5</li>
              <li><b>Consistency:</b> +10 / +5</li>
            </ul>
          </div>
        )}
      </div>

      {/* SESSION */}
      <div style={{ marginBottom: "12px" }}>
        <label>Race: </label>
        <select
          value={selectedSession}
          onChange={e => setSelectedSession(e.target.value)}
        >
          {sessions.map(s => (
            <option key={s.session_key} value={s.session_key}>
              {sessionLabel(s)}
            </option>
          ))}
        </select>
      </div>

      {/* DRIVERS */}
      <div style={{ marginBottom: "16px" }}>
        <h3>Pick 3 Drivers</h3>
        {pickedDrivers.map((val, i) => (
          <div key={i}>
            <label>Driver {i + 1}: </label>
            <select
              value={val}
              onChange={e => updateDriver(i, e.target.value)}
            >
              <option value="">— select —</option>
              {allDrivers.map(d => (
                <option key={d.driver_number} value={d.driver_number}>
                  {d.full_name} ({d.team_name})
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {/* TEAM */}
      <div style={{ marginBottom: "16px" }}>
        <h3>Pick 1 Team</h3>
        <select
          value={pickedTeam}
          onChange={e => setPickedTeam(e.target.value)}
        >
          <option value="">— select —</option>
          {allTeams.map(t => (
            <option key={t.name} value={t.name}>
              {t.name}
            </option>
          ))}
        </select>
      </div>

      {/* BUTTON */}
      <button
        onClick={calculate}
        disabled={loading || !isRaceFinished()}
      >
        {loading ? "Calculating..." : "Calculate Score"}
      </button>

      {/* ERROR */}
      {error && (
        <p style={{ color: "red" }}>
          <strong>Error:</strong> {error}
        </p>
      )}

      {/* RESULT */}
      {result && (
        <div style={{ marginTop: "24px" }}>
          <h2>Driver Scores</h2>

          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Driver</th>
                <th>Finish</th>
                <th>Positions</th>
                <th>Overtakes</th>
                <th>Penalty</th>
                <th>Strategy</th>
                <th>Consistency</th>
                <th>Total</th>
              </tr>
            </thead>

            <tbody>
              {result.drivers.map(d => (
                <tr key={d.driver_number}>
                  <td>
                    <DriverAvatar
                        driver={allDrivers.find(dr => dr.driver_number === d.driver_number)}
                        size={36}
                    />
                  </td>
                  <td>{d.breakdown.finish}</td>
                  <td>
                    {d.breakdown.positions > 0
                      ? `+${d.breakdown.positions}`
                      : d.breakdown.positions}
                  </td>
                  <td>{d.breakdown.overtakes}</td>
                  <td>{d.breakdown.penalty}</td>
                  <td>{d.breakdown.strategy}</td>
                  <td>{d.breakdown.consistency}</td>
                  <td><strong>{d.total}</strong></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: "16px" }}>
            <p>
              <strong>Team Score ({pickedTeam}):</strong>{" "}
              {result.team_score}
            </p>
            <p>
              <strong>Total Fantasy Score:</strong>{" "}
              {result.total_score}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default FantasyMode;