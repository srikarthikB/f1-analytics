function DriverAvatar({ driver, size = 50 }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      <img
        src={driver.headshot_url || "/default-avatar.png"}
        alt={driver.full_name}
        onError={(e) => { e.target.src = "/default-avatar.png"; }}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
          border: `2px solid ${driver.team_colour || "#fff"}`
        }}
      />
      <div>
        <div style={{ fontWeight: "bold" }}>
          {driver.full_name}
        </div>
        <div style={{ fontSize: "12px", color: "#aaa" }}>
          {driver.team_name}
        </div>
      </div>
    </div>
  );
}

export default DriverAvatar;