import { useState } from "react";

/* ── Tire config ─────────────────────────────────────────────────────── */
const TIRES = {
  soft:   { label: "Soft",   color: "#ef4444", bg: "#ef444420", abbr: "S", delta: -2 },
  medium: { label: "Medium", color: "#FFF200", bg: "#FFF20020", abbr: "M", delta:  0 },
  hard:   { label: "Hard",   color: "#e5e7eb", bg: "#e5e7eb15", abbr: "H", delta: +2 },
};

/* ── Styled number input ─────────────────────────────────────────────── */
function NumInput({ label, sub, value, onChange, min = 1, max = 99 }) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[10px] font-black tracking-[0.25em] uppercase text-zinc-500 font-mono">
        {label}
      </label>
      <div className="relative group">
        <input
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={onChange}
          className="
            w-full bg-[#0a0a14] border border-white/[0.08]
            rounded-xl px-4 py-3 text-xl font-black font-mono text-white
            focus:outline-none focus:border-red-500/50
            group-hover:border-white/[0.14]
            transition-all duration-200
            [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none
          "
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
          <button
            onClick={() => onChange({ target: { value: Math.min(max, value + 1) } })}
            className="w-5 h-4 flex items-center justify-center rounded text-zinc-600 hover:text-white hover:bg-white/[0.08] transition-all duration-150 text-[10px]"
          >▲</button>
          <button
            onClick={() => onChange({ target: { value: Math.max(min, value - 1) } })}
            className="w-5 h-4 flex items-center justify-center rounded text-zinc-600 hover:text-white hover:bg-white/[0.08] transition-all duration-150 text-[10px]"
          >▼</button>
        </div>
      </div>
      {sub && <span className="text-[10px] text-zinc-700 font-mono">{sub}</span>}
    </div>
  );
}

/* ── Tire selector button ────────────────────────────────────────────── */
function TireButton({ compound, selected, onClick }) {
  const t = TIRES[compound];
  return (
    <button
      onClick={onClick}
      className={`
        flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-xl
        border transition-all duration-200
        ${selected
          ? "scale-[1.03]"
          : "border-white/[0.07] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/[0.12]"}
      `}
      style={selected ? {
        borderColor: t.color + "60",
        backgroundColor: t.bg,
        boxShadow: `0 0 20px ${t.color}20`,
      } : {}}
    >
      {/* Tire circle */}
      <div
        className="w-10 h-10 rounded-full border-[3px] flex items-center justify-center text-xs font-black font-mono transition-all duration-200"
        style={{
          borderColor: selected ? t.color : "#3f3f46",
          color: selected ? t.color : "#52525b",
          boxShadow: selected ? `0 0 12px ${t.color}50` : "none",
        }}
      >
        {t.abbr}
      </div>
      <span
        className="text-[10px] font-black tracking-widest uppercase font-mono transition-colors duration-200"
        style={{ color: selected ? t.color : "#52525b" }}
      >
        {t.label}
      </span>
      <span className="text-[9px] font-mono text-zinc-700">
        {t.delta === 0 ? "Baseline" : t.delta > 0 ? `+${t.delta}s/lap` : `${t.delta}s/lap`}
      </span>
    </button>
  );
}

