import { useNavigate } from "react-router-dom";

function DriverCard({ driver }) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/driver/${driver.id}`)}
      style={{
        border: "1px solid white",
        padding: "10px",
        width: "200px",
        cursor: "pointer"
      }}
    >
      <h2>{driver.name}</h2>
    </div>
  );
}

export default DriverCard;