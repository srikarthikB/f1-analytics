import { useState, useEffect } from "react";
import TeamCard from "./TeamCard";
import API_BASE from "./config";

function Teams() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/teams`)
      .then((res) => res.json())
      .then((data) => setTeams(data))
      .catch((err) => console.log(err));
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden">

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-red-700/[0.06] blur-[120px]" />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full bg-red-900/[0.05] blur-[100px]" />
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
            <span className="text-[10px] font-black tracking-[0.3em] uppercase text-red-500 font-mono">
              Constructors
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black uppercase tracking-tight font-mono leading-none text-white">
            Teams
          </h1>

          <p className="mt-3 text-sm tracking-widest uppercase font-mono text-zinc-500">
            {teams.length > 0 ? `${teams.length} Teams · Active Season` : "Loading grid…"}
          </p>

          <div className="mt-8 h-px bg-gradient-to-r from-red-500/30 via-white/5 to-transparent" />
        </div>

        {/* Grid */}
        {teams.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-44 rounded-2xl animate-pulse border bg-white/[0.03] border-white/[0.05]" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {teams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="mt-16 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-700">
            F1 Constructors · Live Data
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default Teams;