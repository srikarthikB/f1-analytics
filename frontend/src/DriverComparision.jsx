import { useEffect, useState } from "react";
import API_BASE from "./config";

const CURRENT_YEAR = new Date().getFullYear();

/* ── VS Divider (from old UI) ─────────────────────────────────────────── */
function VsDivider() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4 sm:py-0 sm:px-2">
      <div className="hidden sm:block h-16 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center
          text-[11px] font-black tracking-widest font-mono border
          bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border-white/[0.1] text-zinc-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]"
      >
        VS
      </div>
      <div className="hidden sm:block h-16 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
    </div>
  );
}

function DriverComparision() {
  /* ── NEW logic: all state & API calls preserved exactly ── */
  const [allDrivers, setAllDrivers]     = useState([]);
  const [driver1Id, setDriver1Id]       = useState("");
  const [driver2Id, setDriver2Id]       = useState("");
  const [stats1, setStats1]             = useState(null);
  const [stats2, setStats2]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/drivers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length >= 2) {
          setAllDrivers(data);
          setDriver1Id(String(data[0].driver_number));
          setDriver2Id(String(data[1].driver_number));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!driver1Id || !driver2Id || driver1Id === driver2Id) return;
    setStatsLoading(true);
    fetch(`${API_BASE}/compare-fast?driver1=${driver1Id}&driver2=${driver2Id}&year=${CURRENT_YEAR}`)
      .then(res => res.json())
      .then(data => {
        setStats1(data.driver1 || {});
        setStats2(data.driver2 || {});
        setStatsLoading(false);
      })
      .catch(() => setStatsLoading(false));
  }, [driver1Id, driver2Id]);

  const d1 = allDrivers.find(d => String(d.driver_number) === driver1Id);
  const d2 = allDrivers.find(d => String(d.driver_number) === driver2Id);

  const whoBetter = (v1, v2, lowerIsBetter = false) => {
    if (v1 == null || v2 == null || v1 === v2) return 0;
    return lowerIsBetter ? (v1 < v2 ? 1 : 2) : (v1 > v2 ? 1 : 2);
  };

  if (loading) return <div className="pw-loading">INITIALIZING COMPARISON...</div>;

  /* ── OLD UI layout ── */
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "var(--bg)" }}>

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[130px]"
          style={{ background: "rgba(225,6,0,0.05)" }} />
        <div className="absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full blur-[110px]"
          style={{ background: "rgba(30,58,138,0.05)" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full blur-[80px]"
          style={{ background: "rgba(30,30,30,0.2)" }} />
      </div>

      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(var(--white) 1px,transparent 1px),linear-gradient(90deg,var(--white) 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-10 py-14">

        {/* Header */}
        <div className="mb-10">
          <div className="pw-eyebrow">Head-to-Head</div>
          <h1 className="pw-title">
            Driver
            <span className="pw-title-red block">Comparison</span>
          </h1>
          <p className="pw-subtitle mt-3">Head-to-head career statistics</p>
          <div className="pw-divider" />
        </div>

        {/* Selector row */}
        <div className="pw-card mb-8 p-6 sm:p-7" style={{ borderTop: "2px solid var(--border-red)" }}>
          <p className="pw-subtitle mb-4">Select Drivers</p>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
            <select className="pw-select w-full" value={driver1Id} onChange={e => setDriver1Id(e.target.value)}>
              {allDrivers.map(d => <option key={d.driver_number} value={d.driver_number}>{d.full_name}</option>)}
            </select>
            <div className="flex items-center justify-center">
              <span className="font-mono text-[11px] font-black tracking-widest border rounded-lg px-3 py-2"
                style={{ color: "var(--muted)", borderColor: "var(--border)" }}>VS</span>
            </div>
            <select className="pw-select w-full" value={driver2Id} onChange={e => setDriver2Id(e.target.value)}>
              {allDrivers.map(d => <option key={d.driver_number} value={d.driver_number}>{d.full_name}</option>)}
            </select>
          </div>
        </div>

        {statsLoading ? (
          <div className="pw-loading">CALCULATING DELTAS...</div>
        ) : (
          <>
            {/* Driver cards */}
            <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0">
              {/* Driver 1 */}
              <div className="group relative overflow-hidden flex-1 rounded-3xl sm:rounded-r-none sm:rounded-l-3xl border transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg) 100%)",
                  borderColor: "var(--border)",
                  borderTop: `3px solid ${d1?.team_colour || "var(--red)"}`,
                }}>
                {/* Glow */}
                <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-30"
                  style={{ backgroundColor: d1?.team_colour || "var(--red)" }} />
                {/* Ghost number */}
                <div className="absolute -bottom-4 -right-2 font-black leading-none select-none pointer-events-none opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-300"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "9rem", color: d1?.team_colour || "var(--red)" }}>
                  {d1?.driver_number}
                </div>

                <div className="relative z-10 p-7 sm:p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className="pw-subtitle">Driver 1</span>
                      <h2 className="pw-title mt-1" style={{ fontSize: "clamp(22px,4vw,28px)" }}>{d1?.full_name}</h2>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d1?.team_colour || "var(--red)" }} />
                        <span className="pw-subtitle">{d1?.team_name}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl border font-black"
                      style={{
                        fontFamily: "var(--font-mono)", fontSize: "18px",
                        borderColor: `${d1?.team_colour || "var(--red)"}30`,
                        color: d1?.team_colour || "var(--red)",
                        backgroundColor: `${d1?.team_colour || "var(--red)"}10`,
                      }}>
                      {d1?.driver_number}
                    </div>
                  </div>

                  <div className="h-px mb-4 opacity-20" style={{ background: `linear-gradient(90deg, ${d1?.team_colour || "var(--red)"}, transparent)` }} />

                  {/* Stats */}
                  {[
                    { label: "CHAMPIONSHIP POINTS", v1: stats1?.points,      v2: stats2?.points,      low: false },
                    { label: "GRID POSITION",        v1: stats1?.position,   v2: stats2?.position,    low: true  },
                    { label: "CONSISTENCY SCORE",    v1: stats1?.consistency, v2: stats2?.consistency, low: true  },
                    { label: "LAST RACE FINISH",     v1: stats1?.last_finish, v2: stats2?.last_finish, low: true  },
                  ].map((row, i) => {
                    const winner = whoBetter(row.v1, row.v2, row.low);
                    const isBetter = winner === 1;
                    const isWorse  = winner === 2;
                    return (
                      <div key={i} className="flex flex-col gap-1 py-4 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                        <span className="pw-subtitle">{row.label}</span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold transition-colors duration-300"
                            style={{
                              fontFamily: "var(--font-mono)", fontSize: "22px",
                              color: isBetter ? "#22c55e" : isWorse ? "var(--red)" : "var(--white)",
                            }}>
                            {row.v1 ?? "—"}
                          </span>
                          {isBetter && <span className="pw-subtitle" style={{ color: "#22c55e" }}>▲ BEST</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <VsDivider />

              {/* Driver 2 */}
              <div className="group relative overflow-hidden flex-1 rounded-3xl sm:rounded-l-none sm:rounded-r-3xl border transition-all duration-300"
                style={{
                  background: "linear-gradient(135deg, var(--bg-card) 0%, var(--bg) 100%)",
                  borderColor: "var(--border)",
                  borderTop: `3px solid ${d2?.team_colour || "var(--red)"}`,
                }}>
                <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none transition-opacity duration-500 group-hover:opacity-30"
                  style={{ backgroundColor: d2?.team_colour || "var(--red)" }} />
                <div className="absolute -bottom-4 -left-2 font-black leading-none select-none pointer-events-none opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-300"
                  style={{ fontFamily: "var(--font-mono)", fontSize: "9rem", color: d2?.team_colour || "var(--red)" }}>
                  {d2?.driver_number}
                </div>

                <div className="relative z-10 p-7 sm:p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <span className="pw-subtitle">Driver 2</span>
                      <h2 className="pw-title mt-1" style={{ fontSize: "clamp(22px,4vw,28px)" }}>{d2?.full_name}</h2>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: d2?.team_colour || "var(--red)" }} />
                        <span className="pw-subtitle">{d2?.team_name}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl border font-black"
                      style={{
                        fontFamily: "var(--font-mono)", fontSize: "18px",
                        borderColor: `${d2?.team_colour || "var(--red)"}30`,
                        color: d2?.team_colour || "var(--red)",
                        backgroundColor: `${d2?.team_colour || "var(--red)"}10`,
                      }}>
                      {d2?.driver_number}
                    </div>
                  </div>

                  <div className="h-px mb-4 opacity-20" style={{ background: `linear-gradient(90deg, ${d2?.team_colour || "var(--red)"}, transparent)` }} />

                  {[
                    { label: "CHAMPIONSHIP POINTS", v1: stats1?.points,       v2: stats2?.points,      low: false },
                    { label: "GRID POSITION",        v1: stats1?.position,    v2: stats2?.position,    low: true  },
                    { label: "CONSISTENCY SCORE",    v1: stats1?.consistency, v2: stats2?.consistency, low: true  },
                    { label: "LAST RACE FINISH",     v1: stats1?.last_finish, v2: stats2?.last_finish, low: true  },
                  ].map((row, i) => {
                    const winner = whoBetter(row.v1, row.v2, row.low);
                    const isBetter = winner === 2;
                    const isWorse  = winner === 1;
                    return (
                      <div key={i} className="flex flex-col gap-1 py-4 border-b last:border-0" style={{ borderColor: "var(--border)" }}>
                        <span className="pw-subtitle">{row.label}</span>
                        <div className="flex items-baseline gap-2">
                          <span className="font-bold transition-colors duration-300"
                            style={{
                              fontFamily: "var(--font-mono)", fontSize: "22px",
                              color: isBetter ? "#22c55e" : isWorse ? "var(--red)" : "var(--white)",
                            }}>
                            {row.v2 ?? "—"}
                          </span>
                          {isBetter && <span className="pw-subtitle" style={{ color: "#22c55e" }}>▲ BEST</span>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-6">
              {[
                ["#22c55e", "Better value"],
                ["var(--red)", "Lower value"],
                ["var(--muted2)", "Equal"],
              ].map(([c, l]) => (
                <div key={l} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: c }} />
                  <span className="pw-subtitle">{l}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="pw-footer">F1 Analytics · Comparison Tool</div>
      </div>
    </div>
  );
}

export default DriverComparision;