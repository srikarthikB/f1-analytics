import { useEffect, useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "./ThemeContext";

const DRIVERS = [
  { value: "1", label: "L. Hamilton",   team: "Mercedes AMG",    color: "#27F4D2", number: "44" },
  { value: "2", label: "M. Verstappen", team: "Red Bull Racing",  color: "#3671C6", number: "1"  },
  { value: "3", label: "S. Vettel",     team: "Aston Martin",    color: "#358C75", number: "5"  },
];

function getDriver(id) {
  return DRIVERS.find((d) => d.value === id) ?? { label: `Driver ${id}`, team: "", color: "#ef4444", number: "?" };
}

/* ── Styled select ───────────────────────────────────────────────────────── */
function DriverSelect({ value, onChange, accentColor, dark }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100
        transition-opacity duration-300 pointer-events-none blur-md"
        style={{ backgroundColor: `${accentColor}18` }} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`relative w-full appearance-none rounded-xl px-4 py-3 pr-10
          text-sm font-black uppercase tracking-widest font-mono
          focus:outline-none transition-all duration-200 cursor-pointer border
          ${dark
            ? "bg-[#0f0f1a] text-white focus:border-white/20"
            : "bg-white text-zinc-900 focus:border-zinc-300 shadow-sm"
          }`}
        style={{ borderColor: `${accentColor}35` }}
      >
        {DRIVERS.map((d) => (
          <option key={d.value} value={d.value}
            className={dark ? "bg-[#0f0f1a]" : "bg-white"}>
            {d.label}
          </option>
        ))}
      </select>
      <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: accentColor }}
        fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

/* ── Stat row ────────────────────────────────────────────────────────────── */
function StatRow({ label, value, isBetter, isWorse, dark }) {
  return (
    <div className={`flex flex-col gap-1 py-4 border-b last:border-0
      ${dark ? "border-white/[0.05]" : "border-zinc-100"}`}>
      <span className={`text-[10px] font-black tracking-[0.25em] uppercase font-mono
        ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
        {label}
      </span>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-black font-mono leading-none transition-colors duration-300
          ${isBetter ? "text-green-500" : isWorse ? "text-red-400" : dark ? "text-white" : "text-zinc-900"}`}>
          {value}
        </span>
        {isBetter && (
          <span className="text-[10px] font-black font-mono text-green-500 tracking-widest uppercase">
            ▲ Best
          </span>
        )}
      </div>
    </div>
  );
}

/* ── VS spine ────────────────────────────────────────────────────────────── */
function VsDivider({ dark }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4 sm:py-0 sm:px-2">
      <div className={`hidden sm:block h-16 w-px
        ${dark
          ? "bg-gradient-to-b from-transparent via-white/10 to-transparent"
          : "bg-gradient-to-b from-transparent via-zinc-300 to-transparent"}`} />
      <div className={`w-10 h-10 rounded-full flex items-center justify-center
        border text-[11px] font-black tracking-widest font-mono
        shadow-[0_0_20px_rgba(239,68,68,0.1)]
        ${dark
          ? "bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border-white/[0.1] text-zinc-400"
          : "bg-white border-zinc-200 text-zinc-500 shadow-md"
        }`}>
        VS
      </div>
      <div className={`hidden sm:block h-16 w-px
        ${dark
          ? "bg-gradient-to-b from-transparent via-white/10 to-transparent"
          : "bg-gradient-to-b from-transparent via-zinc-300 to-transparent"}`} />
    </div>
  );
}

