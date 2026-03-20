import { useEffect, useState } from "react";
import API_BASE from "./config";

const DRIVERS = [
  { value: "1", label: "L. Hamilton",   team: "Mercedes AMG",    color: "#27F4D2", number: "44" },
  { value: "2", label: "M. Verstappen", team: "Red Bull Racing",  color: "#3671C6", number: "1"  },
  { value: "3", label: "S. Vettel",     team: "Aston Martin",     color: "#358C75", number: "5"  },
];

function getDriver(id) {
  return DRIVERS.find((d) => d.value === id) ?? { label: `Driver ${id}`, team: "", color: "#ef4444", number: "?" };
}

function DriverSelect({ value, onChange, accentColor }) {
  return (
    <div className="relative group">
      <div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none blur-md"
        style={{ backgroundColor: `${accentColor}18` }} />
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="relative w-full appearance-none rounded-xl px-4 py-3 pr-10
          text-sm font-black uppercase tracking-widest font-mono
          focus:outline-none transition-all duration-200 cursor-pointer border
          bg-[#0a0a14] text-white focus:border-white/20"
        style={{ borderColor: `${accentColor}30` }}>
        {DRIVERS.map((d) => (
          <option key={d.value} value={d.value} className="bg-[#0f0f1a]">{d.label}</option>
        ))}
      </select>
      <svg className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none"
        style={{ color: accentColor }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}

function StatRow({ label, value, isBetter, isWorse }) {
  return (
    <div className="flex flex-col gap-1 py-4 border-b last:border-0 border-white/[0.05]">
      <span className="text-[10px] font-black tracking-[0.25em] uppercase font-mono text-zinc-500">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className={`text-2xl font-black font-mono leading-none transition-colors duration-300
          ${isBetter ? "text-green-500" : isWorse ? "text-red-400" : "text-white"}`}>
          {value}
        </span>
        {isBetter && <span className="text-[10px] font-black font-mono text-green-500 tracking-widest uppercase">▲ Best</span>}
      </div>
    </div>
  );
}

function VsDivider() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-4 sm:py-0 sm:px-2">
      <div className="hidden sm:block h-16 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
      <div className="w-10 h-10 rounded-full flex items-center justify-center
        text-[11px] font-black tracking-widest font-mono border
        bg-gradient-to-br from-[#1a1a2e] to-[#0f0f1a] border-white/[0.1] text-zinc-400 shadow-[0_0_20px_rgba(239,68,68,0.1)]">
        VS
      </div>
      <div className="hidden sm:block h-16 w-px bg-gradient-to-b from-transparent via-white/10 to-transparent" />
    </div>
  );
}

function DriverComparision() {
  const [driver1, setDriver1] = useState("1");
  const [driver2, setDriver2] = useState("2");
  const [data1, setData1]     = useState([]);
  const [data2, setData2]     = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/drivers/${driver1}/performance`).then((r) => r.json()).then(setData1);
    fetch(`${API_BASE}/drivers/${driver2}/performance`).then((r) => r.json()).then(setData2);
  }, [driver1, driver2]);

  const avgPoints1 = data1.length > 0 ? data1.reduce((s, e) => s + e.points, 0) / data1.length : 0;
  const consistencyScore1 = data1.length > 0 ? data1.reduce((s, e) => s + Math.abs(e.points - avgPoints1), 0) / data1.length : 0;
  const bestSeason1 = data1.reduce((b, e) => e.points > b.points ? e : b, { points: 0 });

  const avgPoints2 = data2.length > 0 ? data2.reduce((s, e) => s + e.points, 0) / data2.length : 0;
  const consistencyScore2 = data2.length > 0 ? data2.reduce((s, e) => s + Math.abs(e.points - avgPoints2), 0) / data2.length : 0;
  const bestSeason2 = data2.reduce((b, e) => e.points > b.points ? e : b, { points: 0 });

  const d1BetterAvg  = avgPoints1 > avgPoints2;
  const d2BetterAvg  = avgPoints2 > avgPoints1;
  const d1BetterCons = consistencyScore1 < consistencyScore2;
  const d2BetterCons = consistencyScore2 < consistencyScore1;
  const d1BetterBest = bestSeason1.points > bestSeason2.points;
  const d2BetterBest = bestSeason2.points > bestSeason1.points;

  const d1 = getDriver(driver1);
  const d2 = getDriver(driver2);

  const cardBase = (side) => `
    group relative overflow-hidden flex-1
    ${side === "left" ? "rounded-3xl sm:rounded-r-none sm:rounded-l-3xl" : "rounded-3xl sm:rounded-l-none sm:rounded-r-3xl"}
    border transition-all duration-300 ease-out
    bg-gradient-to-br from-[#0f0f1a] via-[#11111e] to-[#0a0a14]
    border-white/[0.06] sm:${side === "left" ? "border-r-0" : "border-l-0"}
    shadow-[0_8px_40px_rgba(0,0,0,0.5)]
  `;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#07070f]">

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-red-700/[0.05] blur-[130px]" />
        <div className="absolute top-1/3 -right-48 w-[500px] h-[500px] rounded-full bg-blue-900/[0.05] blur-[110px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] rounded-full bg-zinc-800/20 blur-[80px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      <div className="relative z-10 mx-auto max-w-5xl px-6 sm:px-10 py-14">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-red-500" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500 font-mono">Head-to-Head</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight font-mono leading-none text-white">
            Driver
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">Comparison</span>
          </h1>
          <p className="mt-3 text-sm tracking-widest uppercase font-mono text-zinc-500">Head-to-head career statistics</p>
          <div className="mt-8 h-px bg-gradient-to-r from-red-500/30 via-white/5 to-transparent" />
        </div>

        {/* Selector row */}
        <div className="relative overflow-hidden rounded-2xl mb-8 border p-6 sm:p-7
          bg-gradient-to-br from-[#0f0f1a] to-[#0a0a14] border-white/[0.06]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-600/60 via-blue-600/30 to-transparent" />
          <p className="text-[10px] font-black tracking-[0.3em] uppercase font-mono mb-4 text-zinc-500">Select Drivers</p>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto_1fr] gap-3 items-center">
            <DriverSelect value={driver1} onChange={setDriver1} accentColor={d1.color} />
            <div className="flex items-center justify-center">
              <span className="text-[11px] font-black tracking-widest font-mono border rounded-lg px-3 py-2 text-zinc-600 border-white/[0.06]">VS</span>
            </div>
            <DriverSelect value={driver2} onChange={setDriver2} accentColor={d2.color} />
          </div>
        </div>

        {/* Comparison cards */}
        <div className="flex flex-col sm:flex-row items-stretch gap-2 sm:gap-0">
          {/* Driver 1 */}
          <div className={cardBase("left")}>
            <div className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: `linear-gradient(90deg, ${d1.color}, transparent)` }} />
            <div className="absolute -top-16 -left-16 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
              style={{ backgroundColor: d1.color }} />
            <div className="absolute -bottom-4 -right-2 text-[9rem] font-black font-mono leading-none select-none pointer-events-none opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-300"
              style={{ color: d1.color }}>{d1.number}</div>

            <div className="relative z-10 p-7 sm:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-[10px] font-black tracking-[0.25em] uppercase font-mono text-zinc-500">Driver 1</span>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-mono leading-none mt-1 text-white">{d1.label}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="w-2 h-2 rounded-full ring-2 ring-black/10" style={{ backgroundColor: d1.color }} />
                    <span className="text-[11px] tracking-widest uppercase font-mono text-zinc-500">{d1.team}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl border text-xl font-black font-mono"
                  style={{ borderColor: `${d1.color}30`, color: d1.color, backgroundColor: `${d1.color}10` }}>
                  {d1.number}
                </div>
              </div>
              <div className="h-px mb-2 opacity-20" style={{ background: `linear-gradient(90deg, ${d1.color}, transparent)` }} />
              <div className="flex flex-col">
                <StatRow label="Avg Points / Season" value={data1.length > 0 ? avgPoints1.toFixed(2) : "—"} isBetter={d1BetterAvg} isWorse={d2BetterAvg} />
                <StatRow label="Consistency Score"   value={data1.length > 0 ? consistencyScore1.toFixed(2) : "—"} isBetter={d1BetterCons} isWorse={d2BetterCons} />
                <StatRow label="Best Season"         value={bestSeason1.year ? `${bestSeason1.year} · ${bestSeason1.points}pts` : "—"} isBetter={d1BetterBest} isWorse={d2BetterBest} />
              </div>
            </div>
          </div>

          <VsDivider />

          {/* Driver 2 */}
          <div className={cardBase("right")}>
            <div className="absolute top-0 left-0 right-0 h-[3px]"
              style={{ background: `linear-gradient(90deg, ${d2.color}, transparent)` }} />
            <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full blur-3xl opacity-20 group-hover:opacity-30 transition-opacity duration-500 pointer-events-none"
              style={{ backgroundColor: d2.color }} />
            <div className="absolute -bottom-4 -left-2 text-[9rem] font-black font-mono leading-none select-none pointer-events-none opacity-[0.04] group-hover:opacity-[0.08] transition-opacity duration-300"
              style={{ color: d2.color }}>{d2.number}</div>

            <div className="relative z-10 p-7 sm:p-8">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="text-[10px] font-black tracking-[0.25em] uppercase font-mono text-zinc-500">Driver 2</span>
                  <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight font-mono leading-none mt-1 text-white">{d2.label}</h2>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="w-2 h-2 rounded-full ring-2 ring-black/10" style={{ backgroundColor: d2.color }} />
                    <span className="text-[11px] tracking-widest uppercase font-mono text-zinc-500">{d2.team}</span>
                  </div>
                </div>
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-xl border text-xl font-black font-mono"
                  style={{ borderColor: `${d2.color}30`, color: d2.color, backgroundColor: `${d2.color}10` }}>
                  {d2.number}
                </div>
              </div>
              <div className="h-px mb-2 opacity-20" style={{ background: `linear-gradient(90deg, ${d2.color}, transparent)` }} />
              <div className="flex flex-col">
                <StatRow label="Avg Points / Season" value={data2.length > 0 ? avgPoints2.toFixed(2) : "—"} isBetter={d2BetterAvg} isWorse={d1BetterAvg} />
                <StatRow label="Consistency Score"   value={data2.length > 0 ? consistencyScore2.toFixed(2) : "—"} isBetter={d2BetterCons} isWorse={d1BetterCons} />
                <StatRow label="Best Season"         value={bestSeason2.year ? `${bestSeason2.year} · ${bestSeason2.points}pts` : "—"} isBetter={d2BetterBest} isWorse={d1BetterBest} />
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 flex items-center justify-center gap-6">
          {[["bg-green-500","Better value"],["bg-red-400","Lower value"],["bg-zinc-400","Equal"]].map(([c,l]) => (
            <div key={l} className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${c}`} />
              <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-600">{l}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-14 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-700">F1 Analytics · Comparison Tool</span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default DriverComparision;