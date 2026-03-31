import { useParams } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import API_BASE from "./config";
import DriverAvatar from "./DriverAvatar";

// Matches the exact shape expected by DriverAvatar
function normalizeDriver(d, teamName, accent) {
  return {
    driver_number: d.driver_number,
    full_name: d.full_name || d.name || "Unknown Driver",
    team_name: teamName || "—",
    team_colour: accent || "#e10600",
    headshot_url: d.headshot_url || null,
  };
}

function TeamDetail() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/team/${id}`).then(r => r.json()),
      fetch(`${API_BASE}/team/${id}/history`).then(r => r.json()),
      fetch(`${API_BASE}/drivers`).then(r => r.json())
    ])
      .then(([teamData, historyData, driversData]) => {
        const map = {};
        driversData.forEach(d => {
          map[d.driver_number] = d;
        });

        if (teamData?.drivers) {
          teamData.drivers = teamData.drivers.map(d => ({
            ...d,
            headshot_url: map[d.driver_number]?.headshot_url || null
          }));
        }

        setTeam(teamData && !teamData.error ? teamData : null);
        setHistory(Array.isArray(historyData) ? historyData : []);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  const accent = team?.color || "#e10600";
  const maxPts = history.length ? Math.max(...history.map(h => h.points || 0)) : 1;

  const normalizedDrivers = useMemo(() => {
    if (!team?.drivers) return [];
    return team.drivers.map(d => normalizeDriver(d, team.name, accent));
  }, [team, accent]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070f]">
      <div className="h-40 w-40 rounded-2xl animate-pulse bg-white/[0.05]" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070f]">
      <p className="font-mono text-xs tracking-widest uppercase text-red-500">Error: {error}</p>
    </div>
  );

  if (!team) return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070f]">
      <p className="font-mono text-xs tracking-widest uppercase text-red-500">Team not found.</p>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#07070f]">

      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-32 w-[600px] h-[500px] rounded-full bg-red-800/[0.06] blur-[130px]" />
        <div className="absolute bottom-0 -right-40 w-[500px] h-[400px] rounded-full bg-zinc-900/40 blur-[100px]" />
      </div>

      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      <div className="relative z-10 px-6 sm:px-10 py-12 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: accent }} />
            <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500">
              Constructor Detail
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black uppercase font-mono"
            style={{ color: accent }}>
            {team.name}
          </h1>
        </div>

        {/* Divider */}
        <div className="h-px mb-10"
          style={{ background: `linear-gradient(90deg, ${accent}60, transparent)` }} />

        {/* Stats row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          {[
            { label: "POSITION", value: team.position != null ? `P${team.position}` : "—" },
            { label: "POINTS", value: team.points ?? "—" },
          ].map(({ label, value }) => (
            <div key={label} className="relative overflow-hidden p-5 rounded-xl border bg-white/[0.03] border-white/[0.06]">
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
              <p className="text-xs uppercase tracking-widest font-mono mb-2 text-zinc-500">{label}</p>
              <p className="text-2xl font-black font-mono text-white">{value}</p>
            </div>
          ))}
        </div>

        {/* Drivers */}
        {normalizedDrivers.length > 0 && (
          <div className="relative overflow-hidden p-6 rounded-xl border bg-white/[0.03] border-white/[0.06] mb-6">
            <div className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
            <p className="text-[10px] uppercase tracking-widest font-mono mb-5 text-zinc-500">DRIVERS</p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "28px",
                alignItems: "center",
              }}
            >
              {normalizedDrivers.map(driver => (
                <DriverAvatar
                  key={driver.driver_number}
                  driver={driver}
                  size={80}
                />
              ))}
            </div>
          </div>
        )}

        {/* History */}
        {history.length > 0 && (
          <div className="relative overflow-hidden p-6 rounded-xl border bg-white/[0.03] border-white/[0.06]">
            <div className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: `linear-gradient(90deg, ${accent}, transparent)` }} />
            <p className="text-[10px] uppercase tracking-widest font-mono mb-4 text-zinc-500">CONSTRUCTOR HISTORY</p>
            {history.map((h, i) => (
              <div
                key={h.year}
                style={{
                  display: "grid",
                  gridTemplateColumns: "80px 60px 1fr",
                  alignItems: "center",
                  gap: "16px",
                  paddingTop: "12px",
                  paddingBottom: "12px",
                  borderBottom: i < history.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                }}
              >
                <span className="font-mono text-[11px] text-zinc-400">{h.year}</span>
                <span className="font-black text-xl font-mono text-white">P{h.position}</span>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-[2px] bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(h.points / maxPts) * 100}%`, background: accent }}
                    />
                  </div>
                  <span className="font-mono text-[10px] text-zinc-500 min-w-[60px] text-right">
                    {h.points} PTS
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-700">F1 Analytics · Constructor Detail</span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default TeamDetail;