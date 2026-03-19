import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

function Standings() {
  const [data, setData] = useState([]);
  const location = useLocation();

  // Detect which route we're on
  const isConstructor = location.pathname.includes("constructors");

  useEffect(() => {
    const url = isConstructor
      ? "http://127.0.0.1:8000/standings/constructors"
      : "http://127.0.0.1:8000/standings/drivers";

    fetch(url)
      .then(res => res.json())
      .then(data => setData(data));
  }, [isConstructor]);

  return (
    <div>
      <h1>
        {isConstructor ? "Constructor Standings" : "Driver Standings"}
      </h1>

      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Position</th>
            <th>Name</th>
            {!isConstructor && <th>Team</th>}
            <th>Points</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.position}>
              <td>{item.position}</td>
              <td>{item.name}</td>
              {!isConstructor && <td>{item.team}</td>}
              <td>{item.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Standings;