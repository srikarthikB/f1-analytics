import { useNavigate } from "react-router-dom";

function TeamCard({ team }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/team/${team.id}`)}
      className="
        group relative w-full cursor-pointer overflow-hidden rounded-2xl
        bg-gradient-to-br from-[#0f0f1a] via-[#13131f] to-[#0a0a14]
        border border-white/[0.06]
        shadow-[0_4px_24px_rgba(0,0,0,0.5)]
        transition-all duration-300 ease-out
        hover:scale-[1.04]
        hover:border-red-500/40
        hover:shadow-[0_0_32px_rgba(239,68,68,0.18),0_8px_32px_rgba(0,0,0,0.6)]
      "
    >
      {/* Top accent bar */}
      <div
        className="h-[3px] w-full transition-all duration-300"
        style={{
          background: team.color
            ? `linear-gradient(90deg, ${team.color}, transparent)`
            : "linear-gradient(90deg, #ef4444, transparent)",
        }}
      />

      {/* Glass sheen on hover */}
      <div className="
        absolute inset-0 opacity-0 group-hover:opacity-100
        bg-gradient-to-br from-white/[0.03] to-transparent
        transition-opacity duration-300 pointer-events-none
      " />

      {/* Corner chevron */}
      <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none">
        <div
          className="absolute -top-1 -right-1 w-10 h-10 rotate-45 border"
          style={{
            backgroundColor: team.color ? `${team.color}10` : "#ef444410",
            borderColor:     team.color ? `${team.color}20` : "#ef444420",
          }}
        />
      </div>

      {/* Ambient glow blob */}
      <div
        className="absolute -top-6 -left-6 w-28 h-28 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ backgroundColor: team.color ? `${team.color}15` : "#ef444415" }}
      />

      <div className="px-5 pt-5 pb-6 flex flex-col gap-3">

        {/* Top row: constructor label + color dot */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-600 font-mono">
            Constructor
          </span>
          {team.color && (
            <span
              className="w-2 h-2 rounded-full ring-2 ring-black/40"
              style={{ backgroundColor: team.color }}
            />
          )}
        </div>

        {/* Team name */}
        <div className="flex flex-col gap-0.5">
          {team.shortName && (
            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-zinc-500 font-mono">
              {team.shortName}
            </span>
          )}
          <h2 className="
            text-[1.15rem] font-black uppercase tracking-wide leading-tight
            text-white font-mono
            transition-colors duration-200
            group-hover:text-red-100
          ">
            {team.name}
          </h2>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

        {/* Points + base country */}
        <div className="flex items-center justify-between">
          {team.base && (
            <span className="text-[10px] uppercase tracking-[0.15em] font-semibold text-zinc-500 font-mono truncate max-w-[100px]">
              {team.base}
            </span>
          )}
          {team.points !== undefined && (
            <div className="flex items-baseline gap-1">
              <span className="
                text-sm font-black text-white font-mono
                group-hover:text-red-300 transition-colors duration-200
              ">
                {team.points}
              </span>
              <span className="text-[9px] uppercase tracking-widest text-zinc-600 font-mono">pts</span>
            </div>
          )}
        </div>

      </div>

      {/* Bottom glow sweep on hover */}
      <div className="
        absolute bottom-0 left-4 right-4 h-px
        bg-gradient-to-r from-transparent via-red-500/50 to-transparent
        opacity-0 group-hover:opacity-100 transition-opacity duration-300
      " />
    </div>
  );
}

export default TeamCard;