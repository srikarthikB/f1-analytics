import { useEffect, useState } from "react";
import API_BASE from "./config";

const CURRENT_YEAR = new Date().getFullYear();

function DriverComparision() {
  const [allDrivers, setAllDrivers] = useState([]);
  const [driver1Id, setDriver1Id]   = useState("");
  const [driver2Id, setDriver2Id]   = useState("");
  const [stats1, setStats1]         = useState(null);
  const [stats2, setStats2]         = useState(null);
  const [loading, setLoading]       = useState(true);
  const [statsLoading, setStatsLoading] = useState(false);

  // Fetch driver list
  useEffect(() => {
    fetch(`${API_BASE}/drivers`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length >= 2) {
          setAllDrivers(data);
          setDriver1Id(String(data[0].driver_number));
          setDriver2Id(String(data[1].driver_number));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Fetch stats — always uses current year, no year param needed
  useEffect(() => {
    if (!driver1Id || !driver2Id) return;

    setStatsLoading(true);
    setStats1(null);
    setStats2(null);

    fetch(`${API_BASE}/compare-fast?driver1=${driver1Id}&driver2=${driver2Id}&year=${CURRENT_YEAR}`)
      .then(res => res.json())
      .then(data => {
        console.log("Compare-fast response:", data);
        setStats1(data.driver1 && typeof data.driver1 === "object" ? data.driver1 : {});
        setStats2(data.driver2 && typeof data.driver2 === "object" ? data.driver2 : {});
        setStatsLoading(false);
      })
      .catch(err => {
        console.error("Compare-fast error:", err);
        setStats1({});
        setStats2({});
        setStatsLoading(false);
      });
  }, [driver1Id, driver2Id]);

  const d1 = allDrivers.find(d => String(d.driver_number) === driver1Id);
  const d2 = allDrivers.find(d => String(d.driver_number) === driver2Id);

  if (loading) return <p>Loading drivers...</p>;

  return (
    <div>
      <h1>Driver Comparison ({CURRENT_YEAR} Season)</h1>

      {/* Driver selectors */}
      <div style={{ marginBottom: "16px" }}>
        <label>Driver 1: </label>
        <select value={driver1Id} onChange={e => setDriver1Id(e.target.value)}>
          {allDrivers.map(d => (
            <option key={d.driver_number} value={d.driver_number}>
              {d.full_name}
            </option>
          ))}
        </select>

        <label style={{ marginLeft: "20px" }}>Driver 2: </label>
        <select value={driver2Id} onChange={e => setDriver2Id(e.target.value)}>
          {allDrivers.map(d => (
            <option key={d.driver_number} value={d.driver_number}>
              {d.full_name}
            </option>
          ))}
        </select>
      </div>

      {/* Loading state */}
      {statsLoading && <p>Loading stats...</p>}

      {/* Comparison table */}
      {!statsLoading && stats1 !== null && stats2 !== null && (
        <table border="1" cellPadding="10">
          <thead>
            <tr>
              <th>Stat</th>
              <th>{d1?.full_name ?? "Driver 1"}</th>
              <th>{d2?.full_name ?? "Driver 2"}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Points</td>
              <td>{stats1?.points ?? "—"}</td>
              <td>{stats2?.points ?? "—"}</td>
            </tr>
            <tr>
              <td>Championship Position</td>
              <td>{stats1?.position ?? "—"}</td>
              <td>{stats2?.position ?? "—"}</td>
            </tr>
            <tr>
              <td>Team</td>
              <td>{stats1?.team ?? "—"}</td>
              <td>{stats2?.team ?? "—"}</td>
            </tr>
            <tr>
              <td>Last Race Finish</td>
              <td>{stats1?.last_finish ?? "—"}</td>
              <td>{stats2?.last_finish ?? "—"}</td>
            </tr>
            <tr>
              <td>Consistency</td>
              <td>{stats1?.consistency != null ? stats1.consistency.toFixed(2) : "—"}</td>
              <td>{stats2?.consistency != null ? stats2.consistency.toFixed(2) : "—"}</td>
            </tr>
          </tbody>
        </table>
      )}
    </div>
  );
}

export default DriverComparision;