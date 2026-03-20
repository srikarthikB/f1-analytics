import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import API_BASE from "./config";

/* ── Podium config ────────────────────────────────────────────────────── */
const PODIUM = {
  1: { color: "#FFD700", label: "P1", glow: "rgba(255,215,0,0.12)",  ring: "#FFD70040" },
  2: { color: "#C0C0C0", label: "P2", glow: "rgba(192,192,192,0.08)", ring: "#C0C0C030" },
  3: { color: "#CD7F32", label: "P3", glow: "rgba(205,127,50,0.10)",  ring: "#CD7F3230" },
};

/* ── Position badge ───────────────────────────────────────────────────── */
function PosBadge({ pos }) {
  const pod = PODIUM[pos];

  if (pod) {
    return (
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black font-mono border"
        style={{
          color: pod.color,
          borderColor: pod.ring,
          backgroundColor: pod.glow,
          boxShadow: `0 0 10px ${pod.glow}`,
        }}
      >
        {pos}
      </div>
    );
  }

  return (
    <div className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black font-mono text-zinc-500 border border-white/[0.07] bg-white/[0.02]">
      {pos}
    </div>
  );
}

/* ── Points bar ───────────────────────────────────────────────────────── */
function PointsBar({ points, maxPoints, color }) {
  const pct = maxPoints > 0 ? (points / maxPoints) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-sm font-black font-mono text-white w-10 text-right">{points}</span>
      <div className="flex-1 h-1 rounded-full bg-white/[0.05] overflow-hidden min-w-[60px]">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{
            width: `${pct}%`,
            background: color
              ? `linear-gradient(90deg, ${color}, ${color}88)`
              : "linear-gradient(90deg, #ef4444, #f9731688)",
          }}
        />
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
function Standings() {
  const [data, setData]   = useState([]);
  const location          = useLocation();
  const isConstructor     = location.pathname.includes("constructors");

  useEffect(() => {
    const url = isConstructor
      ? `${API_BASE}/standings/constructors`
      : `${API_BASE}/standings/drivers`;

    fetch(url)
      .then((res) => res.json())
      .then((data) => setData(data));
  }, [isConstructor]);

  const maxPoints = data.length > 0 ? Math.max(...data.map((d) => d.points)) : 0;

  return (
    <div className="min-h-screen bg-[#07070f] relative overflow-hidden">

      {/* ── Ambient glows ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full bg-red-800/[0.06] blur-[130px]" />
        <div className="absolute bottom-0 -right-48 w-[500px] h-[500px] rounded-full bg-zinc-900/40 blur-[100px]" />
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
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-red-500" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500 font-mono">
              2025 Season
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white font-mono leading-none">
            {isConstructor ? "Constructor" : "Driver"}
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              Standings
            </span>
          </h1>
          <p className="mt-3 text-sm text-zinc-500 tracking-widest uppercase font-mono">
            {data.length > 0 ? `${data.length} ${isConstructor ? "Constructors" : "Drivers"} · Active Season` : "Loading…"}
          </p>
          <div className="mt-8 h-px bg-gradient-to-r from-red-500/30 via-white/5 to-transparent" />
        </div>

        {/* ── Leaderboard card ── */}
        <div className="
          relative overflow-hidden rounded-3xl
          bg-gradient-to-br from-[#0f0f1a] to-[#0a0a14]
          border border-white/[0.06]
          shadow-[0_8px_40px_rgba(0,0,0,0.5)]
        ">
          {/* Top accent */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500/60 via-orange-500/20 to-transparent" />

          {/* ── Column headers ── */}
          <div className={`
            grid gap-4 px-6 py-4
            border-b border-white/[0.05]
            text-[10px] font-black tracking-[0.25em] uppercase text-zinc-600 font-mono
            ${isConstructor
              ? "grid-cols-[2.5rem_1fr_140px]"
              : "grid-cols-[2.5rem_1fr_1fr_140px]"}
          `}>
            <span>Pos</span>
            <span>Name</span>
            {!isConstructor && <span>Team</span>}
            <span className="text-right pr-1">Points</span>
          </div>

          {/* ── Rows ── */}
          {data.length === 0 ? (
            <div className="flex flex-col">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-14 mx-4 my-1.5 rounded-xl bg-white/[0.02] animate-pulse"
                  style={{ animationDelay: `${i * 60}ms` }}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col">
              {data.map((item, idx) => {
                const pod      = PODIUM[item.position];
                const isTop3   = !!pod;
                const isLeader = item.position === 1;
                const isEven   = idx % 2 === 0;

                return (
                  <div
                    key={item.position}
                    className={`
                      group relative
                      grid gap-4 px-6 py-4 items-center
                      transition-all duration-200 ease-out
                      cursor-default
                      ${isConstructor
                        ? "grid-cols-[2.5rem_1fr_140px]"
                        : "grid-cols-[2.5rem_1fr_1fr_140px]"}
                      ${isEven ? "bg-white/[0.015]" : ""}
                      ${isTop3
                        ? "hover:bg-white/[0.04]"
                        : "hover:bg-white/[0.03]"}
                    `}
                    style={isTop3 ? {
                      boxShadow: `inset 3px 0 0 ${pod.color}60`,
                    } : {}}
                  >
                    {/* Left edge glow strip on hover (non-podium) */}
                    {!isTop3 && (
                      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-500/0 group-hover:bg-red-500/40 transition-all duration-200 rounded-r" />
                    )}

                    {/* Leader flash bar */}
                    {isLeader && (
                      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/[0.04] to-transparent pointer-events-none" />
                    )}

                    {/* Position badge */}
                    <PosBadge pos={item.position} />

                    {/* Name */}
                    <div className="flex flex-col gap-0.5 min-w-0">
                      <span className={`
                        font-black uppercase tracking-wide font-mono leading-none truncate
                        transition-colors duration-200
                        ${isTop3 ? "text-base" : "text-sm"}
                        ${isLeader ? "text-yellow-100" : "text-white"}
                        group-hover:text-red-100
                      `}
                        style={isTop3 ? { textShadow: `0 0 20px ${pod.color}30` } : {}}
                      >
                        {item.name}
                      </span>
                      {isTop3 && (
                        <span
                          className="text-[9px] font-black tracking-[0.25em] uppercase font-mono"
                          style={{ color: pod.color }}
                        >
                          {pod.label}
                        </span>
                      )}
                    </div>

                    {/* Team (driver standings only) */}
                    {!isConstructor && (
                      <span className="text-xs text-zinc-500 font-mono tracking-wide truncate">
                        {item.team}
                      </span>
                    )}

                    {/* Points + bar */}
                    <PointsBar
                      points={item.points}
                      maxPoints={maxPoints}
                      color={isTop3 ? pod.color : item.color}
                    />
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom fade */}
          <div className="h-4 bg-gradient-to-t from-[#0a0a14]/60 to-transparent" />
        </div>

        {/* ── Podium legend ── */}
        <div className="mt-5 flex items-center justify-center gap-6">
          {Object.entries(PODIUM).map(([pos, cfg]) => (
            <div key={pos} className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: cfg.color, boxShadow: `0 0 6px ${cfg.color}` }}
              />
              <span className="text-[10px] font-mono tracking-widest text-zinc-600 uppercase">
                {cfg.label}
              </span>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="mt-10 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[10px] font-mono tracking-widest text-zinc-700 uppercase">
            F1 Analytics · {isConstructor ? "Constructor" : "Driver"} Standings
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>

      </div>
    </div>
  );
}

export default Standings;