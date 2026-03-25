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
  const [trackImage, setTrackImage] = useState(null);   // ← NEW

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`${API_BASE}/race-results?session_key=${session_key}`).then(res => res.json()),
      fetch(`${API_BASE}/drivers?session_key=${session_key}`).then(res => res.json()),
      fetch(`${API_BASE}/sessions`).then(res => res.json())   // ← NEW
    ])
      .then(([resultsData, driversData, sessionsData]) => {

        if (!Array.isArray(resultsData) || !Array.isArray(driversData)) {
          setResults({ classified: [], notClassified: [] });
          setLoading(false);
          return;
        }

        // 🔥 DRIVER MAP
        const map = {};
        driversData.forEach(d => { map[d.driver_number] = d; });
        setDriverMap(map);

        // 🔥 FIND TRACK IMAGE
        const session = sessionsData.find(
          s => String(s.session_key) === String(session_key)
        );

        if (session) {
          const circuit = session.circuit_short_name?.toLowerCase();

          const TRACK_IMAGES = {
            melbourne: "/tracks/Melbourne.avif",
            suzuka: "/tracks/Suzuka.avif",
            monaco: "/tracks/Montecarlo.avif",
            silverstone: "/tracks/Silverstone.avif",
            bahrain: "/tracks/Bahrain.avif",
            baku: "/tracks/Baku.avif",
            catalunya: "/tracks/Catalunya.avif",
            hungaroring: "/tracks/Hungaroring.avif",
            interlagos: "/tracks/Interlagos.avif",
            lasvegas: "/tracks/Lasvegas.avif",
            lusail: "/tracks/Lusail.avif",
            madrid: "/tracks/Madrid.avif",
            mexicocity: "/tracks/Mexicocity.avif",
            miami: "/tracks/Miami.avif",
            montreal: "/tracks/Montreal.avif",
            monza: "/tracks/Monza.avif",
            saudiarabia: "/tracks/Saudiarabia.avif",
            shanghai: "/tracks/Shanghai.avif",
            singapore: "/tracks/Singapore.avif",
            spa: "/tracks/SpaFrancorchamps.avif",
            spielberg: "/tracks/Spielberg.avif",
            yasmarina: "/tracks/Yasmarina.avif",
            zandvoort: "/tracks/Zandvoort.avif",
            austin: "/tracks/Austin.avif"
          };

          setTrackImage(TRACK_IMAGES[circuit] || null);
        }

        // 🔥 MERGE RESULTS
        const merged = resultsData.map(r => {
          const driver = map[r.driver_number];
          return {
            ...r,
            name: driver?.full_name || "—",
            team: driver?.team_name || "—"
          };
        });

        merged.sort((a, b) => {
          if (a.position === null) return 1;
          if (b.position === null) return -1;
          return a.position - b.position;
        });

        setResults({
          classified: merged.filter(r => r.position !== null),
          notClassified: merged.filter(r => r.position === null),
        });

        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });

  }, [session_key]);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Race Results</h1>

      {/* 🏁 TRACK SECTION */}
      {trackImage && (
        <div style={{
          marginBottom: "30px",
          background: "#0f172a",
          padding: "20px",
          borderRadius: "10px"
        }}>
          <h2 style={{ marginBottom: "10px" }}>Circuit Layout</h2>

          <img
            src={trackImage}
            alt="track"
            style={{
              width: "100%",
              maxHeight: "400px",
              objectFit: "contain"
            }}
          />
        </div>
      )}

      <button
        onClick={() => navigate(`/stints/${session_key}`)}
        style={{ marginBottom: "15px" }}
      >
        View Stint Analysis
      </button>

      {loading && <p>Loading race results...</p>}
      {error && <p>Error: {error}</p>}

      {!loading && results.classified.length > 0 && (
        <>
          <h2>Classified</h2>
          <table border="1" cellPadding="10">
            <thead>
              <tr>
                <th>Pos</th>
                <th>Driver</th>
                <th>Team</th>
                <th>Gap</th>
                <th>Pts</th>
              </tr>
            </thead>

            <tbody>
              {results.classified.map(r => (
                <tr
                  key={r.driver_number}
                  onClick={() => navigate(`/driver/${r.driver_number}/${session_key}`)}
                  style={{ cursor: "pointer" }}
                >
                  <td>{r.position}</td>

                  <td>
                    {driverMap[r.driver_number]
                      ? <DriverAvatar driver={driverMap[r.driver_number]} size={32} />
                      : r.name}
                  </td>

                  <td>{r.team}</td>
                  <td>{r.position === 1 ? "Winner" : r.gap_to_leader || "—"}</td>
                  <td>{r.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default RaceDetail;