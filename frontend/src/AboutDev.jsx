import React from "react";
import { useNavigate } from "react-router-dom";

function AboutDev() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: "#07070f", color: "#f0f0f0" }}>

      {/* Ambient blobs — mirrored from Drivers page */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[120px]"
          style={{ background: "rgba(225,6,0,0.06)" }} />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full blur-[100px]"
          style={{ background: "rgba(180,0,0,0.05)" }} />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full blur-[80px]"
          style={{ background: "rgba(30,30,40,0.20)" }} />
      </div>

      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0"
        style={{
          opacity: 0.025,
          backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      <div className="relative z-10 mx-auto max-w-6xl px-6 sm:px-10 py-14">

        {/* ── Header ── */}
        <div className="mb-12">
          <p style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "10px",
            letterSpacing: "0.32em",
            color: "#5a6070",
            textTransform: "uppercase",
            marginBottom: "8px",
          }}>PITWALL · DEVELOPER PROFILE</p>

          <h1 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(36px, 7vw, 72px)",
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.01em",
            textTransform: "uppercase",
            marginBottom: "10px",
          }}>
            <span style={{ color: "#f0f0f0" }}>ABOUT THE</span>{" "}
            <span style={{ color: "#e10600" }}>DEVELOPER</span>
          </h1>

          <p style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "10px",
            letterSpacing: "0.24em",
            color: "#5a6070",
            textTransform: "uppercase",
            marginBottom: "16px",
          }}>KARTHIK · BTECH STUDENT · F1 ENTHUSIAST</p>

          <div style={{ height: "1px", background: "linear-gradient(90deg, #e10600 0%, rgba(225,6,0,0.3) 40%, transparent 100%)", maxWidth: "180px" }} />
        </div>

        {/* ── Split Layout ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "clamp(220px, 30%, 300px) 1fr",
          gap: "clamp(32px, 6vw, 72px)",
          alignItems: "start",
        }}
          className="about-grid"
        >

          {/* ── LEFT: Profile Image ── */}
          <div style={{ position: "sticky", top: "32px" }}>
            {/* Image card */}
            <div style={{
              position: "relative",
              borderRadius: "12px",
              overflow: "hidden",
              border: "1px solid rgba(255,255,255,0.07)",
              background: "#0f1117",
            }}>
              {/* Red accent top line */}
              <div style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "2px",
                background: "linear-gradient(90deg, #e10600, rgba(225,6,0,0.3), transparent)",
                zIndex: 2,
              }} />

              <img
                src="/kar-mclaren.png"
                alt="Karthik — Developer"
                style={{
                  display: "block",
                  width: "100%",
                  aspectRatio: "3 / 4",
                  objectFit: "cover",
                  filter: "saturate(0.85) brightness(0.95)",
                }}
                onError={e => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextSibling.style.display = "flex";
                }}
              />

              {/* Fallback avatar when no image */}
              <div style={{
                display: "none",
                alignItems: "center",
                justifyContent: "center",
                aspectRatio: "3 / 4",
                background: "linear-gradient(135deg, #0f1117 0%, #131620 100%)",
              }}>
                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="rgba(225,6,0,0.5)" strokeWidth="1">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                </svg>
              </div>

              {/* Bottom metadata strip */}
              <div style={{
                padding: "14px 16px",
                borderTop: "1px solid rgba(255,255,255,0.06)",
                background: "rgba(7,7,15,0.6)",
              }}>
                <p style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "16px",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#f0f0f0",
                  marginBottom: "2px",
                }}>SRI KARTHIK</p>
                <p style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "9px",
                  letterSpacing: "0.18em",
                  color: "#5a6070",
                  textTransform: "uppercase",
                }}>FULL-STACK · F1 FAN</p>
              </div>
            </div>

            {/* Social links */}
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { label: "GITHUB", href: "https://github.com/srikarthikB", icon: "⌥" },
                { label: "LINKEDIN", href: "https://www.linkedin.com/in/sri-karthik-b-060106324/", icon: "◈" },
                { label: "EMAIL", href: "mailto:sri16karthik@gmail.com", icon: "◉" },
              ].map(({ label, href, icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 14px",
                    background: "rgba(15,17,23,0.85)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: "8px",
                    textDecoration: "none",
                    transition: "border-color 180ms, background 180ms",
                    cursor: "pointer",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "rgba(225,6,0,0.4)";
                    e.currentTarget.style.background = "rgba(225,6,0,0.05)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.background = "rgba(15,17,23,0.85)";
                  }}
                >
                  <span style={{ color: "#e10600", fontSize: "12px", width: "14px", textAlign: "center" }}>{icon}</span>
                  <span style={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: "9px",
                    letterSpacing: "0.2em",
                    color: "#8891a0",
                    textTransform: "uppercase",
                  }}>{label}</span>
                  <span style={{
                    marginLeft: "auto",
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: "9px",
                    color: "rgba(255,255,255,0.15)",
                  }}>→</span>
                </a>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Text sections ── */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>

            {[
              {
                tag: "01 · IDENTITY",
                title: "Who Am I?",
                icon: "👨‍💻",
                content: "Hi, I'm Karthik — a BTech student who enjoys building projects and solving real problems. I blend a passion for engineering with a love for data-driven design, which led to creating PITWALL.",
              },
              {
                tag: "02 · PASSION",
                title: "My F1 Obsession",
                icon: "🏎️",
                content: "What started as casual race watching evolved into deep analysis of race strategies, lap delta, and driver psychology. Formula 1 is the only sport where engineering and instinct collide at 340 km/h.",
              },
              {
                tag: "03 · FAVOURITE",
                title: "Favourite Driver",
                icon: "⭐",
                content: null,
                custom: (
                  <div style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 18px",
                    background: "rgba(225,6,0,0.07)",
                    border: "1px solid rgba(225,6,0,0.2)",
                    borderRadius: "8px",
                    marginTop: "10px",
                  }}>
                    <span style={{ fontSize: "24px" }}>🏆</span>
                    <div>
                      <p style={{
                        fontFamily: "'Barlow Condensed', sans-serif",
                        fontSize: "20px",
                        fontWeight: 800,
                        letterSpacing: "0.06em",
                        textTransform: "uppercase",
                        color: "#f0f0f0",
                        lineHeight: 1,
                      }}>Lando Norris</p>
                      <p style={{
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: "9px",
                        letterSpacing: "0.18em",
                        color: "#5a6070",
                        textTransform: "uppercase",
                        marginTop: "3px",
                      }}>Mclaren F1 Team· #1</p>
                    </div>
                  </div>
                ),
              },
              {
                tag: "04 · MOTIVATION",
                title: "Why I Built This",
                icon: "💡",
                content: "I wanted to build something beyond generic CRUD projects — something that reflects who I am. PITWALL is my attempt at a real analytics tool: visualizing race data, pit strategies, and championship battles the way an actual F1 engineer would.",
              },
            ].map(({ tag, title, icon, content, custom }, idx, arr) => (
              <div
                key={tag}
                style={{
                  padding: "28px 0",
                  borderBottom: idx < arr.length - 1 ? "1px solid rgba(255,255,255,0.05)" : "none",
                }}
              >
                <p style={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "9px",
                  letterSpacing: "0.28em",
                  color: "#e10600",
                  textTransform: "uppercase",
                  marginBottom: "8px",
                }}>{tag}</p>

                <h2 style={{
                  fontFamily: "'Barlow Condensed', sans-serif",
                  fontSize: "clamp(22px, 3vw, 30px)",
                  fontWeight: 700,
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  color: "#f0f0f0",
                  marginBottom: "12px",
                  lineHeight: 1.1,
                }}>
                  <span style={{ marginRight: "10px", fontSize: "0.85em" }}>{icon}</span>
                  {title}
                </h2>

                {content && (
                  <p style={{
                    fontFamily: "'Barlow', sans-serif",
                    fontSize: "14px",
                    fontWeight: 300,
                    lineHeight: 1.75,
                    color: "#8891a0",
                    maxWidth: "560px",
                  }}>{content}</p>
                )}
                {custom}
              </div>
            ))}

          </div>
        </div>

        {/* ── Footer divider ── */}
        <div style={{
          marginTop: "60px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}>
          <span style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.06))" }} />
          <span style={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "9px",
            letterSpacing: "0.28em",
            color: "#5a6070",
            textTransform: "uppercase",
          }}>PITWALL · F1 ANALYTICS</span>
          <span style={{ height: "1px", flex: 1, background: "linear-gradient(90deg, rgba(255,255,255,0.06), transparent)" }} />
        </div>

        {/* Back button */}
        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <button
            onClick={() => navigate("/")}
            style={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "9px",
              letterSpacing: "0.24em",
              color: "#5a6070",
              textTransform: "uppercase",
              background: "none",
              border: "none",
              cursor: "pointer",
              transition: "color 200ms",
              padding: "8px 0",
            }}
            onMouseEnter={e => e.currentTarget.style.color = "#f0f0f0"}
            onMouseLeave={e => e.currentTarget.style.color = "#5a6070"}
          >
            ← BACK TO PITWALL
          </button>
        </div>

      </div>

      {/* Responsive styles */}
      <style>{`
        @media (max-width: 640px) {
          .about-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default AboutDev;