import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API_BASE from "./config";

function Teams() {
  const [teams, setTeams]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/teams`)
      .then(res => res.json())
      .then(data => {
        setTeams(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) return <p>Loading teams...</p>;
  if (error)   return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Teams ({teams.length})</h1>
      <ul>
        {teams.map(team => (
          <li key={team.id} style={{ marginBottom: "6px" }}>
            <button onClick={() => navigate(`/team/${team.id}`)}>
              P{team.position} — {team.name}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Teams;