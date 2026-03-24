import { useNavigate } from "react-router-dom";
import DriverAvatar from "./DriverAvatar";                     // ← ADDED

function DriverCard({ driver }) {
  const navigate = useNavigate();
  return (
    <li>
      {/* CHANGED: replaced plain text with DriverAvatar */}
      <button onClick={() => navigate(`/driver/${driver.driver_number}`)}>
        <DriverAvatar driver={driver} size={36} />
      </button>
    </li>
  );
}

export default DriverCard;