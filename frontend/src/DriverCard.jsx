import { useNavigate } from "react-router-dom";

function DriverCard({ driver }) {
  const navigate = useNavigate();
  return (
    <li>
      <button onClick={() => navigate(`/driver/${driver.driver_number}`)}>
        #{driver.driver_number} — {driver.full_name} ({driver.team_name})
      </button>
    </li>
  );
}

export default DriverCard;