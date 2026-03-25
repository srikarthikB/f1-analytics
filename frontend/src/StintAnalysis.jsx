import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE from "./config";

const TYRE_COLORS = {
  SOFT: "#ff4d4d",
  MEDIUM: "#ffd633",
  HARD: "#ffffff"
};

function StintAnalysis() {
  const { session_key } = useParams();

  const [drivers, setDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");

  const [stints, setStints] = useState([]);
  const [summary, setSummary] = useState(null);
  const [pits, setPits] = useState([]);

  const [loading, setLoading] = useState(false);
  const [optimal, setOptimal] = useState(null);

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

  useEffect(() => {
    if (!selectedDriver) return;

    if (optimal?.driver === selectedDriver) return;

    setLoading(true);

    Promise.all([
      fetch(`${API_BASE}/optimal_strategy?session_key=${session_key}&driver_number=${selectedDriver}`),
      fetch(`${API_BASE}/stint-analysis?session_key=${session_key}&driver_number=${selectedDriver}`)
    ])
      .then(async ([optRes, stintRes]) => {
        const optData = await optRes.json();
        const stintData = await stintRes.json();

        setOptimal({ ...optData, driver: selectedDriver });

        setStints(Array.isArray(stintData.stints) ? stintData.stints : []);
        setSummary(stintData.summary || null);
        setPits(Array.isArray(stintData.pits) ? stintData.pits : []);
      })
      .catch(() => console.error("Failed to fetch stint data"))
      .finally(() => setLoading(false));

  }, [selectedDriver, session_key]);

  const totalLaps = summary?.total_laps || 1;

  const getStrategyType = () => {
    if (!summary) return "";
    const stops = summary.pit_stops;
    if (stops === 1) return "One-stop strategy";
    if (stops === 2) return "Two-stop strategy";
    if (stops >= 3) return "Aggressive strategy";
    return "No-stop";
  };

  const getDegradationWarning = (stint) => {
    if (stint.compound === "SOFT" && stint.laps > 18) return "⚠️ High degradation";
    if (stint.compound === "MEDIUM" && stint.laps > 30) return "⚠️ Stretching tyres";
    if (stint.compound === "HARD" && stint.laps > 45) return "⚠️ Very long stint";
    return "";
  };

  const maxLoss =
    optimal && optimal.stints
      ? Math.max(...optimal.stints.map(s => s.time_loss || 0))
      : 0;

  return (
    <div>
      <h1>Stint Analysis</h1>

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

      {/* 🔥 TIMELINE */}
      {!loading && stints.length > 0 && summary && (
        <div style={{ marginTop: "20px" }}>
          <h2>Race Timeline</h2>

          <div style={{ position: "relative", width: "100%" }}>
            <div style={{ display: "flex", height: "40px" }}>
              {stints.map((s, i) => {
                const width = (s.laps / totalLaps) * 100;
                const color = TYRE_COLORS[s.compound] || "#ccc";

                return (
                  <div
                    key={i}
                    style={{
                      width: `${width}%`,
                      backgroundColor: color,
                      border: "1px solid black",
                      textAlign: "center",
                      fontSize: "12px",
                      color: s.compound === "HARD" ? "black" : "white"
                    }}
                  >
                    {s.compound}
                  </div>
                );
              })}
            </div>

            {/* PIT MARKERS */}
            {pits.map((p, i) => {
              const left = (p.lap / totalLaps) * 100;

              return (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    left: `${left}%`,
                    top: 0,
                    height: "40px",
                    width: "2px",
                    backgroundColor: "black"
                  }}
                />
              );
            })}
          </div>

          {/* PIT INFO */}
          <div style={{ marginTop: "10px" }}>
            <h3>Pit Stops</h3>
            {pits.map((p, i) => (
              <p key={i}>
                Lap {p.lap} → Pit ({p.duration ?? "?"}s)
              </p>
            ))}
          </div>
        </div>
      )}

      {/* SUMMARY */}
      {!loading && summary && (
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <h2>Strategy Summary</h2>

          <p><strong>Strategy:</strong> {summary.strategy}</p>
          <p><strong>Type:</strong> {getStrategyType()}</p>
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
              <th>Insight</th>
            </tr>
          </thead>
          <tbody>
            {stints.map((s, i) => (
              <tr
                key={i}
                className={
                  optimal?.problem_stint?.stint === s.stint
                    ? "bg-red-500/20"
                    : optimal?.best_stint?.stint === s.stint
                    ? "bg-green-500/20"
                    : ""
                }
              >
                <td>{s.stint}</td>
                <td>{s.compound}</td>
                <td>{s.laps}</td>
                <td>{s.lap_start} - {s.lap_end}</td>
                <td>
                    {getDegradationWarning(s)}
                    {optimal?.stints?.find(st => st.stint === s.stint)?.overstayed && (
                        <div className="text-red-400 text-xs mt-1">
                        ⚠️ Stayed out too long
                        </div>
                    )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {optimal && (
        <div className="mt-6 p-4 bg-gray-900 rounded-xl">
            <h2 className="text-xl font-bold mb-3">Strategy Comparison</h2>

            <div className="grid grid-cols-3 gap-4 text-center">
            
            <div>
                <p className="text-gray-400">Real Strategy</p>
                <p className="text-lg font-semibold">{optimal.real_time.toFixed(2)}s</p>
            </div>

            <div>
                <p className="text-gray-400">Optimal Strategy</p>
                <p className="text-lg font-semibold text-green-400">
                {optimal.optimal_time.toFixed(2)}s
                </p>
            </div>

            <div>
                <p className="text-gray-400">Time Gain</p>
                <p className="text-lg font-semibold text-yellow-400">
                -{optimal.time_gain.toFixed(2)}s
                </p>
            </div>

            </div>
        </div>
        )}

        {optimal?.problem_stint && (
            <div className="mt-4 p-4 bg-red-900/30 rounded-xl border border-red-500">
                <h3 className="text-lg font-bold text-red-400">Weakest Stint</h3>
                
                <p className="mt-2">
                Stint {optimal.problem_stint.stint} lost{" "}
                <span className="font-semibold text-red-300">
                    {optimal.problem_stint.time_loss.toFixed(2)}s
                </span>
                </p>

                <p className="text-sm text-gray-400 mt-1">
                Avg: {optimal.problem_stint.avg.toFixed(2)}s per lap
                </p>
            </div>
        )}

      {optimal && optimal.stints && (
        <div className="mt-6 p-4 bg-gray-900 rounded-xl">
          <h2 className="text-xl font-bold mb-2">Stint Performance</h2>
          <p className="text-sm text-gray-400 mb-3">
            Time lost vs optimal pace
          </p>

          <div className="space-y-3">
            {optimal.stints.map((stint, index) => {
              const width =
                maxLoss > 0
                  ? (stint.time_loss / maxLoss) * 100
                  : 0;

              const isWorst =
                stint.stint === optimal.problem_stint?.stint;

              const isBest =
                stint.stint === optimal.best_stint?.stint;

              if (!stint.time_loss || Math.max(0, stint.time_loss) === 0) {
                return null; // 🚫 skip this stint completely
                }

            return (
            <div key={stint.stint}>
                <div className="flex justify-between text-sm mb-1">
                <span>
                    Stint {index + 1}
                    <span className="ml-2 text-gray-400 text-xs">
                    ({stint.avg.toFixed(2)}s/lap)
                    </span>
                </span>

                <span>
                    {Math.max(0, stint.time_loss).toFixed(2)}s
                </span>
                </div>

                <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
                <div
                    className={`h-3 rounded-full transition-all duration-500 ${
                    isWorst
                        ? "bg-red-500"
                        : isBest
                        ? "bg-green-400"
                        : "bg-blue-400"
                    }`}
                    style={{
                    width: `${Math.max(0, Math.min(100, width))}%`
                    }}
                ></div>
                </div>
            </div>
            );
            })}
          </div>
        </div>
      )}

      {!loading && stints.length === 0 && (
        <p style={{ marginTop: "20px" }}>No stint data available.</p>
      )}
    </div>
  );
}

export default StintAnalysis;