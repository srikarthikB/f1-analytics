import { Link, useLocation } from "react-router-dom";

const NAV_LINKS = [
  { to: "/drivers",               label: "Drivers"   },
  { to: "/teams",                 label: "Teams"     },
  { to: "/standings/drivers",     label: "Standings" },
  { to: "/races",                 label: "Races"     },
  { to: "/compare",               label: "Compare"   },
  { to: "/strategy-simulator",    label: "Strategy"  },
];

function Navbar() {
  const location = useLocation();

  const isActive = (path) =>
    location.pathname === path ||
    (path !== "/" && location.pathname.startsWith(path));

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-xl border-b bg-[#07070f]/80 border-white/[0.06] shadow-[0_1px_0_rgba(255,255,255,0.04),0_4px_24px_rgba(0,0,0,0.5)]">
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 sm:px-10 flex items-center justify-between h-14">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative w-6 h-6 flex items-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
              <path d="M4 4 L14 12 L4 20" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M12 4 L22 12 L12 20" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.4"/>
            </svg>
          </div>
          <span className="text-[15px] font-black tracking-[0.12em] uppercase font-mono text-white group-hover:text-red-500 transition-colors duration-200">
            PitWall
          </span>
        </Link>

        {/* Nav links (desktop) */}
        <div className="hidden sm:flex items-center gap-1">
          {NAV_LINKS.map(({ to, label }) => {
            const active = isActive(to);
            return (
              <Link key={to} to={to} className="relative flex flex-col items-center group px-3.5 py-2">
                <span className={`text-[11px] font-black tracking-[0.18em] uppercase font-mono transition-colors duration-200
                  ${active ? "text-white" : "text-zinc-500 group-hover:text-zinc-200"}`}>
                  {label}
                </span>
                <span className={`absolute bottom-0 left-3.5 right-3.5 h-[2px] rounded-full transition-all duration-300
                  ${active
                    ? "bg-gradient-to-r from-red-500 to-orange-400 opacity-100 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                    : "bg-white/0 group-hover:bg-white/[0.12] opacity-0 group-hover:opacity-100"
                  }`}/>
                <span className={`absolute inset-0 rounded-lg transition-opacity duration-200
                  ${active ? "opacity-0" : "opacity-0 group-hover:opacity-100 bg-white/[0.04]"}`}/>
              </Link>
            );
          })}
        </div>

        {/* Right: Live badge */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg border bg-white/[0.04] border-white/[0.06]">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-500">Live</span>
          </div>

          {/* Mobile active dot */}
          <div className="sm:hidden flex items-center gap-1">
            {NAV_LINKS.map(({ to }) =>
              isActive(to) ? (
                <span key={to} className="w-1.5 h-1.5 rounded-full bg-red-500" />
              ) : null
            )}
          </div>
        </div>
      </div>

      {/* Mobile nav strip */}
      <div className="sm:hidden flex items-center gap-1 overflow-x-auto px-4 pb-3 scrollbar-none">
        {NAV_LINKS.map(({ to, label }) => {
          const active = isActive(to);
          return (
            <Link key={to} to={to}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-[10px] font-black tracking-widest uppercase font-mono transition-all duration-200 border
                ${active
                  ? "bg-red-500/10 border-red-400/30 text-red-500"
                  : "text-zinc-600 border-transparent hover:text-zinc-300 hover:border-white/[0.08]"
                }`}>
              {label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default Navbar;