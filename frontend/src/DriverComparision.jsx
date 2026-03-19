import { useEffect, useState } from "react";

function DriverComparision() {
  const [driver1, setDriver1] = useState("1");
  const [driver2, setDriver2] = useState("2");
  const [data1, setData1] = useState([]);
  const [data2, setData2] = useState([]);
  
  useEffect(() => {
    fetch(`http://127.0.0.1:8000/drivers/${driver1}/performance`)
        .then(res => res.json())
        .then(data => setData1(data));

    fetch(`http://127.0.0.1:8000/drivers/${driver2}/performance`)
        .then(res => res.json())
        .then(data => setData2(data));

    }, [driver1, driver2]);

  const avgPoints1 = data1.length > 0
    ? data1.reduce((sum, entry) => sum + entry.points, 0) / data1.length
    : 0;
  const consistencyScore1 = data1.length > 0
    ? data1.reduce((sum, entry) => sum + Math.abs(entry.points - avgPoints1), 0) / data1.length
    : 0;
  const bestSeason1 = data1.reduce((best, entry) => entry.points > best.points ? entry : best, { points: 0 });

  const avgPoints2 = data2.length > 0
    ? data2.reduce((sum, entry) => sum + entry.points, 0) / data2.length
    : 0;
  const consistencyScore2 = data2.length > 0
    ? data2.reduce((sum, entry) => sum + Math.abs(entry.points - avgPoints2), 0) / data2.length
    : 0;
  const bestSeason2 = data2.reduce((best, entry) => entry.points > best.points ? entry : best, { points: 0 });

  return (
    <div>
      <h1>Driver Comparison</h1>
      <select value={driver1} onChange={(e) => setDriver1(e.target.value)}>
        <option value="1">Hamilton</option>
        <option value="2">Verstappen</option>
        <option value="3">Vettel</option>
      </select>

      <select value={driver2} onChange={(e) => setDriver2(e.target.value)}>
        <option value="1">Hamilton</option>
        <option value="2">Verstappen</option>
        <option value="3">Vettel</option>
      </select>

      <table>
        <thead>
          <tr>
            <th>Metric</th>
            <th>Driver 1</th>
            <th>Driver 2</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Average Points</td>
            <td>{avgPoints1.toFixed(2)}</td>
            <td>{avgPoints2.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Consistency Score</td>
            <td>{consistencyScore1.toFixed(2)}</td>
            <td>{consistencyScore2.toFixed(2)}</td>
          </tr>
          <tr>
            <td>Best Season</td>
            <td>{bestSeason1 ? `${bestSeason1.year} (${bestSeason1.points} points)` : "Loading..."}</td>
            <td>{bestSeason2 ? `${bestSeason2.year} (${bestSeason2.points} points)` : "Loading..."}</td>
          </tr>
        </tbody>

      </table>
    </div>
  );

}

export default DriverComparision;