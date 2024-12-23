import React, { useState, useEffect } from "react";
import { FaPlayCircle, FaRegStopCircle } from "react-icons/fa";
import "./deviceList.css";

const DeviceListWithCommunication = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [webSocket, setWebSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [message, setMessage] = useState(null);
    const [deviceData, setDeviceData] = useState({});

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

        const ws = new WebSocket("ws://localhost:5000/ws");
        ws.onopen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);
        };
        ws.onmessage = (event) => {
            try {
                const parsedData = parseSnmpMessage(event.data);
                const { oid, value } = parsedData;

                setDeviceData((prevData) => ({
                    ...prevData,
                    [oid]: value,
                }));
            } catch (error) {
                console.error("Hatalı mesaj:", event.data, "Hata:", error.message);
            }
        };
        ws.onclose = () => {
            console.log("WebSocket disconnected");
            setIsConnected(false);
        };
        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };
        setWebSocket(ws);

        return () => {
            if (ws) ws.close();
        };
    }, []);

    const startCommunication = (deviceId, ipAddress) => {
        if (webSocket) {
            const message = {
                action: "startcommunication",
                parameters: { deviceId, ipAddress },
            };
            webSocket.send(JSON.stringify(message));
            console.log(`Start communication command sent for Device ID: ${deviceId}`);
            setMessage({ type: "success", text: "Command was sent successfully!" });
            setTimeout(() => setMessage(null), 3000);
        } else {
            setMessage({ type: "error", text: "WebSocket is not connected!" });
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const stopCommunication = () => {
        if (webSocket) {
            const message = { action: "stopcommunication" };
            webSocket.send(JSON.stringify(message));
            console.log("Stop communication command sent.");
            setMessage({ type: "success", text: "Stop command was sent successfully!" });
            setTimeout(() => setMessage(null), 3000);
        } else {
            setMessage({ type: "error", text: "WebSocket is not connected!" });
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const parseSnmpMessage = (message) => {
        if (!message.startsWith("OID")) {
            throw new Error("Invalid message format");
        }

        const dataPart = message.substring(4).trim();
        const [oid, valuePart] = dataPart.split(":");

        if (!oid || !valuePart) {
            throw new Error("Message format is incorrect");
        }

        const value = parseFloat(valuePart.replace(",", "."));

        if (isNaN(value)) {
            throw new Error("Value is not a valid number");
        }

        return { oid: oid.trim(), value };
    };

    return (
        <div className="device-list-page">
            { }
            {message && (
                <div className={`message-box ${message.type}`}>
                    {message.type === "success" ? "✔️" : "❌"} {message.text}
                </div>
            )}

            <div className="device-list-container">
                <h2>Device List with Communication</h2>
                {loading ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <table>
                            <thead>
                                <tr>
                                    <th>Device Name</th>
                                    <th>IP Address</th>
                                    <th>Port</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.map((device) => (
                                    <tr key={device.id}>
                                        <td>{device.deviceName}</td>
                                        <td>{device.ipAddress}</td>
                                        <td>{device.port}</td>
                                        <td style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                                            <button
                                                onClick={() => startCommunication(device.id, device.ipAddress)}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    fontSize: "20px",
                                                    color: "#4caf50",
                                                }}
                                            >
                                                <FaPlayCircle />
                                            </button>
                                            <button
                                                onClick={stopCommunication}
                                                style={{
                                                    background: "none",
                                                    border: "none",
                                                    cursor: "pointer",
                                                    fontSize: "20px",
                                                    color: "#f44336",
                                                }}
                                            >
                                                <FaRegStopCircle />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        { }
                        <div style={{ maxHeight: "550px", overflow: "scroll" }} >

                            <div className="device-data-section">
                                <h3>Data for OID:</h3>
                                <table>
                                    <thead>
                                        <tr>
                                            <th>Parameter Name</th>
                                            <th>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(deviceData).map(([oid, value]) => {
                                            return (
                                                < tr>
                                                    <td>{oid}</td>
                                                    <td>{value}</td>
                                                </tr >
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>

                        </div>

                    </>
                )}
            </div>
        </div>
    );
};

export default DeviceListWithCommunication;
