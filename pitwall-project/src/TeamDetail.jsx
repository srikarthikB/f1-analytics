import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";

function TeamDetail() {
  const [team, setTeam] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/team/${id}`)
      .then(res => res.json())
      .then(data => setTeam(data));
  }, [id]);

  if (!team) return <p>Loading...</p>;

  return (
    <div>
      <h1>{team.name}</h1>
        <p>Points: {team.points}</p>
    </div>
  );
}

export default TeamDetail;