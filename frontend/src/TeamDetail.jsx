import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API_BASE from "./config";

/* ── Stat card ───────────────────────────────────────────────────────── */
function StatCard({ label, value, unit, sub, accent = "#ef4444" }) {
  return (
    <div className="
      group relative overflow-hidden rounded-2xl
      bg-gradient-to-br from-[#0f0f1a] to-[#0a0a14]
      border border-white/[0.06]
      hover:border-red-500/30
      shadow-[0_4px_24px_rgba(0,0,0,0.4)]
      hover:shadow-[0_0_28px_rgba(239,68,68,0.1)]
      transition-all duration-300 ease-out
      p-6 flex flex-col gap-2
    ">
      {/* Top accent */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }}
      />
      {/* Glow blob */}
      <div
        className="absolute -top-6 -left-6 w-24 h-24 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: `${accent}18` }}
      />
      <span className="text-[10px] font-black tracking-[0.25em] uppercase text-zinc-500 font-mono">
        {label}
      </span>
      <div className="flex items-baseline gap-1.5 mt-1">
        <span className="text-3xl font-black text-white font-mono leading-none tracking-tight">
          {value ?? "—"}
        </span>
        {unit && (
          <span className="text-xs text-zinc-500 font-mono">{unit}</span>
        )}
      </div>
      {sub && (
        <span className="text-xs text-zinc-600 font-mono tracking-widest uppercase">{sub}</span>
      )}
    </div>
  );
}

