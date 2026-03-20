import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API_BASE from "./config";

function TeamDetail() {
  const { id } = useParams();
  const [team, setTeam] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/team/${id}`)
      .then((res) => res.json())
      .then((data) => setTeam(data))
      .catch((err) => console.log(err));
  }, [id]);

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#07070f]">
        <div className="h-40 w-40 rounded-2xl animate-pulse bg-white/[0.05]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#07070f]">

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-32 w-[600px] h-[500px] rounded-full bg-red-800/[0.06] blur-[130px]" />
        <div className="absolute bottom-0 -right-40 w-[500px] h-[400px] rounded-full bg-zinc-900/40 blur-[100px]" />
      </div>
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      <div className="relative z-10 px-6 sm:px-10 py-12 max-w-5xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: team.color || "#ef4444" }} />
            <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-500">
              Constructor Detail
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black uppercase font-mono text-white">
            {team.name}
          </h1>

          {team.shortName && (
            <p className="mt-2 text-sm font-mono tracking-widest text-zinc-500">
              {team.shortName}
            </p>
          )}
        </div>

        {/* Divider */}
        <div className="h-px mb-10 bg-gradient-to-r from-red-500/30 via-white/5 to-transparent" />

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

          {team.base && (
            <div className="relative overflow-hidden p-5 rounded-xl border bg-white/[0.03] border-white/[0.06]">
              <div className="absolute top-0 left-0 right-0 h-[2px]"
                style={{ background: `linear-gradient(90deg, ${team.color || "#ef4444"}, transparent)` }} />
              <p className="text-xs uppercase tracking-widest font-mono mb-2 text-zinc-500">Base</p>
              <p className="font-semibold text-white">{team.base}</p>
            </div>
          )}

          {team.points !== undefined && (
            <div className="relative overflow-hidden p-5 rounded-xl border bg-white/[0.03] border-white/[0.06]">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-600/60 to-transparent" />
              <p className="text-xs uppercase tracking-widest font-mono mb-2 text-zinc-500">Points</p>
              <p className="text-2xl font-black font-mono text-white">{team.points}</p>
            </div>
          )}
        </div>

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