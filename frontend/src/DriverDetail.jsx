import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";

function DriverDetail() {
  const { id } = useParams();
  const [driver, setDriver] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/drivers/${id}`)
      .then(res => res.json())
      .then(data => setDriver(data));
  }, [id]);

  useEffect(() => {
    fetch(`http://127.0.0.1:8000/drivers/${id}/performance`)
      .then(res => res.json())
      .then(data => setPerformanceData(data));
  }, [id]);

  if (!driver) return <p>Loading...</p>;

  const avgPoints = performanceData.length > 0
    ? performanceData.reduce((sum, entry) => sum + entry.points, 0) / performanceData.length
    : 0;

  const consistencyScore = performanceData.length > 0
    ? performanceData.reduce((sum, entry) => sum + Math.abs(entry.points - avgPoints), 0) / performanceData.length
    : 0;

  const bestSeason = performanceData.reduce((best, entry) => entry.points > best.points ? entry : best, { points: 0 });
  
  return (
    <div>
      <h1>{driver.name}</h1>
        <p>Team: {driver.team}</p>
        <p>Points: {driver.points}</p>
        <LineChart width={500} height={300} data={performanceData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="year" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="points" stroke="#8884d8" />
        </LineChart>
        <p>Average Points per Season: {performanceData.length > 0 ? avgPoints.toFixed(2) : "Loading..."}</p>
        <p>Consistency Score: {performanceData.length > 0 ? consistencyScore.toFixed(2) : "Loading..."}</p>
        <p>Best Season: {bestSeason ? `${bestSeason.year} (${bestSeason.points} points)` : "Loading..."}</p>
    </div>
  );
}

export default DriverDetail;