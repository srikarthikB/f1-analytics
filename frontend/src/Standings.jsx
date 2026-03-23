import { useEffect, useState } from "react";
import API_BASE from "./config";

function Standings() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);
  const [year, setYear] = useState("2024");
  const [years, setYears] = useState([]);
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/sessions`)
      .then(res => res.json())
      .then(data => {
        const uniqueYears = [...new Set(data.map(s => s.year))].sort((a, b) => b - a);
        setYears(uniqueYears.map(String));
        setYear(String(uniqueYears[0]));
      });
  }, []);

  useEffect(() => {
    if (!year) return;

    setLoading(true);
    setError(null);

    fetch(`${API_BASE}/standings?year=${year}`)
      .then(res => res.json())
      .then(d => {
        setDrivers(Array.isArray(d.drivers) ? d.drivers : []);
        setTeams(Array.isArray(d.teams) ? d.teams : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [year]);

  if (loading) return <p>Loading standings...</p>;
  if (error)   return <p>Error: {error}</p>;
  if (drivers.length === 0) return <p>No standings data.</p>;

  return (
    <div>
      <h1>Driver Standings</h1>
      <select value={year} onChange={(e) => setYear(e.target.value)}>
        {years.map(y => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>
      <table border="1" cellPadding="8">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Name</th>
            <th>Team</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map(item => (
            <tr key={item.driver_number ?? item.position}>
              <td>{item.position}</td>
              <td>{item.driver_name || item.full_name || "—"}</td>
              <td>{item.team_name || "—"}</td>
              <td>{item.points}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Team Standings</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Pos</th>
            <th>Team</th>
            <th>Points</th>
          </tr>
        </thead>
        <tbody>
          {Array.isArray(teams) && teams.map(t => (
            <tr key={t.team_name}>
              <td>{t.position}</td>
              <td>{t.team_name}</td>
              <td>{t.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Standings;