import { useEffect, useState } from "react";
import TeamCard from "./TeamCard";

function Teams() {
  const [teams, setTeams] = useState([]);

  useEffect(() => {
    fetch("http://127.0.0.1:8000/teams")
      .then((response) => response.json())
      .then((data) => setTeams(data));
  }, []);

  return (
    <div style={{
      display: "flex",
      flexWrap: "wrap",
      gap: "10px"
    }}>
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}

export default Teams;