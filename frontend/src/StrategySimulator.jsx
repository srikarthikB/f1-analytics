import { useState, useEffect } from "react";
import API_BASE from "./config";

/* ── Tyre config (NEW logic values preserved) ─────────────────────────── */
const TIRES = {
  soft:   { label: "SOFT",   letter: "S", color: "#e10600", desc: "Fastest / grip" },
  medium: { label: "MEDIUM", letter: "M", color: "#f5c518", desc: "Balanced" },
  hard:   { label: "HARD",   letter: "H", color: "#f0f0f0", desc: "Durable / slow" },
};

function isValidResult(res) {
  return res && typeof res === "object" && !res.error && res.total_time != null;
}

function formatTime(totalSeconds) {
  const h   = Math.floor(totalSeconds / 3600);
  const m   = Math.floor((totalSeconds % 3600) / 60);
  const s   = Math.floor(totalSeconds % 60);
  const ms  = Math.round((totalSeconds % 1) * 1000);
  const mm  = String(m).padStart(2, "0");
  const ss  = String(s).padStart(2, "0");
  const mmm = String(ms).padStart(3, "0");
  return h > 0 ? `${String(h).padStart(2, "0")}:${mm}:${ss}.${mmm}` : `${mm}:${ss}.${mmm}`;
}

