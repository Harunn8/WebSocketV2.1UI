import React, { useState, useEffect } from "react";
import "./dashboard.css";

const Dashboard = () => {
    const [devices, setDevices] = useState([]);
    const [alarms, setAlarms] = useState([]);
    const [lastLogin, setLastLogin] = useState("2025-05-24 15:30");
    const [lastLogout, setLastLogout] = useState("2025-05-24 16:45");

    useEffect(() => {
        fetchDevices();
        fetchAlarms();
    }, []);

    const fetchDevices = async () => {
        try {
            const response = await fetch("http://localhost:5001/api/Device");
            const json = await response.json();
            setDevices(json);
        } catch (err) {
            console.error("Device fetch error", err);
        }
    };

    const fetchAlarms = async () => {
        try {
            const response = await fetch("http://localhost:5001/api/Alarm/GetlAllAlarms");
            const json = await response.json();
            setAlarms(json);
        } catch (err) {
            console.error("Alarm fetch error", err);
        }
    };

    return (
        <div className="dashboard-container">
            <h1 className="title">Monitoring Dashboard</h1>

            <div className="section-grid">
                <div className="box">
                    <h2>🖥️ Devices</h2>
                    {devices.length === 0 ? (
                        <p>No devices found.</p>
                    ) : (
                        <ul>
                            {devices.map((d) => (
                                <li key={d.id}><b>{d.deviceName}</b> - {d.ipAddress}:{d.port}</li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="box">
                    <h2>🚨 Active Alarms</h2>
                    {alarms.length === 0 ? (
                        <p>No active alarms.</p>
                    ) : (
                        <ul>
                            {alarms.slice(0, 5).map((a, i) => (
                                <li key={i}>🔴 {a.alarmName} (Device: {a.deviceId})</li>
                            ))}
                        </ul>
                    )}
                </div>

                <div className="box">
                    <h2>🕒 Login Info</h2>
                    <p><strong>Last Login:</strong> {lastLogin}</p>
                    <p><strong>Last Logout:</strong> {lastLogout}</p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
