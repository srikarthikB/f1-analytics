import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API_BASE from "./config";
import { useNavigate } from "react-router-dom";

function RaceDetail() {
  const { session_key } = useParams();
  const navigate = useNavigate();
  const [results, setResults] = useState({ classified: [], notClassified: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    Promise.all([
        fetch(`${API_BASE}/race-results?session_key=${session_key}`).then(res => res.json()),
        fetch(`${API_BASE}/drivers?session_key=${session_key}`).then(res => res.json())
    ])
        .then(([resultsData, driversData]) => {
        if (!Array.isArray(resultsData) || !Array.isArray(driversData)) {
            setResults([]);
            setLoading(false);
            return;
        }

        // 🔥 Create driver lookup map
        const driverMap = {};
        driversData.forEach(d => {
            driverMap[d.driver_number] = d;
        });

        // 🔥 Merge data
        const merged = resultsData.map(r => {
            const driver = driverMap[r.driver_number];

            return {
            ...r,
            name: driver?.full_name || "—",
            team: driver?.team_name || "—"
            };
        });

        // 🔥 Sort (DNFs go last automatically)
        merged.sort((a, b) => {
            if (a.position === null) return 1;
            if (b.position === null) return -1;
            return a.position - b.position;
        });
        const classified = merged.filter(r => r.position !== null);
        const notClassified = merged.filter(r => r.position === null);

        setResults({ classified, notClassified });
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
        <button
            onClick={() => navigate(`/stints/${session_key}`)}
            style={{ marginBottom: "15px" }}
        >
            View Stint Analysis
        </button>
      {/* 🟡 Loading */}
      {loading && <p>Loading race results...</p>}

      {/* 🔴 Error */}
      {error && <p>Error: {error}</p>}

      {/* ⚪ No data */}
      {!loading && results.classified.length === 0 && results.notClassified.length === 0 && (
        <p>No results found.</p>
      )}

      {/* 🏁 Results Table */}
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
                        r.position === 1
                        ? "#ffd700"
                        : r.position === 2
                        ? "#c0c0c0"
                        : r.position === 3
                        ? "#cd7f32"
                        : "white"
                    }}
                >
                    <td>{r.position}</td>
                    <td>{r.name}</td>
                    <td>{r.team}</td>
                    <td>
                    {r.position === 1
                        ? "Winner"
                        : r.gap_to_leader || "—"}
                    </td>
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
                        <td>{r.name}</td>
                        <td>{r.team}</td>
                        <td>
                        {r.dnf ? "DNF" : r.dns ? "DNS" : "—"}
                        </td>
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