/* ── Tyre selector (NEW logic) ────────────────────────────────────────── */
function TyreSelector({ tyres, setFn, label }) {
  const addStint    = () => setFn([...tyres, "medium"]);
  const removeStint = i => { if (tyres.length > 1) setFn(tyres.filter((_, idx) => idx !== i)); };
  const updateTyre  = (i, val) => { const u = [...tyres]; u[i] = val; setFn(u); };

  return (
    <div style={{ flex: 1 }}>
      <div className="pw-subtitle mb-3">{label}</div>
      <div className="flex flex-col gap-2">
        {tyres.map((t, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="pw-subtitle" style={{ minWidth: "16px" }}>S{i + 1}</span>
            <div className="flex gap-2">
              {Object.entries(TIRES).map(([key, tyre]) => (
                <button
                  key={key}
                  onClick={() => updateTyre(i, key)}
                  className="transition-all duration-200"
                  style={{
                    width: "36px", height: "36px", borderRadius: "6px",
                    border: `1px solid ${t === key ? tyre.color : "var(--border)"}`,
                    background: t === key ? `${tyre.color}18` : "transparent",
                    color: t === key ? tyre.color : "var(--muted)",
                    fontFamily: "var(--font-head)", fontWeight: 800, fontSize: "14px",
                    cursor: "pointer",
                  }}
                >{tyre.letter}</button>
              ))}
            </div>
            <button
              onClick={() => removeStint(i)}
              style={{
                color: "var(--muted)", fontSize: "14px", padding: "0 4px",
                opacity: tyres.length === 1 ? 0.3 : 1,
                cursor: tyres.length === 1 ? "not-allowed" : "pointer",
                background: "none", border: "none",
              }}
            >✕</button>
          </div>
        ))}
      </div>
      <button
        onClick={addStint}
        className="mt-3 pw-subtitle transition-colors duration-200"
        style={{
          padding: "8px 14px",
          border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "6px",
          cursor: "pointer", background: "none",
          color: "var(--muted)",
        }}
        onMouseEnter={e => { e.currentTarget.style.color = "var(--white)"; e.currentTarget.style.borderColor = "var(--border-red)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "var(--muted)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; }}
      >+ ADD STINT</button>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
function StrategySimulator() {
  /* ── NEW state & API logic preserved exactly ── */
  const [races, setRaces]               = useState([]);
  const [selectedRace, setSelectedRace] = useState("");
  const [tyresA, setTyresA]             = useState(["soft"]);
  const [tyresB, setTyresB]             = useState(["medium"]);
  const [resultA, setResultA]           = useState(null);
  const [resultB, setResultB]           = useState(null);
  const [errorA, setErrorA]             = useState(null);
  const [errorB, setErrorB]             = useState(null);
  const [simulating, setSimulating]     = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/sessions`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const currentYear = new Date().getFullYear();
        const filtered = data
          .filter(r => r.year === currentYear)
          .sort((a, b) => new Date(a.date_start) - new Date(b.date_start));
        setRaces(filtered);
        if (filtered.length > 0) setSelectedRace(filtered[filtered.length - 1].session_key);
      });
  }, []);

  const simulate = async () => {
    if (!selectedRace) return;
    setResultA(null); setResultB(null); setErrorA(null); setErrorB(null); setSimulating(true);
    try {
      const [resA, resB] = await Promise.all([
        fetch(`${API_BASE}/simulate-strategy?session_key=${selectedRace}&tyres=${tyresA.join(",")}`).then(r => r.json()),
        fetch(`${API_BASE}/simulate-strategy?session_key=${selectedRace}&tyres=${tyresB.join(",")}`).then(r => r.json()),
      ]);
      if (isValidResult(resA)) setResultA(resA); else setErrorA(resA?.error || "Strategy A returned no data");
      if (isValidResult(resB)) setResultB(resB); else setErrorB(resB?.error || "Strategy B returned no data");
    } catch {
      setErrorA("Network error"); setErrorB("Network error");
    } finally {
      setSimulating(false);
    }
  };

  const bothValid = resultA && resultB;
  const winnerA   = bothValid && resultA.total_time < resultB.total_time;
  const winnerB   = bothValid && resultB.total_time < resultA.total_time;

  /* ── OLD UI layout ── */
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--bg)" }}>

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full blur-[130px]"
          style={{ background: "rgba(225,6,0,0.06)" }} />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[400px] rounded-full blur-[110px]"
          style={{ background: "rgba(225,6,0,0.04)" }} />
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
          STRATEGY
          <span className="pw-title-red">SIMULATOR</span>
        </h1>
        <p className="pw-subtitle">CONFIGURE RACE PARAMETERS AND RUN THE SIMULATION</p>
        <div className="pw-divider" />

        {/* Control panel card */}
        <div className="pw-card mb-5" style={{ borderTop: "2px solid var(--border-red)" }}>
          <div className="p-7">
            <div className="pw-eyebrow mb-5">CONTROL PANEL</div>

            {/* Race selector */}
            <div className="mb-6">
              <div className="pw-subtitle mb-2">RACE</div>
              <select className="pw-select" value={selectedRace} onChange={e => setSelectedRace(e.target.value)}
                style={{ width: "100%", maxWidth: "480px" }}>
                {races.map(r => (
                  <option key={r.session_key} value={r.session_key}>
                    {r.country_name} — {r.circuit_short_name} ({new Date(r.date_start).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </div>

            {/* Tyre compound legend */}
            <div className="flex gap-3 mb-6 flex-wrap">
              {Object.entries(TIRES).map(([key, t]) => (
                <div key={key} className="flex items-center gap-2 rounded-lg px-3 py-2"
                  style={{
                    background: "var(--bg-card2)",
                    border: `1px solid ${t.color}20`,
                  }}>
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-black"
                    style={{
                      fontFamily: "var(--font-head)", fontSize: "12px",
                      background: `${t.color}18`,
                      border: `1px solid ${t.color}`,
                      color: t.color,
                    }}>
                    {t.letter}
                  </div>
                  <div>
                    <div className="font-bold" style={{ fontFamily: "var(--font-head)", fontSize: "13px", color: t.color }}>{t.label}</div>
                    <div className="pw-subtitle">{t.desc}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Strategy A / B */}
            <div className="grid gap-7" style={{ gridTemplateColumns: "1fr 1px 1fr" }}>
              <TyreSelector tyres={tyresA} setFn={setTyresA} label="STRATEGY A" />
              <div style={{ background: "var(--border)" }} />
              <TyreSelector tyres={tyresB} setFn={setTyresB} label="STRATEGY B" />
            </div>

            {/* Strategy preview */}
            {(tyresA.length > 0 || tyresB.length > 0) && (
              <div className="mt-6 pt-5" style={{ borderTop: "1px solid var(--border)" }}>
                <div className="pw-subtitle mb-2">STRATEGY PREVIEW</div>
                <div className="flex gap-2 flex-wrap">
                  {tyresA.map((t, i) => (
                    <div key={i} className="px-3 py-1 rounded"
                      style={{
                        background: `${TIRES[t]?.color}18`,
                        border: `1px solid ${TIRES[t]?.color}40`,
                        fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em",
                        color: TIRES[t]?.color,
                      }}>
                      A-S{i + 1} {TIRES[t]?.letter}
                    </div>
                  ))}
                  <div className="pw-subtitle px-2">·</div>
                  {tyresB.map((t, i) => (
                    <div key={i} className="px-3 py-1 rounded"
                      style={{
                        background: `${TIRES[t]?.color}12`,
                        border: `1px solid ${TIRES[t]?.color}30`,
                        fontFamily: "var(--font-mono)", fontSize: "9px", letterSpacing: "0.1em",
                        color: TIRES[t]?.color,
                      }}>
                      B-S{i + 1} {TIRES[t]?.letter}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Run simulation button */}
        <button
          onClick={simulate}
          disabled={simulating}
          className="w-full py-4 mb-6 font-black uppercase tracking-[0.2em] font-mono text-white transition-all duration-200"
          style={{
            borderRadius: "10px",
            background: "linear-gradient(90deg, var(--red), #c0392b)",
            boxShadow: "0 0 24px rgba(225,6,0,0.35)",
            fontSize: "13px",
            border: "none",
            cursor: simulating ? "not-allowed" : "pointer",
            opacity: simulating ? 0.7 : 1,
          }}
        >
          {simulating ? "SIMULATING..." : "▶  RUN SIMULATION"}
        </button>

        {/* Errors */}
        {(errorA || errorB) && (
          <div className="mb-5 p-4 rounded-xl"
            style={{ background: "rgba(225,6,0,0.08)", border: "1px solid rgba(225,6,0,0.25)" }}>
            {errorA && <p className="pw-subtitle" style={{ color: "var(--red)" }}>⚠ STRATEGY A: {errorA}</p>}
            {errorB && <p className="pw-subtitle mt-1" style={{ color: "var(--red)" }}>⚠ STRATEGY B: {errorB}</p>}
          </div>
        )}

        {/* Results */}
        {bothValid && (
          <>
            <div className="grid gap-4" style={{ gridTemplateColumns: "1fr 1fr" }}>
              {[
                { label: "STRATEGY A", result: resultA, winner: winnerA },
                { label: "STRATEGY B", result: resultB, winner: winnerB },
              ].map(({ label, result, winner }) => (
                <div key={label} className="relative overflow-hidden rounded-3xl"
                  style={{
                    background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg) 100%)",
                    border: `1px solid ${winner ? "rgba(34,197,94,0.3)" : "var(--border)"}`,
                    borderTop: `2px solid ${winner ? "#22c55e" : "rgba(255,255,255,0.12)"}`,
                    boxShadow: "0 8px 40px rgba(0,0,0,0.5)",
                  }}>

                  <div className="px-7 py-6 border-b flex items-center justify-between"
                    style={{ borderColor: "var(--border)" }}>
                    <div>
                      <div className="pw-subtitle mb-1" style={{ color: "var(--red)" }}>SIMULATION COMPLETE</div>
                      <p className="pw-subtitle">{result.pit_stops} PIT STOP{result.pit_stops !== 1 ? "S" : ""} · {label}</p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      {winner && (
                        <span className="font-bold tracking-widest uppercase"
                          style={{ fontFamily: "var(--font-head)", fontSize: "12px", color: "#22c55e" }}>
                          🏆 WINNER
                        </span>
                      )}
                      <span className="pw-subtitle">TOTAL RACE TIME</span>
                      <span className="font-black leading-none"
                        style={{
                          fontFamily: "var(--font-mono)", fontSize: "32px",
                          color: winner ? "#22c55e" : "var(--white)",
                          textShadow: winner ? "0 0 30px rgba(34,197,94,0.5)" : "none",
                        }}>
                        {formatTime(result.total_time)}
                      </span>
                    </div>
                  </div>

                  {/* Stint breakdown */}
                  <div className="px-7 py-5">
                    <div className="pw-subtitle mb-3">STINT BREAKDOWN</div>
                    <div className="flex flex-col gap-2">
                      {result.stints.map((s, i) => (
                        <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-xl"
                          style={{ background: "var(--bg-card2)" }}>
                          <span className="pw-subtitle">S{i + 1}</span>
                          <div className="w-6 h-6 rounded-full flex items-center justify-center font-black"
                            style={{
                              fontFamily: "var(--font-head)", fontSize: "10px",
                              background: `${TIRES[s.tyre]?.color}18`,
                              border: `1px solid ${TIRES[s.tyre]?.color}`,
                              color: TIRES[s.tyre]?.color,
                            }}>
                            {TIRES[s.tyre]?.letter}
                          </div>
                          <span style={{ fontFamily: "var(--font-body)", fontSize: "12px", color: "var(--muted2)", textTransform: "capitalize" }}>{s.tyre}</span>
                          <span className="ml-auto" style={{ fontFamily: "var(--font-mono)", fontSize: "10px", color: "var(--white)" }}>{s.laps} laps</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="h-4" style={{ background: "linear-gradient(to top, rgba(10,10,20,0.6), transparent)" }} />
                </div>
              ))}
            </div>

            {/* Gap / Tie */}
            <div className="mt-5 text-center">
              {!winnerA && !winnerB ? (
                <span className="font-bold" style={{ fontFamily: "var(--font-head)", fontSize: "22px", color: "var(--muted)" }}>🤝 TIE</span>
              ) : (
                <span className="pw-subtitle">GAP: {formatTime(Math.abs(resultA.total_time - resultB.total_time))}</span>
              )}
            </div>
          </>
        )}

        <div className="pw-footer">F1 ANALYTICS · RACE STRATEGY TOOL</div>
      </div>
    </div>
  );
}

export default StrategySimulator;