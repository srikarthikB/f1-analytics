import { useState, useEffect } from "react";
import DriverCard from "./DriverCard";

function Drivers() {
    const [drivers, setDrivers] = useState([]);
    useEffect(() => {
        fetch('http://127.0.0.1:8000/drivers')
        .then(res => res.json())
        .then(data => setDrivers(data))
        .catch(err => console.log(err));

    }, []);

    return (
        <div style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "10px"
        }}>
            {drivers.map(driver => (
                <DriverCard key={driver.id} driver={driver} />
            ))}
        </div>
    )
}

export default Drivers;