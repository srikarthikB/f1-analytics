import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "./ThemeContext";
import API_BASE from "./config";

/* ── Stat card ───────────────────────────────────────────────────────────── */
function StatCard({ label, value, sub, accent = "#ef4444", dark }) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl border
      transition-all duration-300 ease-out p-6 flex flex-col gap-2
      ${dark
        ? `bg-gradient-to-br from-[#0f0f1a] to-[#0a0a14]
           border-white/[0.06] hover:border-red-500/30
           shadow-[0_4px_24px_rgba(0,0,0,0.4)]
           hover:shadow-[0_0_28px_rgba(239,68,68,0.1)]`
        : `bg-white border-zinc-200
           shadow-[0_4px_16px_rgba(0,0,0,0.06)]
           hover:border-red-200 hover:shadow-[0_0_24px_rgba(239,68,68,0.08)]`
      }`}>
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full blur-2xl
        opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: `${accent}18` }} />
      <span className={`text-[10px] font-black tracking-[0.25em] uppercase font-mono
        ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
        {label}
      </span>
      <span className={`text-3xl font-black font-mono leading-none tracking-tight
        ${dark ? "text-white" : "text-zinc-900"}`}>
        {value}
      </span>
      {sub && <span className={`text-xs font-mono tracking-widest uppercase
        ${dark ? "text-zinc-600" : "text-zinc-400"}`}>{sub}</span>}
    </div>
  );
}

