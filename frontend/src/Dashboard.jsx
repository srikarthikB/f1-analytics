import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";

import "./Dashboard.css";

/* ─── Nav definitions ─────────────────────────────────────── */
const LEFT_ITEMS = [
  {
    to: "/drivers",
    label: "DRIVERS",
    sub: "Championship Grid",
    accent: "#e10600",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    to: "/strategy-simulator",
    label: "STRATEGY",
    sub: "Race Simulator",
    accent: "#3b82f6",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 2L2 7l10 5 10-5-10-5z" />
        <path d="M2 17l10 5 10-5" />
        <path d="M2 12l10 5 10-5" />
      </svg>
    ),
  },
];

const RIGHT_ITEMS = [
  {
    to: "/fantasy",
    label: "FANTASY",
    sub: "Build Your Team",
    accent: "#f59e0b",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      </svg>
    ),
  },
  {
    to: "/races",
    label: "RACES",
    sub: "Season Calendar",
    accent: "#10b981",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
];

/* ─── Arrow SVG ───────────────────────────────────────────── */
const ArrowRight = () => (
  <svg className="hud-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
const ArrowLeft = () => (
  <svg className="hud-arrow" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path d="M13 8H3M7 4L3 8l4 4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

/* ─── HUD item ────────────────────────────────────────────── */
function HudItem({ to, label, sub, icon, accent, side }) {
  const navigate = useNavigate();
  return (
    <button
      className="hud-item"
      style={{ "--accent": accent }}
      onClick={() => navigate(to)}
    >
      <span className="hud-icon">{icon}</span>
      <span className="hud-text">
        <span className="hud-label">{label}</span>
        <span className="hud-sub">{sub}</span>
      </span>
      {side === "left" ? <ArrowRight /> : <ArrowLeft />}
    </button>
  );
}

/* ─── Streaks ─────────────────────────────────────────────── */
const STREAK_DATA = [...Array(22)].map((_, i) => ({
  y:       `${5 + i * 4.2}%`,
  len:     `${80 + (i % 6) * 60}px`,
  opacity: `${0.05 + (i % 5) * 0.07}`,
}));

/* ─── Dashboard ───────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate();

  const dashboardRef  = useRef(null);
  const carRigRef     = useRef(null);
  const streaksRef    = useRef(null);
  const lightSweepRef = useRef(null);
  const titleRef      = useRef(null);
  const titleRuleRef  = useRef(null);
  const hudLeftRef    = useRef(null);
  const hudRightRef   = useRef(null);
  const telemetryRef  = useRef(null);
  const footerRef     = useRef(null);
  const cornersRef    = useRef([]);

  useEffect(() => {
    if (!carRigRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });

    /* 0 — freeze streaks offscreen until car enters */
    gsap.set(streaksRef.current.querySelectorAll(".streak"), { x: "-110vw" });

    /* 1 — page zoom-in */
    tl.fromTo(
      dashboardRef.current,
      { scale: 1.1 },
      { scale: 1, duration: 2, ease: "power3.out" },
      0
    );

    /* 2 — CAR ENTRY: start VERY far left, tiny pullback, then blast in */
    tl.set(carRigRef.current,  { x: "-260vw", filter: "blur(24px)" }, 0);

    /* 2a — micro anticipation: nudge even further left */
    tl.to(
      carRigRef.current,
      { x: "-275vw", duration: 0.18, ease: "power1.in" },
      0.05
    );

    /* 2b — main sweep: car blasts across the screen */
    tl.to(
      carRigRef.current,
      {
        x: "0vw",
        filter: "blur(0px)",
        duration: 2.2,
        ease: "expo.out",
      },
      0.23
    );

    tl.to(
    dashboardRef.current,
    {
        x: "-=8",
        duration: 0.05,
        yoyo: true,
        repeat: 6,
        ease: "power1.inOut",
    },
    0.6
    );

    /* 3 — streaks fire across screen in sync with car entry */
    tl.fromTo(
      streaksRef.current.querySelectorAll(".streak"),
      { x: "-160vw" },
      {
        x: "130vw",
        duration: 0.55,
        ease: "power2.in",
        stagger: 0.012,
      },
      0.25
    );

    /* 4 — light sweep reflection over car surface */
    tl.fromTo(
      lightSweepRef.current,
      { opacity: 0, x: "-60%" },
      { opacity: 1, x: "60%", duration: 0.6, ease: "power2.inOut" },
      1.2
    );
    tl.to(lightSweepRef.current, { opacity: 0, duration: 0.3 }, 1.8);

    /* 5 — corner brackets fade in */
    tl.to(cornersRef.current, { opacity: 1, duration: 0.4, stagger: 0.06 }, 1.5);

    /* 6 — title rises up */
    tl.fromTo(
      titleRef.current,
      { opacity: 0, y: 22 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" },
      1.7
    );
    tl.to(titleRuleRef.current, { scaleX: 1, duration: 0.5 }, 2.1);

    /* 7 — HUD panels slide in from sides */
    tl.fromTo(
      hudLeftRef.current,
      { opacity: 0, x: -50 },
      { opacity: 1, x: 0, duration: 0.7, ease: "back.out(1.4)" },
      1.9
    );
    tl.fromTo(
      hudRightRef.current,
      { opacity: 0, x: 50 },
      { opacity: 1, x: 0, duration: 0.7, ease: "back.out(1.4)" },
      2.0
    );

    /* 8 — telemetry bar + footer */
    tl.to(telemetryRef.current, { opacity: 1, duration: 0.5 }, 2.1);
    tl.to(footerRef.current,    { opacity: 1, duration: 0.5 }, 2.2);

    /* 9 — controlled vibration: 1 sec on, 2.5 sec pause, repeat */
    const vibe = () => {
      gsap.to(carRigRef.current, {
        x: "+=2.5",
        duration: 0.045,
        yoyo: true,
        repeat: 22,
        ease: "none",
        onComplete: () => setTimeout(vibe, 2600),
      });
    };
    setTimeout(vibe, 2800);

    /* 10 — subtle idle glow pulse on car */
    gsap.to(carRigRef.current.querySelector(".car-img"), {
      filter: "drop-shadow(0 0 38px rgba(225,6,0,0.85))",
      duration: 1.4,
      yoyo: true,
      repeat: -1,
      ease: "sine.inOut",
      delay: 2.4,
    });

    return () => tl.kill();
  }, []);

  return (
    <div ref={dashboardRef} className="dashboard">
      {/* ── Background layers ── */}
      <div className="bg-grid" />
      <div className="bg-ambient" />
      <div className="bg-scanlines" />
      <div className="bg-vignette" />
      <div className="bg-floor-glow" />

      {/* ── Corner brackets ── */}
      {["corner-tl","corner-tr","corner-bl","corner-br"].map((cls, i) => (
        <div
          key={cls}
          className={cls}
          ref={el => cornersRef.current[i] = el}
        />
      ))}

      {/* ── Telemetry bar ── */}
      <div ref={telemetryRef} className="telemetry-bar">
        <span className="telemetry-item">LAP 1 / 58</span>
        <span className="telemetry-item">P1</span>
        <span className="telemetry-item">SOFT — 4 LAPS</span>
        <span className="telemetry-item">DRS OPEN</span>
        <span className="telemetry-item">344 KM/H</span>
        <button onClick={() => navigate("/about")} className="ml-auto">
          <span className="telemetry-live" style={{ fontSize: "14px", fontWeight: "600" }}>Sri Karthik</span>
        </button>
      </div>

      {/* ── Full-viewport stage ── */}
      <div className="stage">

        {/* HUD left */}
        <div ref={hudLeftRef} className="hud-left">
          {LEFT_ITEMS.map(item => (
            <HudItem key={item.to} {...item} side="left" />
          ))}
        </div>

        {/* Car rig */}
        <div ref={carRigRef} className="car-rig">
          {/* Streaks behind car */}
          <div ref={streaksRef} className="streaks">
            {STREAK_DATA.map((s, i) => (
              <div
                key={i}
                className="streak"
                style={{
                  "--y":       s.y,
                  "--len":     s.len,
                  "--opacity": s.opacity,
                }}
              />
            ))}
          </div>
          <div className="heat-haze" />
          <div className="ground-bloom" />

          <img src="/car.png" className="car-img" alt="F1 Car" draggable={false} />

          <div className="reflection-wrap">
            <img src="/car.png" className="car-img car-img--reflect" alt="" draggable={false} />
            <div className="reflection-fade" />
          </div>

          <div ref={lightSweepRef} className="light-sweep" />
        </div>

        {/* HUD right */}
        <div ref={hudRightRef} className="hud-right">
          {RIGHT_ITEMS.map(item => (
            <HudItem key={item.to} {...item} side="right" />
          ))}
        </div>
      </div>

      {/* ── Title block ── */}
      <div ref={titleRef} className="title-block">
        <p className="title-eyebrow">Race Intelligence System</p>
        <h1 className="title-main">
          <span className="title-pit">PIT</span>
          <span className="title-wall">WALL</span>
        </h1>
        <div ref={titleRuleRef} className="title-rule" />
        <p className="title-sub">Powered by OpenF1</p>
      </div>

      {/* ── Footer ── */}
      <footer ref={footerRef} className="dash-footer">
        <span className="footer-dot">●</span>
        <span>PITWALL</span>
        <span className="footer-dot">●</span>
        <span>RACE INTELLIGENCE</span>
        <span className="footer-spacer" />
        <span>2026 SEASON</span>
        <span className="footer-dot">●</span>
        <span>OpenF1 API</span>
        <span className="footer-dot">●</span>

        {/* ── Subtle About Dev entry point ── */}
        <button
          onClick={() => navigate("/about")}
          style={{
            fontFamily: "inherit",
            fontSize: "inherit",
            letterSpacing: "inherit",
            textTransform: "inherit",
            color: "inherit",
            background: "none",
            border: "none",
            cursor: "pointer",
            opacity: 0.45,
            transition: "opacity 220ms, color 220ms",
            padding: 0,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.opacity = "1";
            e.currentTarget.style.color = "#f0f0f0";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.opacity = "0.45";
            e.currentTarget.style.color = "";
          }}
        >
          BUILT BY KARTHIK
        </button>
      </footer>
    </div>
  );
}