import { useState, useEffect } from "react";
import DriverCard from "./DriverCard";
import API_BASE from "./config";
import { useNavigate } from "react-router-dom";

function Drivers() {
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetch(`${API_BASE}/drivers`)
      .then(res => res.json())
      .then(data => {
        setDrivers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070f]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-2 border-red-500 border-t-transparent animate-spin" />
        <p className="font-mono text-xs tracking-widest uppercase text-zinc-600">INITIALIZING GRID…</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex items-center justify-center bg-[#07070f]">
      <p className="font-mono text-xs tracking-widest uppercase text-red-500">TELEMETRY ERROR: {error}</p>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden">

      {/* Ambient blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-red-700/[0.06] blur-[120px]" />
        <div className="absolute top-1/2 -right-60 w-[500px] h-[500px] rounded-full bg-red-900/[0.05] blur-[100px]" />
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] rounded-full bg-zinc-800/20 blur-[80px]" />
      </div>

      {/* Grid texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(#fff 1px,transparent 1px),linear-gradient(90deg,#fff 1px,transparent 1px)",
          backgroundSize: "40px 40px",
        }} />

      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-10 py-14">

        {/* Header */}
        <div className="mb-12">
          <div className="pw-eyebrow">2025 SEASON</div>
          <h1 className="pw-title">
            DRIVERS
            <span className="pw-title-red">CHAMPIONSHIP</span>
          </h1>
          <p className="pw-subtitle">
            {drivers.length > 0 ? `${drivers.length} DRIVERS · ACTIVE SEASON` : "LOADING GRID…"}
          </p>
          <div className="pw-divider" />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {drivers.map((driver) => (
            <DriverCard key={driver.driver_number} driver={driver} />
          ))}
        </div>

        {/* Footer */}
        <div className="mt-16 flex items-center gap-3">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
          <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-700">
            F1 Analytics · Live Data
          </span>
          <span className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
        </div>
      </div>
    </div>
  );
}

export default Drivers;