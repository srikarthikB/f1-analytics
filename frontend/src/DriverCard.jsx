import { useNavigate } from "react-router-dom";

function DriverCard({ driver }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/driver/${driver.id}`)}
      className="group relative w-56 cursor-pointer overflow-hidden rounded-2xl border
        bg-gradient-to-br from-[#0f0f1a] via-[#13131f] to-[#0a0a14]
        border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.5)]
        transition-all duration-300 ease-out hover:scale-[1.04]
        hover:border-red-500/40 hover:shadow-[0_0_32px_rgba(239,68,68,0.18),0_8px_32px_rgba(0,0,0,0.6)]"
    >
      {/* Top accent bar */}
      <div className="h-[3px] w-full bg-gradient-to-r from-red-600 via-red-400 to-transparent
        transition-all duration-300 group-hover:from-red-500 group-hover:via-orange-400" />

      {/* Hover sheen */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none
        bg-gradient-to-br from-white/[0.03] to-transparent" />

      {/* Corner chevron */}
      <div className="absolute top-0 right-0 w-12 h-12 overflow-hidden pointer-events-none">
        <div className="absolute -top-1 -right-1 w-10 h-10 rotate-45 border bg-red-600/10 border-red-500/20" />
      </div>

      <div className="px-5 pt-5 pb-6 flex flex-col gap-3">

        {/* Position + team dot */}
        <div className="flex items-center justify-between">
          {driver.position && (
            <span className="text-[10px] font-black tracking-[0.2em] uppercase text-red-400/80 font-mono">
              P{driver.position}
            </span>
          )}
          {driver.teamColor && (
            <span className="w-2 h-2 rounded-full ring-2 ring-black/10"
              style={{ backgroundColor: driver.teamColor }} />
          )}
        </div>

        {/* Ghost number */}
        {driver.number && (
          <div className="text-[3.5rem] font-black leading-none tracking-tighter select-none
            absolute right-4 bottom-8 font-mono transition-all duration-300
            text-white/[0.04] group-hover:text-white/[0.07]">
            {driver.number}
          </div>
        )}

        {/* Name */}
        <div className="flex flex-col gap-0.5">
          {driver.firstName && (
            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase font-mono text-zinc-500">
              {driver.firstName}
            </span>
          )}
          <h2 className="text-[1.25rem] font-black uppercase tracking-wide leading-tight
            font-mono transition-colors duration-200 text-white group-hover:text-red-100">
            {driver.lastName ?? driver.name}
          </h2>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

        {/* Team + points */}
        <div className="flex items-center justify-between">
          {driver.team && (
            <span className="text-[10px] uppercase tracking-[0.15em] font-semibold
              truncate max-w-[110px] font-mono text-zinc-500">
              {driver.team}
            </span>
          )}
          {driver.points !== undefined && (
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black font-mono transition-colors duration-200
                text-white group-hover:text-red-300">{driver.points}</span>
              <span className="text-[9px] uppercase tracking-widest font-mono text-zinc-600">pts</span>
            </div>
          )}
        </div>
      </div>

      {/* Bottom glow */}
      <div className="absolute bottom-0 left-4 right-4 h-px
        opacity-0 group-hover:opacity-100 transition-opacity duration-300
        bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
    </div>
  );
}

export default DriverCard;