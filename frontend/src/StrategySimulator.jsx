import { useState } from "react";

function StrategySimulator() {
  const [laps, setLaps] = useState(5);
  const [pitLap, setPitLap] = useState(3);
  const [tire, setTire] = useState("soft");
  const [totalTime, setTotalTime] = useState(null);

  const simulate = () => {
    let time = 0;

    for (let i = 1; i <= laps; i++) {
        let lapTime = 90 + (Math.random() * 2 - 1);

        if (tire === "soft") lapTime -= 2;
        else if (tire === "hard") lapTime += 2;

        time += lapTime;

        if (i === pitLap) {
        time += 20;
        }
    }

    setTotalTime(time);
    };

    function formatTime(totalSeconds) {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);
    const milliseconds = Math.floor((totalSeconds % 1) * 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
    }

  return (
    <div>
      <h2>Strategy Simulator</h2>

      <input
        type="number"
        value={laps}
        onChange={(e) => setLaps(parseInt(e.target.value))}
      />

      <input
        type="number"
        value={pitLap}
        onChange={(e) => setPitLap(parseInt(e.target.value))}
      />

      <select value={tire} onChange={(e) => setTire(e.target.value)}>
        <option value="soft">Soft</option>
        <option value="medium">Medium</option>
        <option value="hard">Hard</option>
      </select>

      <button onClick={simulate}>Simulate Strategy</button>
      {totalTime !== null && (
        <h1>Total Time: {formatTime(totalTime)}</h1>
     )}
    </div>
  );
}

export default StrategySimulator;