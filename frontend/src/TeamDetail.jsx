import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import API_BASE from "./config";
import DriverAvatar from "./DriverAvatar";                     // ← ADDED

function TeamDetail() {
  const { id } = useParams();
  const [team, setTeam]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetch(`${API_BASE}/team/${id}/history`)
      .then(res => res.json())
      .then(data => setHistory(Array.isArray(data) ? data : []));
  }, [id]);

  useEffect(() => {
    fetch(`${API_BASE}/team/${id}`)
      .then(res => res.json())
      .then(data => {
        setTeam(data && !data.error ? data : null);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, [id]);

  if (loading) return <p>Loading team...</p>;
  if (error)   return <p>Error: {error}</p>;
  if (!team)   return <p>Team not found.</p>;

  return (
    <div>
      <h1 style={{ color: team.color }}>{team.name}</h1>
      <p>Position: P{team.position}</p>
      <p>Points: {team.points}</p>

      <hr />

      <h2>Drivers</h2>

      {team.drivers && team.drivers.length > 0 ? (
        <ul>
          {team.drivers.map(d => (
            <li key={d.driver_number}>
              {/* CHANGED: replaced "{d.name} (#{d.driver_number})" with DriverAvatar.
                  team.drivers uses d.name not d.full_name, so we normalize before passing */}
              <DriverAvatar
                driver={{ ...d, full_name: d.name ?? d.full_name, team_name: team.name, team_colour: team.color }}
                size={40}
              />
            </li>
          ))}
        </ul>
      ) : (
        <p>No drivers found.</p>
      )}

      <hr />

      <h2>Team History</h2>
      {history.length === 0 ? (
        <p>No history data.</p>
      ) : (
        <table border="1" cellPadding="6">
          <thead>
            <tr>
              <th>Year</th>
              <th>Position</th>
              <th>Points</th>
            </tr>
          </thead>
          <tbody>
            {history.map(h => (
              <tr key={h.year}>
                <td>{h.year}</td>
                <td>P{h.position}</td>
                <td>{h.points}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default TeamDetail;