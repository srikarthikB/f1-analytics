import { useEffect, useState } from "react";

function Standings() {
    const [drivers, setDrivers] = useState([]);

    useEffect(() => {
        fetch(`http://127.0.0.1:8000/standings/drivers`)
          .then(res => res.json())
          .then(data => setDrivers(data));
    }, []);

    return (
        <div>
            <h1>Driver Standings</h1>
            <table>
                <thead>
                    <tr>
                        <th>Position</th>
                        <th>Driver</th>
                        <th>Points</th>
                    </tr>
                </thead>
                <tbody>
                    {drivers.map((driver) => (
                        <tr key={driver.id}>
                            <td>{driver.position}</td>
                            <td>{driver.name}</td>
                            <td>{driver.points}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default Standings;