import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_BASE from "./config";
import DriverAvatar from "./DriverAvatar";                     // ← ADDED

function RaceDetail() {
  const { session_key } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState({ classified: [], notClassified: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // driverMap stored in state so DriverAvatar can access full driver objects
  const [driverMap, setDriverMap] = useState({});            // ← ADDED

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
      fetch(`${API_BASE}/race-results?session_key=${session_key}`).then(res => res.json()),
      fetch(`${API_BASE}/drivers?session_key=${session_key}`).then(res => res.json())
    ])
      .then(([resultsData, driversData]) => {
        if (!Array.isArray(resultsData) || !Array.isArray(driversData)) {
          setResults({ classified: [], notClassified: [] });
          setLoading(false);
          return;
        }

        const map = {};
        driversData.forEach(d => { map[d.driver_number] = d; });
        setDriverMap(map);                                    // ← ADDED

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

  return (
    <div style={{ padding: "20px" }}>
      <h1>Race Results</h1>
      <button onClick={() => navigate(`/stints/${session_key}`)} style={{ marginBottom: "15px" }}>
        View Stint Analysis
      </button>

      {loading && <p>Loading race results...</p>}
      {error && <p>Error: {error}</p>}
      {!loading && results.classified.length === 0 && results.notClassified.length === 0 && (
        <p>No results found.</p>
      )}

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
                  style={{
                    cursor: "pointer",
                    backgroundColor:
                      r.position === 1 ? "#ffd700" :
                      r.position === 2 ? "#c0c0c0" :
                      r.position === 3 ? "#cd7f32" : "white"
                  }}
                >
                  <td>{r.position}</td>
                  {/* CHANGED: replaced {r.name} with DriverAvatar using driverMap lookup */}
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

          {results.notClassified.length > 0 && (
            <>
              <h2 style={{ marginTop: "20px" }}>Not Classified</h2>
              <table border="1" cellPadding="10">
                <thead>
                  <tr>
                    <th>Driver</th>
                    <th>Team</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {results.notClassified.map(r => (
                    <tr
                      key={r.driver_number}
                      onClick={() => navigate(`/driver/${r.driver_number}/${session_key}`)}
                      style={{ cursor: "pointer" }}
                    >
                      {/* CHANGED: replaced {r.name} with DriverAvatar using driverMap lookup */}
                      <td>
                        {driverMap[r.driver_number]
                          ? <DriverAvatar driver={driverMap[r.driver_number]} size={32} />
                          : r.name}
                      </td>
                      <td>{r.team}</td>
                      <td>{r.dnf ? "DNF" : r.dns ? "DNS" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </>
      )}
    </div>
  );
}

export default RaceDetail;