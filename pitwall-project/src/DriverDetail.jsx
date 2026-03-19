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
    </div>
  );
}

export default DriverDetail;