/* ── Driver side card ────────────────────────────────────────────────────── */
function DriverSideCard({ driverId, side, stats, dark }) {
  const driver = getDriver(driverId);
  const isLeft = side === "left";

  return (
    <div className={`group relative overflow-hidden flex-1
      ${isLeft
        ? "rounded-3xl sm:rounded-r-none sm:rounded-l-3xl border sm:border-r-0"
        : "rounded-3xl sm:rounded-l-none sm:rounded-r-3xl border sm:border-l-0"
      }
      transition-all duration-300 ease-out
      ${dark
        ? "bg-gradient-to-br from-[#0f0f1a] via-[#11111e] to-[#0a0a14] border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
        : "bg-white border-zinc-200 shadow-[0_8px_32px_rgba(0,0,0,0.07)]"
      }`}>

      {/* Accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${driver.color}, transparent)` }} />

      {/* Glow blob */}
      <div className={`absolute w-48 h-48 rounded-full blur-3xl opacity-20
        group-hover:opacity-30 transition-opacity duration-500 pointer-events-none
        ${isLeft ? "-top-16 -left-16" : "-top-16 -right-16"}`}
        style={{ backgroundColor: driver.color }} />

      {/* Ghost number */}
      <div className={`absolute -bottom-4 text-[9rem] font-black font-mono
        leading-none select-none pointer-events-none
        opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-300
        ${isLeft ? "-right-2" : "-left-2"}`}
        style={{ color: driver.color }}>
        {driver.number}
      </div>

      <div className="relative z-10 p-7 sm:p-8">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <span className={`text-[10px] font-black tracking-[0.25em] uppercase font-mono
              ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
              Driver {side === "left" ? "1" : "2"}
            </span>
            <h2 className={`text-2xl sm:text-3xl font-black uppercase tracking-tight
              font-mono leading-none mt-1
              ${dark ? "text-white" : "text-zinc-900"}`}>
              {driver.label}
            </h2>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="w-2 h-2 rounded-full ring-2 ring-black/10"
                style={{ backgroundColor: driver.color }} />
              <span className={`text-[11px] tracking-widest uppercase font-mono
                ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
                {driver.team}
              </span>
            </div>
          </div>
          <div className="flex items-center justify-center w-12 h-12 rounded-xl border
            text-xl font-black font-mono"
            style={{
              borderColor: `${driver.color}30`,
              color: driver.color,
              backgroundColor: `${driver.color}10`,
            }}>
            {driver.number}
          </div>
        </div>

        {/* Divider */}
        <div className="h-px mb-2 opacity-20"
          style={{ background: `linear-gradient(90deg, ${driver.color}, transparent)` }} />

        {/* Stats */}
        <div className="flex flex-col">
          {stats.map((s, i) => (
            <StatRow key={i} dark={dark} {...s} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main ────────────────────────────────────────────────────────────────── */
function DriverComparision() {
  const [driver1, setDriver1] = useState("1");
  const [driver2, setDriver2] = useState("2");
  const [data1, setData1]     = useState([]);
  const [data2, setData2]     = useState([]);
  const { dark }              = useTheme();

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/drivers/${driver1}/performance`)
      .then((res) => res.json()).then((data) => setData1(data));
    fetch(`http://127.0.0.1:8000/drivers/${driver2}/performance`)
      .then((res) => res.json()).then((data) => setData2(data));
  }, [driver1, driver2]);

  // ── Calculations (untouched) ──────────────────────────────────────────────
  const avgPoints1 = data1.length > 0
    ? data1.reduce((sum, e) => sum + e.points, 0) / data1.length : 0;
  const consistencyScore1 = data1.length > 0
    ? data1.reduce((sum, e) => sum + Math.abs(e.points - avgPoints1), 0) / data1.length : 0;
  const bestSeason1 = data1.reduce(
    (best, e) => (e.points > best.points ? e : best), { points: 0 });

  const avgPoints2 = data2.length > 0
    ? data2.reduce((sum, e) => sum + e.points, 0) / data2.length : 0;
  const consistencyScore2 = data2.length > 0
    ? data2.reduce((sum, e) => sum + Math.abs(e.points - avgPoints2), 0) / data2.length : 0;
  const bestSeason2 = data2.reduce(
    (best, e) => (e.points > best.points ? e : best), { points: 0 });

  // ── Highlight flags ───────────────────────────────────────────────────────
  const d1BetterAvg  = avgPoints1 > avgPoints2;
  const d2BetterAvg  = avgPoints2 > avgPoints1;
  const d1BetterCons = consistencyScore1 < consistencyScore2;
  const d2BetterCons = consistencyScore2 < consistencyScore1;
  const d1BetterBest = bestSeason1.points > bestSeason2.points;
  const d2BetterBest = bestSeason2.points > bestSeason1.points;

  const d1 = getDriver(driver1);
  const d2 = getDriver(driver2);

  const stats1 = [
    { label: "Avg Points / Season", value: data1.length > 0 ? avgPoints1.toFixed(2) : "—", isBetter: d1BetterAvg, isWorse: d2BetterAvg },
    { label: "Consistency Score",   value: data1.length > 0 ? consistencyScore1.toFixed(2) : "—", isBetter: d1BetterCons, isWorse: d2BetterCons },
    { label: "Best Season",         value: bestSeason1.year ? `${bestSeason1.year} · ${bestSeason1.points}pts` : "—", isBetter: d1BetterBest, isWorse: d2BetterBest },
  ];
  const stats2 = [
    { label: "Avg Points / Season", value: data2.length > 0 ? avgPoints2.toFixed(2) : "—", isBetter: d2BetterAvg, isWorse: d1BetterAvg },
    { label: "Consistency Score",   value: data2.length > 0 ? consistencyScore2.toFixed(2) : "—", isBetter: d2BetterCons, isWorse: d1BetterCons },
    { label: "Best Season",         value: bestSeason2.year ? `${bestSeason2.year} · ${bestSeason2.points}pts` : "—", isBetter: d2BetterBest, isWorse: d1BetterBest },
  ];

  return (
    <div className={`min-h-screen relative overflow-hidden transition-colors duration-500
      ${dark ? "bg-[#07070f]" : "bg-[#f4f4f6]"}`}>

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {dark ? (
          <>
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-red-700/[0.05] blur-[130px]" />
            <div className="absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full bg-blue-900/[0.05] blur-[110px]" />
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-zinc-800/20 blur-[80px]" />
          </>
        ) : (
          <>
            <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-red-100/60 blur-[120px]" />
            <div className="absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full bg-blue-100/30 blur-[100px]" />
          </>
        )}
      </div>

      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#888 1px,transparent 1px),linear-gradient(90deg,#888 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-10 py-14">

        {/* ── Page header ── */}
        <div className="mb-12">
          <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
            <div className="flex items-center gap-2">
              <span className="h-px w-8 bg-red-500" />
              <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500 font-mono">
                Analytics
              </span>
            </div>
            <ThemeToggle />
          </div>
          <h1 className={`text-4xl sm:text-5xl font-black uppercase tracking-tight font-mono leading-none
            ${dark ? "text-white" : "text-zinc-900"}`}>
            Driver
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
              Comparison
            </span>
          </h1>
          <p className={`mt-3 text-sm tracking-widest uppercase font-mono
            ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
            Head-to-head career statistics
          </p>
          <div className={`mt-8 h-px ${dark
            ? "bg-gradient-to-r from-red-500/30 via-white/5 to-transparent"
            : "bg-gradient-to-r from-red-400/40 via-zinc-200 to-transparent"}`} />
        </div>

        {/* ── Selector card ── */}
        <div className={`relative overflow-hidden rounded-2xl mb-8 border
          transition-colors duration-500
          ${dark
            ? "bg-gradient-to-br from-[#0f0f1a] to-[#0a0a14] border-white/[0.06]"
            : "bg-white border-zinc-200 shadow-sm"
          } p-6 sm:p-7`}>
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-600/60 via-blue-600/30 to-transparent" />
          <p className={`text-[10px] font-black tracking-[0.3em] uppercase font-mono mb-4
            ${dark ? "text-zinc-500" : "text-zinc-400"}`}>
            Select Drivers
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
            <DriverSelect value={driver1} onChange={setDriver1} accentColor={d1.color} dark={dark} />
            <div className="flex items-center justify-center">
              <span className={`text-[11px] font-black tracking-widest font-mono
                border rounded-lg px-3 py-2
                ${dark
                  ? "text-zinc-600 border-white/[0.06]"
                  : "text-zinc-400 border-zinc-200 bg-zinc-50"
                }`}>VS</span>
            </div>
            <DriverSelect value={driver2} onChange={setDriver2} accentColor={d2.color} dark={dark} />
          </div>
        </div>

        {/* ── Comparison cards ── */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0">
          <DriverSideCard driverId={driver1} side="left"  stats={stats1} dark={dark} />
          <VsDivider dark={dark} />
          <DriverSideCard driverId={driver2} side="right" stats={stats2} dark={dark} />
        </div>

        {/* ── Legend ── */}
        <div className="mt-6 flex items-center justify-center gap-6">
          {[
            { color: "bg-green-500", label: "Better value" },
            { color: "bg-red-400",   label: "Lower value"  },
            { color: dark ? "bg-zinc-500" : "bg-zinc-400", label: "Equal" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              <span className={`text-[10px] font-mono tracking-widest uppercase
                ${dark ? "text-zinc-600" : "text-zinc-400"}`}>{label}</span>
            </div>
          ))}
        </div>

        {/* ── Footer ── */}
        <div className="mt-14 flex items-center gap-3">
          <span className={`h-px flex-1 ${dark
            ? "bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
            : "bg-gradient-to-r from-transparent via-zinc-300 to-transparent"}`} />
          <span className={`text-[10px] font-mono tracking-widest uppercase
            ${dark ? "text-zinc-700" : "text-zinc-400"}`}>
            F1 Analytics · Comparison Tool
          </span>
          <span className={`h-px flex-1 ${dark
            ? "bg-gradient-to-r from-transparent via-white/[0.06] to-transparent"
            : "bg-gradient-to-r from-transparent via-zinc-300 to-transparent"}`} />
        </div>
      </div>
    </div>
  );
}

export default DriverComparision;