/* ── Driver roster card ──────────────────────────────────────────────── */
function DriverRosterCard({ driver, teamColor }) {
  const color = teamColor || "#ef4444";
  return (
    <div className="
      group relative overflow-hidden rounded-2xl
      bg-gradient-to-br from-[#0f0f1a] via-[#11111e] to-[#0a0a14]
      border border-white/[0.06]
      hover:border-white/[0.12]
      shadow-[0_4px_20px_rgba(0,0,0,0.4)]
      transition-all duration-300 ease-out
      hover:scale-[1.02]
      p-5
    "
      style={{ "--color": color }}
    >
      {/* Top bar */}
      <div
        className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${color}, transparent)` }}
      />
      {/* Ghost number */}
      {driver.number && (
        <span
          className="absolute -bottom-2 -right-1 text-[5rem] font-black font-mono leading-none select-none pointer-events-none opacity-[0.05] group-hover:opacity-[0.09] transition-opacity duration-300"
          style={{ color }}
        >
          {driver.number}
        </span>
      )}

      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          {driver.firstName && (
            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-zinc-500 font-mono">
              {driver.firstName}
            </span>
          )}
          <h3 className="text-lg font-black uppercase tracking-wide text-white font-mono leading-none group-hover:text-red-100 transition-colors duration-200">
            {driver.lastName ?? driver.name}
          </h3>
          {driver.nationality && (
            <span className="text-[10px] tracking-widest uppercase text-zinc-600 font-mono">
              {driver.nationality}
            </span>
          )}
        </div>

        {/* Number badge */}
        {driver.number && (
          <div
            className="flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-xl border text-lg font-black font-mono"
            style={{
              borderColor: `${color}30`,
              color,
              backgroundColor: `${color}10`,
            }}
          >
            {driver.number}
          </div>
        )}
      </div>

      {/* Points row */}
      {driver.points !== undefined && (
        <div className="relative z-10 flex items-center justify-between mt-4 pt-3 border-t border-white/[0.05]">
          <span className="text-[10px] tracking-[0.2em] uppercase text-zinc-600 font-mono">Season Points</span>
          <div className="flex items-baseline gap-1">
            <span className="text-sm font-black text-white font-mono group-hover:text-red-300 transition-colors duration-200">
              {driver.points}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-mono">pts</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────────── */
function TeamDetail() {
  const [team, setTeam] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    fetch(`${API_BASE}/team/${id}`)
      .then((res) => res.json())
      .then((data) => setTeam(data));
  }, [id]);

  if (!team)
    return (
      <div className="min-h-screen bg-[#07070f] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
          <p className="text-zinc-600 font-mono text-xs tracking-widest uppercase">
            Loading constructor data…
          </p>
        </div>
      </div>
    );

  const teamColor  = team.color  || "#ef4444";
  const drivers    = team.drivers || [];

  return (
    <div className="min-h-screen bg-[#07070f] relative overflow-hidden">

      {/* ── Ambient glows ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[130px] opacity-[0.07]"
          style={{ backgroundColor: teamColor }}
        />
        <div className="absolute top-1/2 -right-48 w-[400px] h-[400px] rounded-full bg-zinc-800/30 blur-[100px]" />
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

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 py-14">

        {/* ── Breadcrumb ── */}
        <div className="flex items-center gap-2 mb-10">
          <span className="h-px w-8 bg-red-500" />
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500 font-mono">
            Constructors Championship
          </span>
          <span className="text-zinc-700 font-mono text-xs">›</span>
          <span className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-500 font-mono">
            {team.name}
          </span>
        </div>

        {/* ── Hero header card ── */}
        <div className="
          relative overflow-hidden rounded-3xl mb-8
          bg-gradient-to-br from-[#0f0f1a] via-[#11111e] to-[#0a0a14]
          border border-white/[0.06]
          shadow-[0_8px_40px_rgba(0,0,0,0.5)]
          p-8 sm:p-10
        ">
          {/* Team-color top bar */}
          <div
            className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: `linear-gradient(90deg, ${teamColor}, transparent)` }}
          />

          {/* Ghost team name watermark */}
          <div
            className="absolute right-6 top-4 text-[5.5rem] font-black font-mono leading-none select-none pointer-events-none uppercase opacity-[0.03]"
            style={{ color: teamColor }}
          >
            {team.shortName ?? team.name}
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="flex flex-col gap-2">
              {team.shortName && (
                <span className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-500 font-mono">
                  {team.shortName}
                </span>
              )}
              <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white font-mono leading-none">
                {team.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                {/* Color dot */}
                <span
                  className="w-2.5 h-2.5 rounded-full ring-2 ring-black"
                  style={{ backgroundColor: teamColor }}
                />
                {team.base && (
                  <span className="text-sm text-zinc-500 tracking-widest uppercase font-mono">
                    {team.base}
                  </span>
                )}
                {team.founded && (
                  <>
                    <span className="text-zinc-700 font-mono text-xs">·</span>
                    <span className="text-sm text-zinc-500 tracking-widest uppercase font-mono">
                      Est. {team.founded}
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Points hero */}
            <div className="flex flex-col items-start sm:items-end gap-1">
              <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-600 font-mono">
                Championship Points
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-white font-mono leading-none">
                  {team.points}
                </span>
                <span className="text-sm text-zinc-500 font-mono">pts</span>
              </div>
              {team.position && (
                <span
                  className="text-xs font-black tracking-widest font-mono"
                  style={{ color: teamColor }}
                >
                  P{team.position} · Constructors
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Race Wins"
            value={team.wins}
            sub="This season"
            accent={teamColor}
          />
          <StatCard
            label="Podiums"
            value={team.podiums}
            sub="This season"
            accent="#f97316"
          />
          <StatCard
            label="Pole Positions"
            value={team.poles}
            sub="This season"
            accent="#eab308"
          />
          <StatCard
            label="Fastest Laps"
            value={team.fastestLaps}
            sub="This season"
            accent="#06b6d4"
          />
        </div>

        {/* ── Driver roster ── */}
        {drivers.length > 0 && (
          <div className="
            relative overflow-hidden rounded-3xl
            bg-gradient-to-br from-[#0f0f1a] to-[#0a0a14]
            border border-white/[0.06]
            shadow-[0_8px_40px_rgba(0,0,0,0.4)]
            p-8
          ">
            {/* Top bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, ${teamColor}80, transparent)` }}
            />

            {/* Section header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-[10px] font-black tracking-[0.25em] uppercase font-mono mb-1" style={{ color: teamColor }}>
                  Roster
                </p>
                <h2 className="text-lg font-black uppercase tracking-wide text-white font-mono">
                  Race Drivers
                </h2>
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.06]">
                <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: teamColor }} />
                <span className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase">
                  {drivers.length} Active
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {drivers.map((driver) => (
                <DriverRosterCard
                  key={driver.id ?? driver.name}
                  driver={driver}
                  teamColor={teamColor}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-14 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[10px] font-mono tracking-widest text-zinc-700 uppercase">
            F1 Analytics · Constructor Profile
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>

      </div>
    </div>
  );
}

export default TeamDetail;