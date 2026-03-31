import { useNavigate } from "react-router-dom";

function TeamCard({ team }) {
  const navigate = useNavigate();
  const accent = team.color || "#e10600";

  return (
    <div
      onClick={() => navigate(`/team/${encodeURIComponent(team.id)}`)}
      className="group relative w-full cursor-pointer overflow-hidden rounded-2xl
        transition-all duration-300 ease-out hover:scale-[1.04]
        bg-gradient-to-br from-[#0f0f1a] via-[#13131f] to-[#0a0a14]
        border border-white/[0.06]
        shadow-[0_8px_30px_rgba(0,0,0,0.6)] hover:shadow-[0_10px_40px_rgba(0,0,0,0.8)]"
    >
      {/* Team color top bar */}
      <div
        className="h-[3px] w-full transition-all duration-300"
        style={{
          background: `linear-gradient(90deg, ${accent}, transparent)`,
        }}
      />

      {/* Hover sheen */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
        bg-gradient-to-br from-white/[0.03] to-transparent" />

      {/* Corner chevron */}
      <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1 -right-1 w-10 h-10 rotate-45 border"
          style={{
            backgroundColor: `${accent}10`,
            borderColor: `${accent}20`,
          }}
        />
      </div>

      {/* Glow blob */}
      <div
        className="absolute -top-6 -left-6 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: `${accent}15` }}
      />

      <div className="px-5 pt-5 pb-6 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase font-mono text-zinc-500">
            Constructor
          </span>
          <span className="w-2 h-2 rounded-full ring-2 ring-black/10" style={{ backgroundColor: accent }} />
        </div>

        <div className="flex flex-col gap-0.5">
          <h2 className="text-[1.15rem] font-black uppercase tracking-wide leading-tight font-mono transition-colors duration-200
            text-white group-hover:text-red-200">
            {team.name}
          </h2>
        </div>

        <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

        <div className="flex items-center justify-between">
          {team.position != null && (
            <span className="text-[10px] uppercase tracking-[0.15em] font-semibold font-mono text-zinc-500">
              P{team.position}
            </span>
          )}
          {team.points !== undefined && team.points !== null && (
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black font-mono transition-colors duration-200 text-white group-hover:text-red-300">
                {team.points}
              </span>
              <span className="text-[9px] uppercase tracking-widest font-mono text-zinc-500">pts</span>
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-0 left-4 right-4 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300
        bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
    </div>
  );
}

export default TeamCard;