/* ── Custom chart tooltip ────────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label, dark }) {
  if (active && payload && payload.length) {
    return (
      <div className={`rounded-xl px-4 py-3 shadow-xl border
        ${dark
          ? "bg-[#0f0f1a] border-red-500/20"
          : "bg-white border-red-200"
        }`}>
        <p className={`text-[10px] font-mono tracking-widest uppercase mb-1
          ${dark ? "text-zinc-500" : "text-zinc-400"}`}>Season {label}</p>
        <p className={`text-xl font-black font-mono
          ${dark ? "text-white" : "text-zinc-900"}`}>
          {payload[0].value}
          <span className={`text-xs ml-1 font-normal
            ${dark ? "text-zinc-500" : "text-zinc-400"}`}>pts</span>
        </p>
      </div>
    );
  }
  return null;
}

/* ── Main component ──────────────────────────────────────────────────────── */
function DriverDetail() {
  const { id } = useParams();
  const { dark } = useTheme();
  const [driver, setDriver] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    fetch(`http://${API_BASE}/drivers/${id}`)
      .then((res) => res.json())
      .then((data) => setDriver(data));
  }, [id]);

  useEffect(() => {
    fetch(`http://${API_BASE}/drivers/${id}/performance`)
      .then((res) => res.json())
      .then((data) => setPerformanceData(data));
  }, [id]);

  if (!driver)
    return (
      <div className={`min-h-screen flex items-center justify-center transition-colors duration-500
        ${dark ? "bg-[#07070f]" : "bg-[#f4f4f6]"}`}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
          <p className={`font-mono text-xs tracking-widest uppercase
            ${dark ? "text-zinc-600" : "text-zinc-400"}`}>Loading telemetry…</p>
        </div>
      </div>
    );

  // ── Calculations (untouched) ──────────────────────────────────────────────
  const avgPoints = performanceData.length > 0
    ? performanceData.reduce((sum, e) => sum + e.points, 0) / performanceData.length : 0;
  const consistencyScore = performanceData.length > 0
    ? performanceData.reduce((sum, e) => sum + Math.abs(e.points - avgPoints), 0) / performanceData.length : 0;
  const bestSeason = performanceData.reduce(
    (best, e) => (e.points > best.points ? e : best), { points: 0 });

  const gridColor  = dark ? "#ffffff08" : "#00000008";
  const axisColor  = dark ? "#52525b"   : "#a1a1aa";

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500
      ${dark ? "bg-[#07070f]" : "bg-[#f4f4f6]"}`}>

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {dark ? (
          <>
            <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-red-700/[0.07] blur-[120px]" />
            <div className="absolute top-1/3 -right-48 w-[400px] h-[400px] rounded-full bg-red-900/[0.05] blur-[100px]" />
          </>
        ) : (
          <>
            <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-red-100/60 blur-[100px]" />
            <div className="absolute top-1/3 -right-48 w-[400px] h-[400px] rounded-full bg-orange-100/40 blur-[90px]" />
          </>
        )}
      </div>

      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#888 1px,transparent 1px),linear-gradient(90deg,#888 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 py-14">

        {/* ── Top nav row ── */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <span className="h-px w-8 bg-red-500" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500 font-mono">
              Drivers Championship
            </span>
            <span className={`font-mono text-xs ${dark ? "text-zinc-700" : "text-zinc-400"}`}>›</span>
            <span className={`text-[10px] font-black tracking-[0.3em] uppercase font-mono
              ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
              {driver.name}
            </span>
          </div>
          <ThemeToggle />
        </div>

        {/* ── Hero header ── */}
        <div className={`relative overflow-hidden rounded-3xl mb-8 border
          transition-colors duration-500
          ${dark
            ? "bg-gradient-to-br from-[#0f0f1a] via-[#11111e] to-[#0a0a14] border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
            : "bg-white border-zinc-200 shadow-[0_8px_32px_rgba(0,0,0,0.08)]"
          } p-8 sm:p-10`}>
          <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-red-600 via-red-400 to-transparent" />
          {driver.number && (
            <span className={`absolute right-8 top-4 text-[8rem] font-black font-mono
              leading-none select-none pointer-events-none
              ${dark ? "text-white/[0.03]" : "text-zinc-900/[0.03]"}`}>
              {driver.number}
            </span>
          )}
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              {driver.firstName && (
                <span className={`text-xs font-semibold tracking-[0.2em] uppercase font-mono
                  ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                  {driver.firstName}
                </span>
              )}
              <h1 className={`text-4xl sm:text-5xl font-black uppercase tracking-tight font-mono leading-none
                ${dark ? "text-white" : "text-zinc-900"}`}>
                {driver.lastName ?? driver.name}
              </h1>
              <div className="flex items-center gap-3 mt-1">
                {driver.teamColor && (
                  <span className="w-2.5 h-2.5 rounded-full ring-2 ring-black/10"
                    style={{ backgroundColor: driver.teamColor }} />
                )}
                <span className={`text-sm tracking-widest uppercase font-mono
                  ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                  {driver.team}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1">
              <span className={`text-[10px] tracking-[0.25em] uppercase font-mono
                ${dark ? "text-zinc-600" : "text-zinc-400"}`}>Championship Points</span>
              <div className="flex items-baseline gap-2">
                <span className={`text-5xl font-black font-mono leading-none
                  ${dark ? "text-white" : "text-zinc-900"}`}>{driver.points}</span>
                <span className={`text-sm font-mono ${dark ? "text-zinc-500" : "text-zinc-400"}`}>pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard label="Avg Points / Season"
            value={performanceData.length > 0 ? avgPoints.toFixed(1) : "—"}
            sub="Career average" accent="#ef4444" dark={dark} />
          <StatCard label="Consistency Score"
            value={performanceData.length > 0 ? consistencyScore.toFixed(1) : "—"}
            sub="Lower is better" accent="#f97316" dark={dark} />
          <StatCard label="Best Season"
            value={bestSeason.year ?? "—"}
            sub={bestSeason.points ? `${bestSeason.points} pts` : undefined}
            accent="#eab308" dark={dark} />
        </div>

        {/* ── Chart card ── */}
        <div className={`relative overflow-hidden rounded-3xl border
          transition-colors duration-500
          ${dark
            ? "bg-gradient-to-br from-[#0f0f1a] to-[#0a0a14] border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.4)]"
            : "bg-white border-zinc-200 shadow-[0_8px_32px_rgba(0,0,0,0.06)]"
          } p-8`}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-600 via-red-400/50 to-transparent" />

          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-[10px] font-black tracking-[0.25em] uppercase text-red-500 font-mono mb-1">Telemetry</p>
              <h2 className={`text-lg font-black uppercase tracking-wide font-mono
                ${dark ? "text-white" : "text-zinc-900"}`}>Points Per Season</h2>
            </div>
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border
              ${dark
                ? "bg-white/[0.04] border-white/[0.06]"
                : "bg-zinc-50 border-zinc-200"}`}>
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className={`text-[10px] font-mono tracking-widest uppercase
                ${dark ? "text-zinc-400" : "text-zinc-500"}`}>Live</span>
            </div>
          </div>

          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                <defs>
                  <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={gridColor} strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="year"
                  tick={{ fill: axisColor, fontSize: 11, fontFamily: "monospace" }}
                  axisLine={false} tickLine={false} />
                <YAxis
                  tick={{ fill: axisColor, fontSize: 11, fontFamily: "monospace" }}
                  axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip dark={dark} />}
                  cursor={{ stroke: "#ef444430", strokeWidth: 1 }} />
                <Line type="monotone" dataKey="points"
                  stroke="url(#lineGlow)" strokeWidth={2.5}
                  dot={{ r: 4, fill: dark ? "#0f0f1a" : "#fff", stroke: "#ef4444", strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: "#ef4444", stroke: dark ? "#0f0f1a" : "#fff", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-14 flex items-center gap-3">
          <span className={`h-px flex-1 ${dark
            ? "bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
            : "bg-gradient-to-r from-transparent via-zinc-300 to-transparent"}`} />
          <span className={`text-[10px] font-mono tracking-widest uppercase
            ${dark ? "text-zinc-700" : "text-zinc-400"}`}>
            F1 Analytics · Driver Telemetry
          </span>
          <span className={`h-px flex-1 ${dark
            ? "bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
            : "bg-gradient-to-r from-transparent via-zinc-300 to-transparent"}`} />
        </div>
      </div>
    </div>
  );
}

export default DriverDetail;