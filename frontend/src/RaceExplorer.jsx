import { useEffect, useState } from "react";
import API_BASE from "./config";

const YEARS = ["2020", "2021", "2022", "2023"];

/* ── Flag emoji helper (fallback to globe) ──────────────────────────── */
function RaceCard({ race, index }) {
  const isFirst = index === 0;
  return (
    <div
      className="
        group relative overflow-hidden rounded-2xl
        bg-gradient-to-br from-[#0f0f1a] via-[#11111e] to-[#0a0a14]
        border border-white/[0.06]
        hover:border-red-500/25
        shadow-[0_4px_20px_rgba(0,0,0,0.4)]
        hover:shadow-[0_0_28px_rgba(239,68,68,0.10),0_6px_24px_rgba(0,0,0,0.5)]
        transition-all duration-300 ease-out
        hover:scale-[1.015]
        cursor-default
      "
    >
      {/* Left accent strip */}
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-600/0 group-hover:bg-red-500/50 transition-all duration-300 rounded-r" />

      {/* Top bar on first card */}
      {isFirst && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-orange-400/50 to-transparent" />
      )}

      {/* Hover sheen */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-r from-white/[0.02] to-transparent transition-opacity duration-300 pointer-events-none" />

      <div className="flex items-center gap-5 px-5 py-4">

        {/* Round badge */}
        <div className="
          flex-shrink-0 flex flex-col items-center justify-center
          w-12 h-12 rounded-xl
          bg-white/[0.04] border border-white/[0.07]
          group-hover:border-red-500/20 group-hover:bg-red-500/[0.05]
          transition-all duration-300
        ">
          <span className="text-[9px] font-black tracking-widest uppercase text-zinc-600 font-mono leading-none">Rd</span>
          <span className="text-lg font-black text-white font-mono leading-none">{race.round}</span>
        </div>

        {/* Race info */}
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <h3 className="
            text-sm font-black uppercase tracking-wide text-white font-mono leading-tight truncate
            group-hover:text-red-100 transition-colors duration-200
          ">
            {race.name}
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            {race.circuit && (
              <span className="text-[11px] text-zinc-500 font-mono tracking-wide truncate max-w-[180px]">
                {race.circuit}
              </span>
            )}
            {race.circuit && race.location && (
              <span className="text-zinc-700 text-xs">·</span>
            )}
            {race.location && (
              <span className="text-[11px] text-zinc-600 font-mono tracking-wide">{race.location}</span>
            )}
          </div>
        </div>

        {/* Right section: date + winner */}
        <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
          {race.date && (
            <span className="text-[11px] font-mono text-zinc-500 tracking-wide">
              {new Date(race.date).toLocaleDateString("en-GB", {
                day: "numeric", month: "short", year: "numeric",
              })}
            </span>
          )}
          {race.winner && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
              <span className="text-[11px] font-black uppercase tracking-widest font-mono text-zinc-300 group-hover:text-red-300 transition-colors duration-200">
                {race.winner}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
function RaceExplorer() {
  const [year, setYear]   = useState("2020");
  const [races, setRaces] = useState([]);

  useEffect(() => {
    fetch(`http://${API_BASE}/races/${year}`)
      .then((response) => response.json())
      .then((data) => setRaces(data));
  }, [year]);

  // ── Calculations (untouched) ─────────────────────────────────────────
  const wins = {};
  races.forEach((race) => {
    const driver = race.winner;
    if (wins[driver]) wins[driver]++;
    else wins[driver] = 1;
  });

  let topDriver = "";
  let maxWins   = 0;
  for (const driver in wins) {
    if (wins[driver] > maxWins) {
      maxWins   = wins[driver];
      topDriver = driver;
    }
  }

  return (
    <div className="min-h-screen bg-[#07070f] relative overflow-hidden">

      {/* ── Ambient glows ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-32 w-[600px] h-[500px] rounded-full bg-red-800/[0.06] blur-[130px]" />
        <div className="absolute bottom-0 -right-40 w-[500px] h-[400px] rounded-full bg-zinc-900/40 blur-[100px]" />
      </div>

      {/* ── Grid texture ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 sm:px-10 py-14">

        {/* ── Page header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-red-500" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500 font-mono">
              Season Explorer
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white font-mono leading-none">
            Race
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              Calendar
            </span>
          </h1>
          <div className="mt-8 h-px bg-gradient-to-r from-red-500/30 via-white/5 to-transparent" />
        </div>

        {/* ── Controls + stat row ── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">

          {/* Year selector tabs */}
          <div className="flex items-center gap-1 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] w-fit">
            {YEARS.map((y) => (
              <button
                key={y}
                onClick={() => setYear(y)}
                className={`
                  px-4 py-2 rounded-lg text-xs font-black tracking-widest uppercase font-mono
                  transition-all duration-200
                  ${year === y
                    ? "bg-red-600 text-white shadow-[0_0_16px_rgba(239,68,68,0.4)]"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]"}
                `}
              >
                {y}
              </button>
            ))}
          </div>

          {/* Race count badge */}
          <div className="flex items-center gap-3">
            {races.length > 0 && (
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                  {races.length} Races
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ── Top driver highlight card ── */}
        {topDriver && (
          <div className="
            relative overflow-hidden rounded-2xl mb-6
            bg-gradient-to-r from-[#1a100a] to-[#0f0f1a]
            border border-red-500/20
            shadow-[0_0_30px_rgba(239,68,68,0.08)]
            px-6 py-4
            flex items-center justify-between gap-4
          ">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 to-transparent" />
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full bg-red-600/[0.08] blur-2xl pointer-events-none" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] font-black tracking-[0.25em] uppercase text-red-500 font-mono">
                Season Dominator
              </span>
              <span className="text-xl font-black uppercase tracking-wide text-white font-mono">
                {topDriver}
              </span>
            </div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-4xl font-black text-white font-mono leading-none">{maxWins}</span>
              <span className="text-sm text-zinc-500 font-mono">
                {maxWins === 1 ? "win" : "wins"}
              </span>
            </div>
          </div>
        )}

        {/* ── Race list ── */}
        {races.length === 0 ? (
          <div className="flex flex-col gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <div
                key={i}
                className="h-[72px] rounded-2xl bg-white/[0.02] border border-white/[0.04] animate-pulse"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {races.map((race, index) => (
              <RaceCard key={race.round} race={race} index={index} />
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-14 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[10px] font-mono tracking-widest text-zinc-700 uppercase">
            F1 Analytics · {year} Race Calendar
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>

      </div>
    </div>
  );
}

export default RaceExplorer;