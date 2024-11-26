import React, { useState, useEffect } from "react";
import "./deviceList.css";

const DeviceList = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await fetch("http://localhost:5000/api/device");
                const data = await response.json();
                setDevices(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching devices:", err);
                setLoading(false);
            }
        };

        fetchDevices();
    }, []);

    return (
        <div className="device-list-container">
            <h2>Device List</h2>
            {loading ? (
                <p>Loading...</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Device Name</th>
                            <th>IP Address</th>
                            <th>Port</th>
                            <th>OID List</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devices.map((device) => (
                            <tr key={device.id}>
                                <td>{device.deviceName}</td>
                                <td>{device.ipAddress}</td>
                                <td>{device.port}</td>
                                <td>{device.oidList.join(", ")}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default DeviceList;
