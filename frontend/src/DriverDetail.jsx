import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API_BASE from "./config";
import {
  LineChart, Line, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine,
} from "recharts";

function StatCard({ label, value, sub, accent = "#ef4444" }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border
      bg-gradient-to-br from-[#0f0f1a] to-[#0a0a14]
      border-white/[0.06] hover:border-red-500/30
      shadow-[0_4px_24px_rgba(0,0,0,0.4)]
      hover:shadow-[0_0_28px_rgba(239,68,68,0.1)]
      transition-all duration-300 ease-out p-6 flex flex-col gap-2">
      <div className="absolute top-0 left-0 right-0 h-[2px]"
        style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
      <div className="absolute -top-6 -left-6 w-24 h-24 rounded-full blur-2xl
        opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: `${accent}18` }} />
      <span className="text-[10px] font-black tracking-[0.25em] uppercase font-mono text-zinc-500">
        {label}
      </span>
      <span className="text-3xl font-black font-mono leading-none tracking-tight text-white">
        {value}
      </span>
      {sub && <span className="text-xs font-mono tracking-widest uppercase text-zinc-600">{sub}</span>}
    </div>
  );
}

function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl px-4 py-3 shadow-xl border bg-[#0f0f1a] border-red-500/20">
        <p className="text-[10px] font-mono tracking-widest uppercase mb-1 text-zinc-500">LAP {label}</p>
        <p className="text-xl font-black font-mono text-white">
          {payload[0].value?.toFixed(3)}
          <span className="text-xs ml-1 font-normal text-zinc-500">s</span>
        </p>
      </div>
    );
  }
  return null;
}

