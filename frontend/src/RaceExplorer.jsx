import { useEffect, useState } from "react";

function RaceExplorer() {
  const [year, setYear] = useState("2020");
  const [races, setRaces] = useState([]);

  useEffect(() => {
    fetch(`http://localhost:8000/races/${year}`)
      .then((response) => response.json())
      .then((data) => setRaces(data));
  }, [year]);

  const wins = {};

  races.forEach((race) => {
    const driver = race.winner;
    if (wins[driver]) {
      wins[driver]++;
    } else {
      wins[driver] = 1;
    }
  });

  let topDriver = "";
  let maxWins = 0;

  for (const driver in wins) {
    if (wins[driver] > maxWins) {
      maxWins = wins[driver];
      topDriver = driver;
    }
  }
  
  return (
    <div>
      <h1>Races in the year: {year}</h1>

      <select value={year} onChange={(e) => setYear(e.target.value)}>
        <option value="2020">2020</option>
        <option value="2021">2021</option>
        <option value="2022">2022</option>
        <option value="2023">2023</option>
      </select>

      <ul>
        {races.map((race) => (
          <li key={race.round}>
            {race.name} - {race.date} (Winner: {race.winner})
          </li>
        ))}
      </ul>

      <p>
        Top Driver: {topDriver} ({maxWins} wins)
      </p>
    </div>
  );
}

export default RaceExplorer;