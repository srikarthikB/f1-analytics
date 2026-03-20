import { useState, useEffect } from "react";
import DriverCard from "./DriverCard";
import API_BASE from "./config";

function Drivers() {
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/drivers`)
      .then((res) => res.json())
      .then((data) => setDrivers(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-red-700/[0.06] blur-[120px]" />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full bg-red-900/[0.05] blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-zinc-800/20 blur-[80px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 py-14">

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-red-500" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500 font-mono">2025 Season</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight font-mono leading-none text-white">
                Drivers
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-400">
                  Championship
                </span>
              </h1>
              <p className="mt-3 text-sm tracking-widest uppercase font-mono text-zinc-500">
                {drivers.length > 0 ? `${drivers.length} Drivers · Active Season` : "Loading grid…"}
              </p>
            </div>

            {/* Search bar */}
            <div className="relative w-full sm:w-72 flex-shrink-0">
              <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none text-zinc-500"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
              </svg>
              <input type="text" placeholder="Search driver…" readOnly
                className="w-full pl-10 pr-14 py-2.5 rounded-xl text-sm font-mono tracking-wide border
                  focus:outline-none transition-all duration-200 cursor-text
                  bg-white/[0.04] border-white/[0.07] text-zinc-300 placeholder:text-zinc-600 focus:border-red-500/40" />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono rounded px-1.5 py-0.5 border text-zinc-700 border-zinc-700">⌘K</span>
            </div>
          </div>

          <div className="mt-8 h-px bg-gradient-to-r from-red-500/30 via-white/5 to-transparent" />
        </div>

        {/* Grid */}
        {drivers.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i}
                className="h-44 rounded-2xl animate-pulse border bg-white/[0.03] border-white/[0.05]"
                style={{ animationDelay: `${i * 80}ms` }} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {drivers.map((driver) => (
              <DriverCard key={driver.id} driver={driver} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-700">
            F1 Analytics · Live Data
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default Drivers;