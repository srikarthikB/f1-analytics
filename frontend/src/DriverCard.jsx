import { useNavigate } from "react-router-dom";

function DriverCard({ driver }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/driver/${driver.driver_number}`)}
      className="group relative w-full cursor-pointer overflow-hidden rounded-2xl border
        bg-gradient-to-br from-[#0f0f1a] via-[#13131f] to-[#0a0a14]
        border-white/[0.06] shadow-[0_4px_24px_rgba(0,0,0,0.5)]
        transition-all duration-300 ease-out hover:scale-[1.04]
        hover:border-red-500/40 hover:shadow-[0_0_32px_rgba(239,68,68,0.18),0_8px_32px_rgba(0,0,0,0.6)]"
    >
      {/* Top accent bar using team_colour */}
      <div
        className="h-[3px] w-full transition-all duration-300"
        style={{
          background: driver.team_colour
            ? `linear-gradient(90deg, ${driver.team_colour}, transparent)`
            : "linear-gradient(90deg, #e10600, transparent)",
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
            backgroundColor: driver.team_colour ? `${driver.team_colour}10` : "#e1060010",
            borderColor: driver.team_colour ? `${driver.team_colour}20` : "#e1060020",
          }}
        />
      </div>

      <div className="px-5 pt-5 pb-6 flex flex-col gap-3">

        {/* Driver number + team dot */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-red-400/80 font-mono">
            #{driver.driver_number}
          </span>
          {driver.team_colour && (
            <span
              className="w-2 h-2 rounded-full ring-2 ring-black/10"
              style={{ backgroundColor: driver.team_colour }}
            />
          )}
        </div>

        {/* Ghost number watermark */}
        <div className="text-[3.5rem] font-black leading-none tracking-tighter select-none
          absolute right-4 bottom-8 font-mono transition-all duration-300
          text-white/[0.04] group-hover:text-white/[0.07]">
          {driver.driver_number}
        </div>

        {/* Name */}
        <div className="flex flex-col gap-0.5">
          <h2 className="text-[1.25rem] font-black uppercase tracking-wide leading-tight
            font-mono transition-colors duration-200 text-white group-hover:text-red-100">
            {driver.full_name}
          </h2>
        </div>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-white/10 via-white/5 to-transparent" />

        {/* Team + points */}
        <div className="flex items-center justify-between">
          {driver.team_name && (
            <span className="text-[10px] uppercase tracking-[0.15em] font-semibold
              truncate max-w-[110px] font-mono text-zinc-500">
              {driver.team_name}
            </span>
          )}
          {driver.points !== undefined && driver.points !== null && (
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