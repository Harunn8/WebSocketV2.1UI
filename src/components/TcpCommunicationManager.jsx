import React, { useState, useEffect } from "react";
import { FaPlayCircle, FaRegStopCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./tcpcss.css";

const TcpDeviceManager = ({ setStatus }) => {
    const [socket, setSocket] = useState(null);
    const [devices, setDevices] = useState([]);
    const [deviceData, setDeviceData] = useState({});
    const [expandedDevices, setExpandedDevices] = useState(new Set());
    const [activeDevices, setActiveDevices] = useState(new Set());

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:5001/ws/tcp");

        ws.onopen = () => setStatus && setStatus("Connected");
        ws.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.Data && data.Id) {
                    setDeviceData(prev => ({ ...prev, [data.Id]: data.Data }));
                }
            } catch (error) {
                console.error("WebSocket parse error:", error);
            }
        };
        ws.onclose = () => setStatus && setStatus("Disconnected");
        ws.onerror = () => setStatus && setStatus("Error");

        setSocket(ws);
        return () => ws.readyState === WebSocket.OPEN && ws.close();
    }, [setStatus]);

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const res = await fetch("http://localhost:5001/api/TcpDevice/GetAllDevice");
                const data = await res.json();
                setDevices(data);
            } catch (err) {
                console.error("Fetch error:", err);
            }
        };
        fetchDevices();
    }, []);

    const toggleExpand = (id) => {
        setExpandedDevices(prev => {
            const newSet = new Set(prev);
            newSet.has(id) ? newSet.delete(id) : newSet.add(id);
            return newSet;
        });
    };

    const startCommunication = (device) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({
            action: "starttcp",
            parameters: { deviceId: device.id, ipAddress: device.ipAddress, port: device.port.toString() },
        }));
        setActiveDevices(prev => new Set(prev).add(device.id));
    };

    const stopCommunication = (device) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) return;
        socket.send(JSON.stringify({
            action: "stoptcp",
            parameters: { deviceId: device.id, ipAddress: device.ipAddress, port: device.port.toString() },
        }));
        setActiveDevices(prev => {
            const newSet = new Set(prev);
            newSet.delete(device.id);
            return newSet;
        });
    };

    const removeLeadingDot = (s) => s.startsWith(".") ? s.slice(1) : s;

    return (
        <div className="device-list-page">
            <div className="device-list-container">
                <h2>TCP Device List</h2>
                <table>
                    <thead>
                        <tr>
                            <th>Device Name</th>
                            <th>IP Address</th>
                            <th>Port</th>
                            <th>Detail</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devices.map(device => (
                            <React.Fragment key={device.id}>
                                <tr
                                    style={{
                                        backgroundColor: activeDevices.has(device.id) ? "#2e7d32" : "transparent",
                                        color: activeDevices.has(device.id) ? "white" : "inherit",
                                        transition: "background-color 0.3s ease"
                                    }}
                                >
                                    <td>{device.deviceName}</td>
                                    <td>{device.ipAddress}</td>
                                    <td>{device.port}</td>
                                    <td style={{ textAlign: "center" }}>
                                        <button
                                            onClick={() => toggleExpand(device.id)}
                                            style={{
                                                background: "none",
                                                border: "none",
                                                cursor: "pointer",
                                                fontSize: "20px",
                                                color: "#2196f3",
                                            }}
                                        >
                                            {expandedDevices.has(device.id) ? <FaChevronUp /> : <FaChevronDown />}
                                        </button>
                                    </td>
                                </tr>
                                {expandedDevices.has(device.id) && (
                                    <tr>
                                        <td colSpan="4">
                                            <div className="tcp-detail-box">
                                                <div className="tcp-actions">
                                                    <button onClick={() => startCommunication(device)}><FaPlayCircle /></button>
                                                    <button onClick={() => stopCommunication(device)}><FaRegStopCircle /></button>
                                                </div>
                                                <table className="tcp-inner-table">
                                                    <thead>
                                                        <tr>
                                                            <th>Parameter</th>
                                                            <th>Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {device.tcpData && device.tcpData.length > 0 ? (
                                                            device.tcpData.map((item, index) => (
                                                                <tr key={index}>
                                                                    <td>{item.parameterName}</td>
                                                                    <td>{deviceData[device.id]?.[item.parameterName] || "-"}</td>
                                                                </tr>
                                                            ))
                                                        ) : (
                                                            <tr><td colSpan="2">No parameters defined</td></tr>
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TcpDeviceManager;
