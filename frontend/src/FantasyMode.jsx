import { useEffect, useState } from "react";
import API_BASE from "./config";

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

  useEffect(() => {
    fetch(`${API_BASE}/sessions`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const currentYear = new Date().getFullYear();
        const filtered = data.filter(s => s.year === currentYear);
        setSessions(filtered);
        if (filtered.length > 0) setSelectedSession(String(filtered[0].session_key));
      });
  }, []);

  useEffect(() => {
    if (!selectedSession) return;

    Promise.all([
      fetch(`${API_BASE}/drivers?session_key=${selectedSession}`).then(r => r.json()),
      fetch(`${API_BASE}/teams`).then(r => r.json()),
    ]).then(([driversData, teamsData]) => {
      if (Array.isArray(driversData)) setAllDrivers(driversData);
      if (Array.isArray(teamsData)) setAllTeams(teamsData);
    });
  }, [selectedSession]);

  const updateDriver = (index, value) => {
    const updated = [...pickedDrivers];
    updated[index] = value;
    setPickedDrivers(updated);
  };

  const calculate = async () => {
    const validDrivers = pickedDrivers.filter(d => d !== "");
    if (validDrivers.length !== REQUIRED_DRIVERS) {
      setError("Select 3 drivers");
      return;
    }
    if (!pickedTeam) {
      setError("Select a team");
      return;
    }

    setLoading(true);
    setError(null);

    const res = await fetch(
      `${API_BASE}/fantasy_score?session_key=${selectedSession}&driver_numbers=${validDrivers.join(",")}&team_name=${pickedTeam}`
    );
    const data = await res.json();
    setResult(data);
    setLoading(false);
  };

  const getDriverName = (number) => {
    const driver = allDrivers.find(d => String(d.driver_number) === String(number));
    return driver ? driver.full_name : null;
  };

  const getTeamName = () => {
    return pickedTeam || null;
  };

  if (loading && result === null) return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070f]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
        <p className="font-mono text-xs tracking-widest uppercase text-zinc-600">CALCULATING FANTASY SCORE…</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-red-700/[0.06] blur-[120px]" />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full bg-red-900/[0.05] blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-zinc-800/20 blur-[80px]" />
      </div>

      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 py-14">

        {/* Header */}
        <div className="mb-12">
          <div className="pw-eyebrow">FANTASY LEAGUE</div>
          <h1 className="pw-title">
            FANTASY
            <span className="pw-title-red">MODE</span>
          </h1>
          <p className="pw-subtitle">BUILD YOUR TEAM · SCORE POINTS</p>
          <div className="pw-divider" />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* Session & Team Section */}
          <div className="lg:col-span-1 flex flex-col gap-6">

            {/* Session Card */}
            <div className="relative group rounded-xl border border-white/[0.07] overflow-hidden transition-all duration-200 hover:border-white/[0.15] hover:shadow-lg hover:shadow-black/40"
              style={{
                background: "rgba(15, 17, 23, 0.85)",
                backdropFilter: "blur(6px)",
              }}>
              <div className="p-6">
                <p className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-500 font-mono mb-3">Session</p>
                <select value={selectedSession} onChange={e => setSelectedSession(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-mono tracking-wide border focus:outline-none transition-all duration-200
                    bg-white/[0.04] border-white/[0.07] text-zinc-300 placeholder:text-zinc-600 focus:border-red-500/40">
                  {sessions.map(s => (
                    <option key={s.session_key} value={s.session_key}>
                      {s.country_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Team Card */}
            <div className="relative group rounded-xl border border-white/[0.07] overflow-hidden transition-all duration-200 hover:border-white/[0.15] hover:shadow-lg hover:shadow-black/40"
              style={{
                background: "rgba(15, 17, 23, 0.85)",
                backdropFilter: "blur(6px)",
              }}>
              <div className="p-6">
                <p className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-500 font-mono mb-3">Constructor</p>
                <select value={pickedTeam} onChange={e => setPickedTeam(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-lg text-sm font-mono tracking-wide border focus:outline-none transition-all duration-200
                    bg-white/[0.04] border-white/[0.07] text-zinc-300 placeholder:text-zinc-600 focus:border-red-500/40">
                  <option value="">Select Constructor</option>
                  {allTeams.map(t => (
                    <option key={t.name} value={t.name}>{t.name}</option>
                  ))}
                </select>
                {pickedTeam && (
                  <div className="mt-4 pt-4 border-t border-white/[0.07]">
                    <p className="text-xs font-mono tracking-wider uppercase text-zinc-500">Selected</p>
                    <p className="text-sm font-mono text-white mt-1">{pickedTeam}</p>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Drivers Selection Section */}
          <div className="lg:col-span-2 flex flex-col gap-4">

            {pickedDrivers.map((val, i) => {
              const driverName = getDriverName(val);
              const slotLabel = ["First", "Second", "Third"];

              return (
                <div key={i} className="relative group rounded-xl border border-white/[0.07] overflow-hidden transition-all duration-200 hover:border-white/[0.15] hover:shadow-lg hover:shadow-black/40"
                  style={{
                    background: "rgba(15, 17, 23, 0.85)",
                    backdropFilter: "blur(6px)",
                  }}>
                  <div className="p-5 flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-white/[0.08] border border-white/[0.07]">
                        <span className="text-xs font-black text-red-500 font-mono">{i + 1}</span>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black tracking-[0.2em] uppercase text-zinc-600 font-mono mb-1">{slotLabel[i]} Driver</p>
                      <select value={val} onChange={e => updateDriver(i, e.target.value)}
                        className="w-full px-3 py-2 rounded-lg text-sm font-mono tracking-wide border focus:outline-none transition-all duration-200
                          bg-white/[0.04] border-white/[0.07] text-zinc-300 placeholder:text-zinc-600 focus:border-red-500/40">
                        <option value="">Select Driver</option>
                        {allDrivers.map(d => (
                          <option key={d.driver_number} value={d.driver_number}>
                            {d.full_name}
                          </option>
                        ))}
                      </select>
                    </div>

                    {driverName && (
                      <div className="flex-shrink-0">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-500/[0.08] border border-red-500/20">
                          <div className="w-2 h-2 rounded-full bg-red-500" />
                          <span className="text-xs font-mono text-red-400 tracking-wide">{driverName}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

          </div>

        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 relative group rounded-xl border border-red-500/30 overflow-hidden p-4"
            style={{
              background: "rgba(220, 38, 38, 0.05)",
              backdropFilter: "blur(6px)",
            }}>
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500" />
              <p className="text-sm font-mono tracking-wide text-red-400">{error}</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <button onClick={calculate}
          disabled={loading}
          className="w-full mb-12 py-3.5 px-6 rounded-xl font-mono font-black tracking-wider uppercase text-sm transition-all duration-200
            bg-red-500 hover:bg-red-600 text-white disabled:opacity-50 disabled:cursor-not-allowed
            border border-transparent hover:border-red-400/20
            shadow-lg shadow-red-500/20 hover:shadow-red-500/30">
          {loading ? "Computing Score..." : "Calculate Fantasy Score"}
        </button>

        {/* Results Section */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-4">
              <div className="flex items-center gap-2">
                <span className="h-px w-8 bg-red-500" />
                <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500 font-mono">Results</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">

              {/* Total Score Card */}
              <div className="relative group rounded-xl border border-white/[0.07] overflow-hidden transition-all duration-200 hover:border-white/[0.15] hover:shadow-lg hover:shadow-black/40"
                style={{
                  background: "rgba(15, 17, 23, 0.85)",
                  backdropFilter: "blur(6px)",
                }}>
                <div className="p-8">
                  <p className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-500 font-mono mb-4">Total Fantasy Score</p>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black font-mono text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
                      {result.total_score}
                    </span>
                    <span className="text-sm font-mono text-zinc-600 uppercase tracking-widest">pts</span>
                  </div>
                </div>
              </div>

              {/* Selection Summary Card */}
              <div className="relative group rounded-xl border border-white/[0.07] overflow-hidden transition-all duration-200 hover:border-white/[0.15] hover:shadow-lg hover:shadow-black/40"
                style={{
                  background: "rgba(15, 17, 23, 0.85)",
                  backdropFilter: "blur(6px)",
                }}>
                <div className="p-8">
                  <p className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-500 font-mono mb-4">Team Configuration</p>
                  <div className="space-y-2">
                    <div>
                      <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-1">Constructor</p>
                      <p className="text-sm font-mono text-white">{getTeamName()}</p>
                    </div>
                    <div className="pt-2 border-t border-white/[0.07]">
                      <p className="text-xs font-mono tracking-widest uppercase text-zinc-600 mb-2">Drivers</p>
                      <div className="space-y-1.5">
                        {pickedDrivers.map((num, idx) => {
                          const name = getDriverName(num);
                          return name ? (
                            <div key={idx} className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                              <span className="text-xs font-mono text-zinc-400">{name}</span>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Reset Button */}
            <button onClick={() => {
              setResult(null);
              setError(null);
            }}
              className="w-full py-2.5 px-6 rounded-xl font-mono font-black tracking-wider uppercase text-xs transition-all duration-200
                bg-white/[0.05] hover:bg-white/[0.08] text-zinc-400 hover:text-white
                border border-white/[0.07] hover:border-white/[0.15]">
              Reset
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-700">
            F1 Analytics · Fantasy League
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>

      </div>
    </div>
  );
}

export default FantasyMode;