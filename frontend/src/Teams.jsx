import { useEffect, useState } from "react";
import TeamCard from "./TeamCard";
import API_BASE from "./config";

function Teams() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetch(`http://${API_BASE}/teams`)
      .then((response) => response.json())
      .then((data) => setTeams(data));
  }, []);

  return (
    <div className="min-h-screen bg-[#07070f] relative overflow-hidden">

      {/* ── Ambient glow blobs ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -right-48 w-[600px] h-[600px] rounded-full bg-red-800/[0.06] blur-[130px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[500px] rounded-full bg-red-900/[0.04] blur-[110px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full bg-zinc-900/40 blur-[90px]" />
      </div>

      {/* ── Grid texture ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage:
            "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 py-14">

        {/* ── Page header ── */}
        <div className="mb-12">

          {/* Eyebrow */}
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-red-500" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500 font-mono">
              2025 Season
            </span>
          </div>

          {/* Title + search row */}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white font-mono leading-none">
                Constructors
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
                  Championship
                </span>
              </h1>
              <p className="mt-3 text-sm text-zinc-500 tracking-widest uppercase font-mono">
                {teams.length > 0
                  ? `${teams.length} Constructors · Active Season`
                  : "Loading grid…"}
              </p>
            </div>

            {/* Search bar UI */}
            <div className="relative w-full sm:w-72 flex-shrink-0">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search team…"
                readOnly
                className="
                  w-full pl-10 pr-14 py-2.5
                  bg-white/[0.04] border border-white/[0.07]
                  rounded-xl text-sm text-zinc-300
                  placeholder:text-zinc-600 font-mono tracking-wide
                  focus:outline-none focus:border-red-500/40 focus:bg-white/[0.06]
                  transition-all duration-200 cursor-text
                "
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-zinc-700 font-mono border border-zinc-700/60 rounded px-1.5 py-0.5">
                ⌘K
              </span>
            </div>
          </div>

          {/* Standings header bar */}
          <div className="mt-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-gradient-to-r from-red-500/30 via-white/5 to-transparent" />
            <div className="flex items-center gap-6 text-[10px] font-black tracking-[0.2em] uppercase font-mono text-zinc-600">
              <span>Team</span>
              <span>Points</span>
              <span>Standing</span>
            </div>
          </div>
        </div>

        {/* ── Team Grid ── */}
        {teams.length === 0 ? (
          /* Skeleton loading */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-40 rounded-2xl bg-white/[0.03] border border-white/[0.05] animate-pulse"
                style={{ animationDelay: `${i * 60}ms` }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {teams.map((team, index) => (
              <div
                key={team.id}
                className="group relative"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Position badge — floats top-left outside the card */}
                <div className="
                  absolute -top-2.5 -left-2.5 z-10
                  w-7 h-7 rounded-full
                  bg-[#0f0f1a] border border-white/[0.1]
                  flex items-center justify-center
                  text-[10px] font-black font-mono
                  text-zinc-500 shadow-lg
                  transition-colors duration-300
                  group-hover:border-red-500/40 group-hover:text-red-400
                ">
                  {index + 1}
                </div>

                <TeamCard team={team} />
              </div>
            ))}
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-16 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[10px] font-mono tracking-widest text-zinc-700 uppercase">
            F1 Analytics · Constructors Data
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>

      </div>
    </div>
  );
}

export default Teams;