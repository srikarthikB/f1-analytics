import { NavLink, Link, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";

const NAV_LINKS = [
  { to: "/drivers",            label: "Drivers"   },
  { to: "/teams",              label: "Teams"     },
  { to: "/standings",          label: "Standings" },
  { to: "/races",              label: "Races"     },
  { to: "/compare",            label: "Compare"   },
  { to: "/strategy-simulator", label: "Strategy"  },
  { to: "/fantasy",            label: "Fantasy"   },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMenuOpen(false); }, [pathname]);

  return (
    <>
      <nav style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: scrolled
          ? "rgba(7,7,15,0.97)"
          : "rgba(10,10,15,0.94)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        borderBottom: `1px solid ${scrolled ? "rgba(225,6,0,0.18)" : "rgba(255,255,255,0.06)"}`,
        transition: "background 300ms ease, border-color 300ms ease",
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          padding: "0 32px",
          height: "52px",
          maxWidth: "1400px",
          margin: "0 auto",
          gap: "16px",
        }}>

          {/* ── Logo ── */}
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              marginRight: "32px",
              textDecoration: "none",
              flexShrink: 0,
            }}
          >
            <svg width="18" height="14" viewBox="0 0 18 14" fill="none" aria-hidden="true">
              <path d="M0 7L5 0L10 7L5 14L0 7Z" fill="#e10600" />
              <path d="M8 7L13 0L18 7L13 14L8 7Z" fill="#e10600" opacity="0.45" />
            </svg>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontWeight: 700,
              fontSize: "15px",
              letterSpacing: "0.14em",
              color: "#f0f0f0",
              textTransform: "uppercase",
            }}>
              PITWALL
            </span>
          </Link>

          {/* ── Desktop Links ── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "2px",
            flex: 1,
            justifyContent: "center",
          }}
            className="pw-nav-links"
          >
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "10px",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: isActive ? "#f0f0f0" : "#5a6070",
                  padding: "6px 14px 4px",
                  textDecoration: "none",
                  borderBottom: isActive ? "2px solid #e10600" : "2px solid transparent",
                  transition: "color 200ms ease, border-color 200ms ease",
                  whiteSpace: "nowrap",
                })}
                onMouseEnter={e => {
                  const isActive = e.currentTarget.style.borderBottomColor === "rgb(225, 6, 0)";
                  if (!isActive) e.currentTarget.style.color = "#e10600";
                }}
                onMouseLeave={e => {
                  const isActive = e.currentTarget.style.borderBottomColor === "rgb(225, 6, 0)";
                  if (!isActive) e.currentTarget.style.color = "#5a6070";
                }}
              >
                {label}
              </NavLink>
            ))}
          </div>

          {/* ── LIVE badge ── */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "7px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: "20px",
            padding: "5px 14px",
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "10px",
            letterSpacing: "0.16em",
            color: "#f0f0f0",
            flexShrink: 0,
          }}>
            <span style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              background: "#22c55e",
              boxShadow: "0 0 6px #22c55e",
              animation: "pwLivePulse 1.8s ease-in-out infinite",
              display: "block",
            }} />
            LIVE
          </div>

          {/* ── Mobile Hamburger ── */}
          <button
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen(v => !v)}
            style={{
              display: "none",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "6px",
              color: "#f0f0f0",
              flexShrink: 0,
            }}
            className="pw-hamburger"
          >
            {menuOpen ? (
              /* X icon */
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M2 2L16 16M16 2L2 16" stroke="#f0f0f0" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            ) : (
              /* Bars icon */
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none">
                <rect y="0"  width="18" height="1.5" rx="0.75" fill="#f0f0f0" />
                <rect y="6"  width="12" height="1.5" rx="0.75" fill="#e10600" />
                <rect y="12" width="18" height="1.5" rx="0.75" fill="#f0f0f0" />
              </svg>
            )}
          </button>
        </div>

        {/* ── Mobile Dropdown ── */}
        {menuOpen && (
          <div style={{
            background: "rgba(7,7,15,0.98)",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "12px 32px 20px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
          }}
            className="pw-mobile-menu"
          >
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                style={({ isActive }) => ({
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "11px",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  color: isActive ? "#e10600" : "#8891a0",
                  padding: "10px 0",
                  textDecoration: "none",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  transition: "color 150ms ease",
                })}
              >
                {({ isActive }) => (
                  <>
                    <span style={{
                      width: "4px",
                      height: "4px",
                      borderRadius: "50%",
                      background: isActive ? "#e10600" : "transparent",
                      border: isActive ? "none" : "1px solid #5a6070",
                      flexShrink: 0,
                    }} />
                    {label}
                  </>
                )}
              </NavLink>
            ))}
          </div>
        )}
      </nav>

      <style>{`
        @keyframes pwLivePulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.35; }
        }

        @media (max-width: 768px) {
          .pw-nav-links { display: none !important; }
          .pw-hamburger { display: flex !important; }
        }

        @media (min-width: 769px) {
          .pw-mobile-menu { display: none !important; }
        }
      `}</style>
    </>
  );
}