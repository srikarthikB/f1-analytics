import { useNavigate } from "react-router-dom";

function TeamCard({ team }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/team/${team.id}`)}
      style={{
        border: "1px solid white",
        padding: "10px",
        width: "200px",
        cursor: "pointer"
      }}
    >
      <h2>{team.name}</h2>
    </div>
  );
}

export default TeamCard;