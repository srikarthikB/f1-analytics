import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE from "./config";

const TYRE_COLORS = { SOFT: "#e10600", MEDIUM: "#f5c518", HARD: "#f0f0f0" };
const TYRE_LABEL  = { SOFT: "S", MEDIUM: "M", HARD: "H" };

function formatTime(seconds) {
  if (seconds == null || isNaN(seconds)) return "--:--:--";

  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 1000);

  return `${hrs.toString().padStart(2, "0")}:` +
         `${mins.toString().padStart(2, "0")}:` +
         `${secs.toString().padStart(2, "0")}.` +
         `${ms.toString().padStart(3, "0")}`;
}

function StintAnalysis() {
  /* ── NEW logic: all state & API calls preserved exactly ── */
  const { session_key } = useParams();

  const [drivers, setDrivers]               = useState([]);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [stints, setStints]                 = useState([]);
  const [summary, setSummary]               = useState(null);
  const [pits, setPits]                     = useState([]);
  const [optimal, setOptimal]               = useState(null);
  const [loading, setLoading]               = useState(false);
  const [cache, setCache]                   = useState({});

  useEffect(() => {
    if (!session_key) return;
    fetch(`${API_BASE}/drivers?session_key=${session_key}`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        setDrivers(data);
        if (data.length > 0) setSelectedDriver(String(data[0].driver_number));
      });
  }, [session_key]);

  useEffect(() => {
    if (!selectedDriver) return;
    if (cache[selectedDriver]) {
      const c = cache[selectedDriver];
      setStints(c.stints); setSummary(c.summary); setPits(c.pits); setOptimal(c.optimal);
      return;
    }
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/optimal_strategy?session_key=${session_key}&driver_number=${selectedDriver}`).then(r => r.json()),
      fetch(`${API_BASE}/stint-analysis?session_key=${session_key}&driver_number=${selectedDriver}`).then(r => r.json()),
    ])
      .then(([optData, stintData]) => {
        const newStints  = Array.isArray(stintData.stints)  ? stintData.stints  : [];
        const newSummary = stintData.summary || null;
        const newPits    = Array.isArray(stintData.pits)    ? stintData.pits    : [];
        setStints(newStints); setSummary(newSummary); setPits(newPits); setOptimal(optData);
        setCache(prev => ({ ...prev, [selectedDriver]: { stints: newStints, summary: newSummary, pits: newPits, optimal: optData } }));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedDriver, session_key]);

  const totalLaps = summary?.total_laps || 1;
  const maxLoss   = optimal?.stints ? Math.max(...optimal.stints.map(s => s.time_loss || 0)) : 0;

  const getStrategyType = () => {
    if (!summary) return "";
    const stops = summary.pit_stops;
    if (stops === 1) return "One-stop strategy";
    if (stops === 2) return "Two-stop strategy";
    if (stops >= 3) return "Aggressive multi-stop";
    return "No-stop";
  };

  const getDegWarn = stint => {
    if (stint.compound === "SOFT"   && stint.laps > 18) return "HIGH DEG";
    if (stint.compound === "MEDIUM" && stint.laps > 30) return "STRETCHING";
    if (stint.compound === "HARD"   && stint.laps > 45) return "VERY LONG";
    return null;
  };

  /* ── OLD UI layout with index.css classes ── */
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--bg)" }}>

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full blur-[130px]"
          style={{ background: "rgba(225,6,0,0.06)" }} />
        <div className="absolute bottom-0 -right-48 w-[500px] h-[500px] rounded-full blur-[100px]"
          style={{ background: "rgba(30,30,30,0.4)" }} />
      </div>

      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(var(--white) 1px,transparent 1px),linear-gradient(90deg,var(--white) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      <div className="pw-page relative z-10">

        {/* Header */}
        <div className="pw-eyebrow">RACE ENGINEERING</div>
        <h1 className="pw-title">
          STINT
          <span className="pw-title-red"> ANALYSIS</span>
        </h1>
        <p className="pw-subtitle">PIT STRATEGY · TYRE PERFORMANCE · RACE PACE</p>
        <div className="pw-divider" />

        {/* Driver selector */}
        <div className="pw-card mb-6 p-6" style={{ borderTop: "2px solid var(--border-red)" }}>
          <div className="pw-eyebrow mb-4">SELECT DRIVER</div>
          <div className="flex items-center gap-4">
            <select className="pw-select" value={selectedDriver} onChange={e => setSelectedDriver(e.target.value)}>
              {drivers.map(d => (
                <option key={d.driver_number} value={d.driver_number}>{d.full_name}</option>
              ))}
            </select>
          </div>
        </div>

        {loading && <div className="pw-loading">Loading stint data...</div>}

        {!loading && stints.length > 0 && summary && (
          <>
            {/* Race Timeline card */}
            <div className="relative overflow-hidden rounded-3xl mb-5"
              style={{
                background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg) 100%)",
                border: "1px solid var(--border)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
              }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, var(--red) 60%, transparent)" }} />

              <div className="px-7 py-6">
                <div className="pw-eyebrow mb-4">RACE TIMELINE</div>

                {/* Tyre bar */}
                <div className="relative mb-3">
                  <div className="flex rounded-lg overflow-hidden" style={{ height: "36px" }}>
                    {stints.map((s, i) => {
                      const width = (s.laps / totalLaps) * 100;
                      const color = TYRE_COLORS[s.compound] || "var(--muted)";
                      return (
                        <div key={i} style={{
                          width: `${width}%`,
                          background: `${color}22`,
                          borderRight: "1px solid rgba(0,0,0,0.3)",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <span style={{ fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "13px", color }}>
                            {TYRE_LABEL[s.compound] || s.compound[0]}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  {/* Pit markers */}
                  {pits.map((p, i) => (
                    <div key={i} style={{
                      position: "absolute", left: `${(p.lap / totalLaps) * 100}%`, top: 0,
                      width: "2px", height: "36px", background: "#f5c518",
                      transform: "translateX(-50%)",
                    }} />
                  ))}
                </div>

                {/* Tyre legend */}
                <div className="flex gap-4 flex-wrap mb-4">
                  {Object.entries(TYRE_COLORS).map(([compound, color]) => (
                    <div key={compound} className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
                      <span className="pw-subtitle">{compound}</span>
                    </div>
                  ))}
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5" style={{ background: "#f5c518" }} />
                    <span className="pw-subtitle">PIT STOP</span>
                  </div>
                </div>

                {/* Pit list */}
                {pits.length > 0 && (
                  <div className="flex gap-3 flex-wrap pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                    {pits.map((p, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                        style={{ background: "var(--bg-card2)", border: "1px solid rgba(245,197,24,0.2)" }}>
                        <span className="pw-subtitle" style={{ color: "#f5c518" }}>PIT {i + 1}</span>
                        <span className="pw-subtitle">LAP {p.lap}</span>
                        {p.duration && <span className="pw-subtitle">{p.duration}s</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Race Summary card */}
            <div className="relative overflow-hidden rounded-3xl mb-5"
              style={{
                background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg) 100%)",
                border: "1px solid var(--border)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
              }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, var(--red) 60%, transparent)" }} />

              <div className="px-7 py-6">
                <div className="pw-eyebrow mb-4">RACE SUMMARY</div>
                <div className="grid gap-6 mb-4"
                  style={{ gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))" }}>
                  {[
                    { label: "STRATEGY",   value: getStrategyType() },
                    { label: "TOTAL LAPS", value: summary.total_laps },
                    { label: "PIT STOPS",  value: summary.pit_stops  },
                    { label: "STINTS",     value: stints.length       },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <div className="pw-subtitle mb-1">{label}</div>
                      <div className="font-bold" style={{ fontFamily: "var(--font-head)", fontSize: "18px", color: "var(--white)" }}>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Tyre usage */}
                {summary.tyre_usage && (
                  <div className="pt-4" style={{ borderTop: "1px solid var(--border)" }}>
                    <div className="pw-subtitle mb-3">TYRE USAGE</div>
                    <div className="flex gap-3 flex-wrap">
                      {Object.entries(summary.tyre_usage).map(([tyre, laps]) => (
                        <div key={tyre} className="flex items-center gap-2 px-3 py-2 rounded-lg"
                          style={{
                            background: "var(--bg-card2)",
                            border: `1px solid ${TYRE_COLORS[tyre] || "var(--muted)"}30`,
                          }}>
                          <span className="w-2 h-2 rounded-full flex-shrink-0"
                            style={{ background: TYRE_COLORS[tyre] || "var(--muted)" }} />
                          <span className="font-bold" style={{ fontFamily: "var(--font-head)", fontSize: "15px", color: TYRE_COLORS[tyre] || "var(--white)" }}>{tyre}</span>
                          <span className="pw-subtitle" style={{ color: "var(--muted2)" }}>{laps} LAPS</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stint Breakdown card */}
            <div className="relative overflow-hidden rounded-3xl mb-5"
              style={{
                background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg) 100%)",
                border: "1px solid var(--border)",
                boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
              }}>
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: "linear-gradient(90deg, var(--red) 60%, transparent)" }} />

              <div className="px-7 py-6">
                <div className="pw-eyebrow mb-4">STINT BREAKDOWN</div>

                {/* Header */}
                <div className="grid gap-2 pb-3 mb-1"
                  style={{
                    gridTemplateColumns: "60px 80px 60px 100px 1fr",
                    borderBottom: "1px solid var(--border)",
                  }}>
                  {["STINT", "TYRE", "LAPS", "RANGE", "INSIGHT"].map(h => (
                    <div key={h} className="pw-subtitle">{h}</div>
                  ))}
                </div>

                {/* Rows */}
                {stints.map((s, i) => {
                  const isWorst  = optimal?.problem_stint?.stint === s.stint;
                  const isBest   = optimal?.best_stint?.stint   === s.stint;
                  const warn     = getDegWarn(s);
                  const overstayed = optimal?.stints?.find(st => st.stint === s.stint)?.overstayed;

                  return (
                    <div key={i} className="grid gap-2 py-3 items-center"
                      style={{
                        gridTemplateColumns: "60px 80px 60px 100px 1fr",
                        borderBottom: i < stints.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                        background: isWorst ? "rgba(225,6,0,0.05)" : isBest ? "rgba(34,197,94,0.05)" : "transparent",
                        borderLeft: isWorst ? "2px solid rgba(225,6,0,0.5)" : isBest ? "2px solid rgba(34,197,94,0.5)" : "2px solid transparent",
                        paddingLeft: "8px",
                      }}>
                      <span className="pw-subtitle" style={{ fontSize: "11px" }}>S{s.stint}</span>

                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full flex items-center justify-center font-black"
                          style={{
                            fontFamily: "var(--font-head)", fontSize: "10px",
                            background: `${TYRE_COLORS[s.compound] || "var(--muted)"}20`,
                            border: `1px solid ${TYRE_COLORS[s.compound] || "var(--muted)"}`,
                            color: TYRE_COLORS[s.compound] || "var(--muted)",
                          }}>
                          {TYRE_LABEL[s.compound] || s.compound[0]}
                        </div>
                        <span className="font-medium" style={{ fontFamily: "var(--font-head)", fontSize: "13px", color: "var(--muted2)" }}>{s.compound}</span>
                      </div>

                      <span className="font-bold" style={{ fontFamily: "var(--font-head)", fontSize: "18px", color: "var(--white)" }}>{s.laps}</span>
                      <span className="pw-subtitle">{s.lap_start}–{s.lap_end}</span>

                      <div className="flex gap-2 flex-wrap">
                        {warn && (
                          <span className="pw-subtitle px-2 py-0.5 rounded"
                            style={{ color: "#f59e0b", background: "rgba(245,158,11,0.1)" }}>
                            ⚠ {warn}
                          </span>
                        )}
                        {overstayed && (
                          <span className="pw-subtitle px-2 py-0.5 rounded"
                            style={{ color: "var(--red)", background: "rgba(225,6,0,0.1)" }}>
                            OVERSTAYED
                          </span>
                        )}
                        {isBest && (
                          <span className="pw-subtitle px-2 py-0.5 rounded"
                            style={{ color: "#22c55e", background: "rgba(34,197,94,0.1)" }}>
                            BEST
                          </span>
                        )}
                        {isWorst && (
                          <span className="pw-subtitle px-2 py-0.5 rounded"
                            style={{ color: "var(--red)", background: "rgba(225,6,0,0.1)" }}>
                            WEAKEST
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="h-4" style={{ background: "linear-gradient(to top, rgba(10,10,20,0.6), transparent)" }} />
            </div>
          </>
        )}

        {/* Strategy Comparison card */}
        {optimal && (
          <div className="relative overflow-hidden rounded-3xl mb-5"
            style={{
              background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg) 100%)",
              border: "1px solid var(--border)",
              borderTop: "2px solid var(--border-red)",
              boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
            }}>

            <div className="px-7 py-6">
              <div className="pw-eyebrow mb-5">STRATEGY COMPARISON</div>

              {/* Strategy metrics */}
              <div className="grid gap-4 mb-5" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
                {[
                  { label: "REAL STRATEGY",    value: formatTime(optimal.real_time),    color: "var(--muted2)" },
                  { label: "OPTIMAL STRATEGY", value: formatTime(optimal.optimal_time), color: "#22c55e" },
                  { label: "TIME GAIN",        value: `-${formatTime(optimal.time_gain)}`,   color: "#f5c518" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="text-center rounded-xl p-4"
                    style={{ background: "var(--bg-card2)" }}>
                    <div className="pw-subtitle mb-2">{label}</div>
                    <div className="font-bold" style={{ fontFamily: "var(--font-head)", fontSize: "28px", color, marginTop: "8px" }}>{value}</div>
                  </div>
                ))}
              </div>

              {/* Weakest stint */}
              {optimal.problem_stint && (
                <div className="rounded-xl p-4 mb-4"
                  style={{ background: "rgba(225,6,0,0.06)", border: "1px solid rgba(225,6,0,0.2)" }}>
                  <div className="pw-subtitle mb-2" style={{ color: "var(--red)" }}>WEAKEST STINT — S{optimal.problem_stint.stint}</div>
                  <div className="flex items-baseline gap-3">
                    <span className="font-bold" style={{ fontFamily: "var(--font-head)", fontSize: "28px", color: "var(--red)" }}>
                      +{formatTime(optimal.problem_stint.time_loss)}
                    </span>
                    <span className="pw-subtitle">LOST · AVG {formatTime(optimal.problem_stint.avg)}</span>
                  </div>
                </div>
              )}

              {/* Stint performance bars */}
              {optimal.stints && (
                <div className="flex flex-col gap-3">
                  <div className="pw-subtitle">STINT PERFORMANCE — TIME LOST VS OPTIMAL</div>
                  {optimal.stints.map((stint, idx) => {
                    if (!stint.time_loss || stint.time_loss <= 0) return null;
                    const width    = maxLoss > 0 ? (stint.time_loss / maxLoss) * 100 : 0;
                    const isWorst  = stint.stint === optimal.problem_stint?.stint;
                    const isBest   = stint.stint === optimal.best_stint?.stint;
                    const barColor = isWorst ? "var(--red)" : isBest ? "#22c55e" : "#3b82f6";

                    return (
                      <div key={stint.stint}>
                        <div className="flex justify-between mb-1">
                          <span className="pw-subtitle" style={{ color: "var(--muted2)" }}>
                            STINT {idx + 1} · {formatTime(stint.avg)}/lap
                          </span>
                          <span className="pw-subtitle" style={{ color: barColor }}>
                            +{formatTime(Math.max(0, stint.time_loss))}
                          </span>
                        </div>
                        <div className="rounded-full overflow-hidden" style={{ height: "4px", background: "var(--border)" }}>
                          <div className="h-full rounded-full transition-all duration-700"
                            style={{
                              width: `${Math.max(0, Math.min(100, width))}%`,
                              background: barColor,
                            }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="h-4" style={{ background: "linear-gradient(to top, rgba(10,10,20,0.6), transparent)" }} />
          </div>
        )}

        {!loading && stints.length === 0 && (
          <div className="pw-loading">No stint data available.</div>
        )}

        <div className="pw-footer">F1 Analytics · Stint Analysis</div>
      </div>
    </div>
  );
}

export default StintAnalysis;