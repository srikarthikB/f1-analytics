import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE from "./config";
import DriverAvatar from "./DriverAvatar";

function RaceDetail() {
  const { session_key } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState({ classified: [], notClassified: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [driverMap, setDriverMap] = useState({});
  const [trackImage, setTrackImage] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`${API_BASE}/race-results?session_key=${session_key}`).then(res => res.json()),
      fetch(`${API_BASE}/drivers?session_key=${session_key}`).then(res => res.json()),
      fetch(`${API_BASE}/sessions`).then(res => res.json()),
    ])
      .then(([resultsData, driversData, sessionsData]) => {
        if (!Array.isArray(resultsData) || !Array.isArray(driversData)) {
          setResults({ classified: [], notClassified: [] });
          setLoading(false);
          return;
        }

        // Driver map
        const map = {};
        driversData.forEach(d => { map[d.driver_number] = d; });
        setDriverMap(map);

        // Track image
        const session = sessionsData.find(
          s => String(s.session_key) === String(session_key)
        );
        if (session) {
          const circuit = session.circuit_short_name?.toLowerCase();
          const TRACK_IMAGES = {
            melbourne:    "/tracks/Melbourne.avif",
            suzuka:       "/tracks/Suzuka.avif",
            monaco:       "/tracks/Montecarlo.avif",
            silverstone:  "/tracks/Silverstone.avif",
            bahrain:      "/tracks/Bahrain.avif",
            baku:         "/tracks/Baku.avif",
            catalunya:    "/tracks/Catalunya.avif",
            hungaroring:  "/tracks/Hungaroring.avif",
            interlagos:   "/tracks/Interlagos.avif",
            lasvegas:     "/tracks/Lasvegas.avif",
            lusail:       "/tracks/Lusail.avif",
            madrid:       "/tracks/Madrid.avif",
            mexicocity:   "/tracks/Mexicocity.avif",
            miami:        "/tracks/Miami.avif",
            montreal:     "/tracks/Montreal.avif",
            monza:        "/tracks/Monza.avif",
            saudiarabia:  "/tracks/Saudiarabia.avif",
            shanghai:     "/tracks/Shanghai.avif",
            singapore:    "/tracks/Singapore.avif",
            spa:          "/tracks/SpaFrancorchamps.avif",
            spielberg:    "/tracks/Spielberg.avif",
            yasmarina:    "/tracks/Yasmarina.avif",
            zandvoort:    "/tracks/Zandvoort.avif",
            austin:       "/tracks/Austin.avif",
          };
          setTrackImage(TRACK_IMAGES[circuit] || null);
        }

        // Merge + sort results
        const merged = resultsData.map(r => {
          const driver = map[r.driver_number];
          return {
            ...r,
            name: driver?.full_name || "—",
            team: driver?.team_name || "—",
          };
        });
        merged.sort((a, b) => {
          if (a.position === null) return 1;
          if (b.position === null) return -1;
          return a.position - b.position;
        });

        setResults({
          classified:    merged.filter(r => r.position !== null),
          notClassified: merged.filter(r => r.position === null),
        });
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [session_key]);

  if (loading) return <div className="pw-loading">Loading race results...</div>;
  if (error)   return <div className="pw-error">Error: {error}</div>;

  return (
    <div className="min-h-screen relative overflow-hidden bg-[#07070f]">

      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-48 -left-32 w-[600px] h-[500px] rounded-full bg-red-800/[0.06] blur-[130px]" />
        <div className="absolute bottom-0 -right-40 w-[500px] h-[400px] rounded-full bg-zinc-900/40 blur-[100px]" />
      </div>

      {/* Grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative z-10 mx-auto max-w-4xl px-6 sm:px-10 py-14">

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-8 text-zinc-500 hover:text-red-500 transition-colors duration-200 font-mono text-[11px] tracking-widest uppercase"
        >
          <span className="text-lg leading-none">←</span> Back
        </button>

        {/* Header */}
        <div className="mb-12">
          <div className="pw-eyebrow">RACE INTELLIGENCE</div>

          <h1 className="pw-title">
            RACE
            <span className="pw-title-red">DETAIL</span>
          </h1>

          <p className="pw-subtitle">
            SESSION {session_key} · ANALYSIS MODE
          </p>

          <div className="pw-divider" />
        </div>

        {/* Circuit layout */}
        {trackImage && (
          <div className="relative overflow-hidden rounded-2xl mb-8 border border-white/[0.06]
            bg-gradient-to-br from-[#0f0f1a] via-[#11111e] to-[#0a0a14]
            shadow-[0_4px_20px_rgba(0,0,0,0.4)]">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-orange-400/50 to-transparent" />
            <div className="px-6 pt-5 pb-2">
              <span className="text-[10px] font-black tracking-[0.25em] uppercase text-red-500 font-mono">Circuit Layout</span>
            </div>
            <div className="px-6 pb-6">
              <img
                src={trackImage}
                alt="circuit layout"
                className="w-full max-h-[380px] object-contain rounded-xl"
              />
            </div>
          </div>
        )}

        {/* Stint analysis button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/stints/${session_key}`)}
            className="
              relative flex items-center gap-3 px-6 py-3 rounded-xl
              font-mono text-[11px] tracking-widest uppercase font-black

              border border-red-500/40
              bg-gradient-to-r from-red-600/20 via-red-500/10 to-transparent
              text-red-400

              shadow-[0_0_12px_rgba(225,6,0,0.25)]
              backdrop-blur-md

              transition-all duration-300 ease-out

              hover:scale-[1.04]
              hover:shadow-[0_0_22px_rgba(225,6,0,0.6)]
              hover:bg-gradient-to-r hover:from-red-600/30 hover:to-red-500/10
              hover:text-red-300
              hover:border-red-400
            "
          >
            {/* glow layer */}
            <span className="absolute inset-0 rounded-xl bg-red-500/10 blur-xl opacity-60 pointer-events-none" />

            {/* icon */}
            <span className="text-lg leading-none animate-pulse">⬡</span>

            View Stint Analysis
          </button>
        </div>

        {/* Classified results */}
        {results.classified.length > 0 && (
          <>
            {/* Section label */}
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-6 bg-red-500/50" />
              <span className="text-[10px] font-black tracking-[0.25em] uppercase text-zinc-500 font-mono">Classified</span>
              <span className="h-px flex-1 bg-white/[0.04]" />
            </div>

            {/* Result rows */}
            <div className="flex flex-col gap-2 mb-8">
              {results.classified.map((r, index) => {
                const isPodium = r.position <= 3;
                const podiumColors = ["text-yellow-400", "text-zinc-300", "text-orange-400"];
                const posColor = isPodium ? podiumColors[r.position - 1] : "text-zinc-500";

                return (
                  <div
                    key={r.driver_number}
                    onClick={() => navigate(`/driver/${r.driver_number}/${session_key}`)}
                    className="group relative overflow-hidden rounded-2xl border transition-all duration-300 ease-out hover:scale-[1.012] cursor-pointer
                      bg-gradient-to-br from-[#0f0f1a] via-[#11111e] to-[#0a0a14]
                      border-white/[0.06] hover:border-red-500/25
                      shadow-[0_4px_20px_rgba(0,0,0,0.4)]
                      hover:shadow-[0_0_28px_rgba(239,68,68,0.10),0_6px_24px_rgba(0,0,0,0.5)]"
                  >
                    {/* Left accent */}
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-red-600/0 group-hover:bg-red-500/50 transition-all duration-300 rounded-r" />
                    {/* P1 top bar */}
                    {index === 0 && (
                      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-red-500 via-orange-400/50 to-transparent" />
                    )}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-r from-white/[0.02] to-transparent" />

                    <div className="flex items-center gap-5 px-5 py-4">
                      {/* Position badge */}
                      <div className={`flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl border transition-all duration-300
                        group-hover:border-red-500/20 group-hover:bg-red-500/[0.05]
                        bg-white/[0.04] border-white/[0.07]`}>
                        <span className="text-[9px] font-black tracking-widest uppercase font-mono leading-none text-zinc-600">Pos</span>
                        <span className={`text-lg font-black font-mono leading-none ${posColor}`}>{r.position}</span>
                      </div>

                      {/* Driver info */}
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          {driverMap[r.driver_number] && (
                            <DriverAvatar driver={driverMap[r.driver_number]} size={28} />
                          )}
                          <h3 className="text-sm font-black uppercase tracking-wide font-mono leading-tight truncate
                            transition-colors duration-200 group-hover:text-red-500 text-white">
                            {r.name}
                          </h3>
                        </div>
                        {r.team && r.team !== "—" && (
                          <span className="text-[11px] font-mono tracking-wide truncate text-zinc-500">{r.team}</span>
                        )}
                      </div>

                      {/* Gap + points */}
                      <div className="flex-shrink-0 flex flex-col items-end gap-1.5">
                        <span className="text-[11px] font-mono tracking-wide text-zinc-400">
                          {r.position === 1 ? "Winner" : r.gap_to_leader || "—"}
                        </span>
                        {r.points != null && r.points > 0 && (
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] font-mono text-zinc-600">pts</span>
                            <span className="text-[11px] font-black font-mono text-zinc-300">{r.points}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Not classified */}
        {results.notClassified.length > 0 && (
          <>
            <div className="flex items-center gap-3 mb-4">
              <span className="h-px w-6 bg-zinc-700" />
              <span className="text-[10px] font-black tracking-[0.25em] uppercase text-zinc-600 font-mono">Not Classified</span>
              <span className="h-px flex-1 bg-white/[0.04]" />
            </div>

            <div className="flex flex-col gap-2 mb-8">
              {results.notClassified.map(r => (
                <div
                  key={r.driver_number}
                  onClick={() => navigate(`/driver/${r.driver_number}/${session_key}`)}
                  className="group relative overflow-hidden rounded-2xl border transition-all duration-300 ease-out hover:scale-[1.012] cursor-pointer
                    bg-gradient-to-br from-[#0c0c14] to-[#090910]
                    border-white/[0.04] hover:border-zinc-600/30
                    shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                >
                  <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-zinc-700/0 group-hover:bg-zinc-600/40 transition-all duration-300 rounded-r" />

                  <div className="flex items-center gap-5 px-5 py-4">
                    <div className="flex-shrink-0 flex flex-col items-center justify-center w-12 h-12 rounded-xl border
                      bg-white/[0.02] border-white/[0.04]">
                      <span className="text-[9px] font-black tracking-widest uppercase font-mono leading-none text-zinc-700">DNF</span>
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                      <div className="flex items-center gap-2">
                        {driverMap[r.driver_number] && (
                          <DriverAvatar driver={driverMap[r.driver_number]} size={28} />
                        )}
                        <h3 className="text-sm font-black uppercase tracking-wide font-mono leading-tight truncate text-zinc-500">
                          {r.name}
                        </h3>
                      </div>
                      {r.team && r.team !== "—" && (
                        <span className="text-[11px] font-mono tracking-wide truncate text-zinc-700">{r.team}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Footer */}
        <div className="mt-14 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-700">F1 Analytics · Race Detail</span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default RaceDetail;