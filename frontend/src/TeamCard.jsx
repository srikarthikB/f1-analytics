import { useNavigate } from "react-router-dom";

function TeamCard({ team }) {
  const navigate = useNavigate();

  return (
    <li>
      <button
        style={{ color: team.color }}
        onClick={() => navigate(`/team/${encodeURIComponent(team.id)}`)}
      >
        P{team.position} — {team.name}
      </button>
    </li>
  );
}

export default TeamCard;