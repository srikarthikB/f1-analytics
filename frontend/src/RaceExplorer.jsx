import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "./config";

function RaceCard({ race, index, onClick }) {
  const isFirst = index === 0;
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border transition-all duration-300 ease-out hover:scale-[1.015] cursor-pointer
        bg-gradient-to-br from-[#0f0f1a] via-[#11111e] to-[#0a0a14]
        border-white/[0.06] hover:border-red-500/25
        shadow-[0_4px_20px_rgba(0,0,0,0.4)]
        hover:shadow-[0_0_28px_rgba(239,68,68,0.10),0_6px_24px_rgba(0,0,0,0.5)]"
      onClick={onClick}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-600/0 group-hover:bg-red-500/50 transition-all duration-300 rounded-r" />
      {isFirst && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-orange-400/50 to-transparent" />
      )}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-white/[0.02] to-transparent" />

      <div className="flex items-center gap-5 px-5 py-4">
        {/* Round badge */}
        <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl border transition-all duration-300
          group-hover:border-red-500/20 group-hover:bg-red-500/[0.05]
          bg-white/[0.04] border-white/[0.07]">
          <span className="text-[9px] font-black tracking-widest uppercase font-mono leading-none text-zinc-600">Rd</span>
          <span className="text-lg font-black font-mono leading-none text-white">{race.round}</span>
        </div>

        {/* Race name + circuit */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <h3 className="text-sm font-black uppercase tracking-wide font-mono leading-tight truncate
            transition-colors duration-200 group-hover:text-red-500 text-white">
            {race.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {race.circuit && (
              <span className="text-[11px] font-mono tracking-wide truncate max-w-[180px] text-zinc-500">
                {race.circuit}
              </span>
            )}
            {race.circuit && race.location && (
              <span className="text-xs text-zinc-700">·</span>
            )}
            {race.location && (
              <span className="text-[11px] font-mono tracking-wide text-zinc-600">{race.location}</span>
            )}
          </div>
        </div>

        {/* Date + winner */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
          {race.date && (
            <span className="text-[11px] font-mono tracking-wide text-zinc-500">
              {new Date(race.date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
          {race.winner && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-widest font-mono
                group-hover:text-red-500 transition-colors duration-200 text-zinc-300">
                {race.winner}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function RaceExplorer() {
  const [year, setYear]       = useState("");
  const [years, setYears]     = useState([]);
  const [races, setRaces]     = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState(null);
  const [racesCache, setRacesCache] = useState({});

  const navigate = useNavigate();

  // Fetch available years from sessions
  useEffect(() => {
    fetch(`${API_BASE}/sessions`)
      .then(res => res.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const uniqueYears = [...new Set(data.map(s => s.year))].sort((a, b) => b - a);
        setYears(uniqueYears.map(String));
        if (uniqueYears.length > 0) setYear(String(uniqueYears[0]));
      });
  }, []);

  // Fetch races for selected year (with cache)
  useEffect(() => {
    if (!year) return;
    if (racesCache[year]) { setRaces(racesCache[year]); return; }
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/races/${year}`)
      .then(res => res.json())
      .then(data => {
        const result = Array.isArray(data) ? data : [];
        setRaces(result);
        setRacesCache(prev => ({ ...prev, [year]: result }));
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [year]);

  // Season dominator calculation (from new logic)
  const winnerCounts = races.reduce((acc, r) => {
    if (r.winner) acc[r.winner] = (acc[r.winner] || 0) + 1;
    return acc;
  }, {});
  const dominator = Object.entries(winnerCounts).sort((a, b) => b[1] - a[1])[0];

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#07070f]">

      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-32 w-[600px] h-[500px] rounded-full bg-red-800/[0.06] blur-[130px]" />
        <div className="absolute bottom-0 -right-40 w-[500px] h-[400px] rounded-full bg-zinc-900/40 blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 sm:px-10 py-14">

        {/* Header */}
        <div className="mb-10">
          <div className="pw-eyebrow">{year} SEASON</div>
          <h1 className="pw-title">
            RACES
            <span className="pw-title-red">CALENDAR</span>
          </h1>
          <p className="pw-subtitle">ALL GRAND PRIX EVENTS</p>
          <div className="pw-divider" />
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-1 p-1 rounded-xl w-fit border bg-white/[0.03] border-white/[0.06]">
            {years.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`px-4 py-2 rounded-lg text-xs font-black tracking-widest uppercase font-mono transition-all duration-200
                  ${year === y
                    ? "bg-red-600 text-white shadow-[0_0_16px_rgba(239,68,68,0.35)]"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"
                  }`}
              >
                {y}
              </button>
            ))}
          </div>
          {races.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white/[0.04] border-white/[0.06]">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-400">{races.length} Races</span>
            </div>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-[72px] rounded-2xl animate-pulse border bg-white/[0.02] border-white/[0.04]"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        )}

        {/* Error state */}
        {error && (
          <div className="pw-error">Error: {error}</div>
        )}

        {/* Content */}
        {!loading && !error && races.length > 0 && (
          <>
            {/* Season dominator banner */}
            {dominator && (
              <div className="relative overflow-hidden rounded-2xl mb-6 border px-6 py-4
                flex items-center justify-between gap-4
                bg-gradient-to-r from-[#1a100a] to-[#0f0f1a] border-red-500/20 shadow-[0_0_30px_rgba(239,68,68,0.08)]">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 to-transparent" />
                <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-red-600/[0.08] blur-2xl pointer-events-none" />
                <div className="flex flex-col gap-0.5">
                  <span className="text-[10px] font-black tracking-[0.25em] uppercase text-red-500 font-mono">Season Dominator</span>
                  <span className="text-xl font-black uppercase tracking-wide font-mono text-white">{dominator[0]}</span>
                </div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl font-black font-mono leading-none text-white">{dominator[1]}</span>
                  <span className="text-sm font-mono text-zinc-500">{dominator[1] === 1 ? "win" : "wins"}</span>
                </div>
              </div>
            )}

            {/* Race list */}
            <div className="flex flex-col gap-2">
              {races.map((race, index) => (
                <RaceCard
                  key={race.session_key}
                  race={race}
                  index={index}
                  onClick={() => navigate(`/race/${race.session_key}`)}
                />
              ))}
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !error && races.length === 0 && year && (
          <div className="pw-loading">No races found for {year}.</div>
        )}

        {/* Footer */}
        <div className="mt-14 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-700">
            F1 Analytics · {year} Race Calendar
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default RaceExplorer;