/* ── Lap timeline bar ────────────────────────────────────────────────── */
function LapTimeline({ laps, pitLap, tire }) {
  const t = TIRES[tire];
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[10px] font-black tracking-[0.25em] uppercase text-zinc-500 font-mono">
        Strategy Timeline
      </span>
      <div className="flex items-center gap-1 flex-wrap">
        {Array.from({ length: laps }).map((_, i) => {
          const lap    = i + 1;
          const isPit  = lap === pitLap;
          const isPost = lap > pitLap;
          return (
            <div key={lap} className="flex flex-col items-center gap-1">
              <div
                className={`
                  relative h-8 w-8 rounded-md flex items-center justify-center
                  text-[10px] font-black font-mono transition-all duration-200
                  ${isPit
                    ? "bg-yellow-500/20 border border-yellow-400/60 text-yellow-300 shadow-[0_0_8px_rgba(234,179,8,0.3)]"
                    : isPost
                      ? "border text-xs"
                      : "border text-xs"}
                `}
                style={!isPit ? {
                  borderColor: t.color + "40",
                  backgroundColor: t.bg,
                  color: t.color,
                } : {}}
              >
                {isPit ? "PIT" : lap}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex items-center gap-4 mt-1">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border border-yellow-400/60 bg-yellow-500/20" />
          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Pit Stop</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded border" style={{ borderColor: t.color + "40", backgroundColor: t.bg }} />
          <span className="text-[9px] font-mono text-zinc-600 uppercase tracking-widest">Race lap</span>
        </div>
      </div>
    </div>
  );
}

/* ── Main component ───────────────────────────────────────────────────── */
function StrategySimulator() {
  const [laps,      setLaps]      = useState(5);
  const [pitLap,    setPitLap]    = useState(3);
  const [tire,      setTire]      = useState("soft");
  const [totalTime, setTotalTime] = useState(null);
  const [lapTimes,  setLapTimes]  = useState([]);

  const simulate = () => {
    let time     = 0;
    const logged = [];

    for (let i = 1; i <= laps; i++) {
      let lapTime = 90 + (Math.random() * 2 - 1);

      if (tire === "soft")       lapTime -= 2;
      else if (tire === "hard")  lapTime += 2;

      const pit = i === pitLap;
      if (pit) time += 20;

      time += lapTime;
      logged.push({ lap: i, lapTime, pit });
    }

    setTotalTime(time);
    setLapTimes(logged);
  };

  function formatTime(totalSeconds) {
    const hours        = Math.floor(totalSeconds / 3600);
    const minutes      = Math.floor((totalSeconds % 3600) / 60);
    const seconds      = Math.floor(totalSeconds % 60);
    const milliseconds = Math.floor((totalSeconds % 1) * 1000);
    return `${hours.toString().padStart(2,"0")}:${minutes.toString().padStart(2,"0")}:${seconds.toString().padStart(2,"0")}.${milliseconds.toString().padStart(3,"0")}`;
  }

  const t = TIRES[tire];
  const bestLap = lapTimes.length > 0
    ? Math.min(...lapTimes.map((l) => l.lapTime))
    : null;

  return (
    <div className="min-h-screen bg-[#07070f] relative overflow-hidden">

      {/* ── Ambient glows ── */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[700px] h-[500px] rounded-full bg-red-800/[0.06] blur-[130px]" />
        <div className="absolute bottom-0 -left-40 w-[500px] h-[400px] rounded-full bg-red-900/[0.04] blur-[110px]" />
      </div>

      {/* ── Grid texture ── */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 sm:px-10 py-14">

        {/* ── Page header ── */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="h-px w-8 bg-red-500" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500 font-mono">
              Race Engineering
            </span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white font-mono leading-none">
            Strategy
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400">
              Simulator
            </span>
          </h1>
          <p className="mt-3 text-sm text-zinc-500 tracking-widest uppercase font-mono">
            Configure race parameters and run the simulation
          </p>
          <div className="mt-8 h-px bg-gradient-to-r from-red-500/30 via-white/5 to-transparent" />
        </div>

        {/* ── Control panel ── */}
        <div className="
          relative overflow-hidden rounded-3xl mb-6
          bg-gradient-to-br from-[#0f0f1a] via-[#11111e] to-[#0a0a14]
          border border-white/[0.06]
          shadow-[0_8px_40px_rgba(0,0,0,0.5)]
          p-7 sm:p-8
        ">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-600/60 via-orange-500/20 to-transparent" />

          <p className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500 font-mono mb-6">
            Control Panel
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-7">
            <NumInput
              label="Total Laps"
              sub="Race distance"
              value={laps}
              onChange={(e) => setLaps(parseInt(e.target.value) || 1)}
              min={1} max={78}
            />
            <NumInput
              label="Pit Stop Lap"
              sub="Undercut window"
              value={pitLap}
              onChange={(e) => setPitLap(parseInt(e.target.value) || 1)}
              min={1} max={laps}
            />
          </div>

          {/* Tire selector */}
          <div className="flex flex-col gap-2 mb-7">
            <span className="text-[10px] font-black tracking-[0.25em] uppercase text-zinc-500 font-mono">
              Tyre Compound
            </span>
            <div className="flex gap-3">
              {Object.keys(TIRES).map((compound) => (
                <TireButton
                  key={compound}
                  compound={compound}
                  selected={tire === compound}
                  onClick={() => setTire(compound)}
                />
              ))}
            </div>
          </div>

          {/* Timeline */}
          <div className="
            rounded-2xl bg-white/[0.02] border border-white/[0.05]
            p-5 mb-7
          ">
            <LapTimeline laps={laps} pitLap={pitLap} tire={tire} />
          </div>

          {/* Simulate button */}
          <button
            onClick={simulate}
            className="
              w-full py-4 rounded-xl
              font-black uppercase tracking-[0.2em] text-sm font-mono text-white
              bg-gradient-to-r from-red-600 to-red-500
              hover:from-red-500 hover:to-orange-500
              shadow-[0_0_24px_rgba(239,68,68,0.35)]
              hover:shadow-[0_0_32px_rgba(239,68,68,0.55)]
              active:scale-[0.98]
              transition-all duration-200 ease-out
            "
          >
            ▶ &nbsp;Run Simulation
          </button>
        </div>

        {/* ── Results ── */}
        {totalTime !== null && (
          <div className="
            relative overflow-hidden rounded-3xl
            bg-gradient-to-br from-[#0f0f1a] to-[#0a0a14]
            border border-white/[0.06]
            shadow-[0_8px_40px_rgba(0,0,0,0.5)]
          ">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500/60 via-orange-400/20 to-transparent" />

            {/* Total time hero */}
            <div className="
              px-7 sm:px-8 py-7
              border-b border-white/[0.05]
              flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4
            ">
              <div>
                <p className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500 font-mono mb-1">
                  Simulation Complete
                </p>
                <p className="text-xs text-zinc-500 font-mono tracking-widest uppercase">
                  {laps} laps · Pit Lap {pitLap} · {TIRES[tire].label} Tyre
                </p>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-1">
                <span className="text-[10px] tracking-[0.25em] uppercase text-zinc-600 font-mono">Total Race Time</span>
                <span
                  className="text-3xl sm:text-4xl font-black font-mono leading-none tracking-tight"
                  style={{ color: t.color, textShadow: `0 0 30px ${t.color}50` }}
                >
                  {formatTime(totalTime)}
                </span>
              </div>
            </div>

            {/* Lap breakdown table */}
            <div className="px-7 sm:px-8 py-6">
              <p className="text-[10px] font-black tracking-[0.3em] uppercase text-zinc-500 font-mono mb-4">
                Lap Breakdown
              </p>

              {/* Header row */}
              <div className="grid grid-cols-[2.5rem_1fr_1fr_auto] gap-4 px-3 pb-2 border-b border-white/[0.05] text-[10px] font-black tracking-[0.2em] uppercase text-zinc-600 font-mono">
                <span>Lap</span>
                <span>Time</span>
                <span>Event</span>
                <span className="text-right">Bar</span>
              </div>

              <div className="flex flex-col mt-1">
                {lapTimes.map(({ lap, lapTime, pit }, idx) => {
                  const isBest = lapTime === bestLap;
                  const isEven = idx % 2 === 0;
                  return (
                    <div
                      key={lap}
                      className={`
                        group grid grid-cols-[2.5rem_1fr_1fr_auto] gap-4 px-3 py-3 rounded-xl
                        items-center transition-all duration-150
                        hover:bg-white/[0.03]
                        ${isEven ? "bg-white/[0.01]" : ""}
                      `}
                    >
                      {/* Lap number */}
                      <span className="text-xs font-black font-mono text-zinc-500">{lap}</span>

                      {/* Lap time */}
                      <div className="flex items-baseline gap-1">
                        <span
                          className={`text-sm font-black font-mono transition-colors duration-200 ${isBest ? "text-green-400" : "text-white"}`}
                          style={isBest ? { textShadow: "0 0 12px rgba(74,222,128,0.5)" } : {}}
                        >
                          {lapTime.toFixed(3)}s
                        </span>
                        {isBest && (
                          <span className="text-[9px] font-black font-mono text-green-400 tracking-widest uppercase">Best</span>
                        )}
                      </div>

                      {/* Event badge */}
                      <div>
                        {pit ? (
                          <span className="
                            inline-flex items-center gap-1 px-2 py-0.5 rounded-md
                            bg-yellow-500/15 border border-yellow-400/30
                            text-[10px] font-black font-mono text-yellow-300 tracking-widest uppercase
                          ">
                            <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                            Pit +20s
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-zinc-700 tracking-widest uppercase">—</span>
                        )}
                      </div>

                      {/* Mini bar */}
                      <div className="w-20 h-1.5 rounded-full bg-white/[0.05] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${((lapTime - 86) / 8) * 100}%`,
                            background: isBest
                              ? "linear-gradient(90deg,#4ade80,#22c55e)"
                              : `linear-gradient(90deg,${t.color},${t.color}88)`,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-4 bg-gradient-to-t from-[#0a0a14]/60 to-transparent" />
          </div>
        )}

        {/* ── Footer ── */}
        <div className="mt-14 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[10px] font-mono tracking-widest text-zinc-700 uppercase">
            F1 Analytics · Race Strategy Tool
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>

      </div>
    </div>
  );
}

export default StrategySimulator;