function DriverDetail() {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [performance, setPerformance] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedSession, setSelectedSession] = useState(null);
  const [laps, setLaps] = useState([]);
  const [consistency, setConsistency] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lapsLoading, setLapsLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/drivers/${id}`).then(r => r.json()),
      fetch(`${API_BASE}/drivers/${id}/performance`).then(r => r.json()),
      fetch(`${API_BASE}/sessions`).then(r => r.json()),
    ]).then(([driverData, perfData, sessionsData]) => {
      if (!driverData.error) setDriver(driverData);
      setPerformance(Array.isArray(perfData) ? perfData : []);
      if (Array.isArray(sessionsData)) {
        setSessions(sessionsData);
        const uniqueYears = [...new Set(sessionsData.map(s => s.year))].sort((a, b) => b - a);
        setYears(uniqueYears);
        if (uniqueYears.length > 0) {
          setSelectedYear(uniqueYears[0]);
        }
      }
      setLoading(false);
    });
  }, [id]);

  useEffect(() => {
    if (!selectedYear || sessions.length === 0) return;

    const filtered = sessions.filter(
      s => String(s.year) === String(selectedYear)
    );

    if (filtered.length > 0) {
      setSelectedSession(filtered[filtered.length - 1]); // 🔥 LAST item = latest
    }
  }, [selectedYear, sessions]);

  useEffect(() => {
    if (!selectedSession?.session_key) return;
    setLapsLoading(true);
    Promise.all([
      fetch(`${API_BASE}/laps?session_key=${selectedSession.session_key}&driver_number=${id}`).then(r => r.json()),
      fetch(`${API_BASE}/consistency?session_key=${selectedSession.session_key}&driver_number=${id}`).then(r => r.json()),
    ]).then(([lapsData, consData]) => {
      setLaps(Array.isArray(lapsData) ? lapsData : []);
      setConsistency(consData || null);
      setLapsLoading(false);
    });
  }, [selectedSession, id]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070f]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
        <p className="font-mono text-xs tracking-widest uppercase text-zinc-600">Loading telemetry…</p>
      </div>
    </div>
  );

  if (!driver) return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070f]">
      <p className="font-mono text-xs tracking-widest uppercase text-red-500">DRIVER NOT FOUND</p>
    </div>
  );

  const accent = driver.team_colour || "#e10600";
  const raceSessions = sessions
  .filter(s => String(s.year) === String(selectedYear))
  .sort((a, b) => new Date(a.date_start) - new Date(b.date_start)); // ASCENDING
  const chartData = laps.map(l => ({ lap: l.lap, time: l.time }));
  const validTimes = chartData.map(d => d.time).filter(Boolean);
  const avgTime = validTimes.length ? validTimes.reduce((a, b) => a + b, 0) / validTimes.length : null;

  const avgPoints = performance.length > 0
    ? performance.reduce((sum, e) => sum + (e.points || 0), 0) / performance.length : 0;
  const bestSeason = performance.reduce(
    (best, e) => ((e.points || 0) > (best.points || 0) ? e : best), { points: 0 });

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#07070f]">

      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full bg-red-700/[0.07] blur-[120px]" />
        <div className="absolute top-1/3 -right-48 w-[400px] h-[400px] rounded-full bg-red-900/[0.05] blur-[100px]" />
      </div>

      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#888 1px,transparent 1px),linear-gradient(90deg,#888 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 py-14">

        {/* Top nav row */}
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-2">
            <span className="h-px w-8 bg-red-500" />
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500 font-mono">
              Drivers Championship
            </span>
            <span className="font-mono text-xs text-zinc-700">›</span>
            <span className="text-[10px] font-black tracking-[0.3em] uppercase font-mono text-zinc-500">
              {driver.full_name}
            </span>
          </div>
        </div>

        {/* Hero header */}
        <div className="relative overflow-hidden rounded-3xl mb-8 border
          bg-gradient-to-br from-[#0f0f1a] via-[#11111e] to-[#0a0a14]
          border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.5)] p-8 sm:p-10">
          <div className="absolute top-0 left-0 right-0 h-[3px]"
            style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
          <span className="absolute right-8 top-4 text-[8rem] font-black font-mono
            leading-none select-none pointer-events-none text-white/[0.03]">
            {driver.driver_number}
          </span>
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
            <div className="flex items-center gap-6">
              <img
                src={driver.headshot_url || "/default-avatar.png"}
                alt={driver.full_name}
                className="w-20 h-20 rounded-full object-cover border-2 shrink-0"
                style={{ borderColor: accent }}
                onError={e => { e.target.src = "/default-avatar.png"; }}
              />
              <div>
                <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight font-mono leading-none text-white">
                  {driver.full_name}
                </h1>
                <div className="flex items-center gap-3 mt-2">
                  <span className="w-2.5 h-2.5 rounded-full ring-2 ring-black/10"
                    style={{ backgroundColor: accent }} />
                  <span className="text-sm tracking-widest uppercase font-mono text-zinc-500">
                    {driver.team_name}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-start sm:items-end gap-1">
              <span className="text-[10px] tracking-[0.25em] uppercase font-mono text-zinc-600">Championship Points</span>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black font-mono leading-none text-white">{driver.points ?? "—"}</span>
                <span className="text-sm font-mono text-zinc-500">pts</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard
            label="Avg Points / Season"
            value={performance.length > 0 ? avgPoints.toFixed(1) : "—"}
            sub="Career average"
            accent="#ef4444"
          />
          <StatCard
            label="Consistency Score"
            value={consistency?.consistency_score ?? "—"}
            sub="Lower is better"
            accent="#f97316"
          />
          <StatCard
            label="Best Season"
            value={bestSeason.year ?? "—"}
            sub={bestSeason.points ? `${bestSeason.points} pts` : undefined}
            accent="#eab308"
          />
        </div>

        {/* Telemetry / Lap Chart */}
        <div className="relative overflow-hidden rounded-3xl border
          bg-gradient-to-br from-[#0f0f1a] to-[#0a0a14]
          border-white/[0.06] shadow-[0_8px_40px_rgba(0,0,0,0.4)] p-8">
          <div className="absolute top-0 left-0 right-0 h-[2px]"
            style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />

          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
            <div>
              <p className="text-[10px] font-black tracking-[0.25em] uppercase text-red-500 font-mono mb-1">Telemetry</p>
              <h2 className="text-lg font-black uppercase tracking-wide font-mono text-white">LAP TIME ANALYSIS</h2>
            </div>
            <div className="flex gap-3">
              <select
                className="bg-[#131620] border border-white/[0.06] rounded-lg text-white font-mono text-[10px] px-3 py-2 cursor-pointer outline-none focus:border-red-500 appearance-none"
                value={selectedYear}
                onChange={e => { setSelectedYear(e.target.value); }}
              >
                <option value="">YEAR</option>
                {years.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
              <select
                className="bg-[#131620] border border-white/[0.06] rounded-lg text-white font-mono text-[10px] px-3 py-2 cursor-pointer outline-none focus:border-red-500 appearance-none disabled:opacity-40"
                disabled={!selectedYear}
                value={selectedSession?.session_key ?? ""}
                onChange={e => setSelectedSession(raceSessions.find(s => String(s.session_key) === e.target.value))}
              >
                <option value="">RACE</option>
                {raceSessions.map(s => (
                  <option key={s.session_key} value={s.session_key}>
                    {s.circuit_short_name || s.country_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {lapsLoading ? (
            <div className="h-72 flex items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
                <p className="font-mono text-xs tracking-widest uppercase text-zinc-600">LOADING DATA...</p>
              </div>
            </div>
          ) : laps.length > 0 ? (
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                  <defs>
                    <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor={accent} />
                      <stop offset="100%" stopColor="#f97316" />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#ffffff08" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="lap"
                    tick={{ fill: "#52525b", fontSize: 11, fontFamily: "monospace" }}
                    axisLine={false} tickLine={false} />
                  <YAxis domain={['auto', 'auto']}
                    tick={{ fill: "#52525b", fontSize: 11, fontFamily: "monospace" }}
                    axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />}
                    cursor={{ stroke: `${accent}30`, strokeWidth: 1 }} />
                  {avgTime && (
                    <ReferenceLine y={avgTime} stroke="#ffffff20" strokeDasharray="5 5"
                      label={{ value: 'AVG', fill: '#5a6070', fontSize: 10 }} />
                  )}
                  <Line
                    type="monotone" dataKey="time"
                    stroke="url(#lineGlow)" strokeWidth={2.5}
                    dot={{ r: 4, fill: "#0f0f1a", stroke: accent, strokeWidth: 2 }}
                    activeDot={{ r: 6, fill: accent, stroke: "#0f0f1a", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 flex items-center justify-center border border-dashed border-white/[0.06] rounded-xl">
              <p className="font-mono text-xs tracking-widest uppercase text-zinc-600">
                SELECT SESSION TO VIEW TELEMETRY
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-14 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-700">
            F1 Analytics · Driver Telemetry
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default DriverDetail;