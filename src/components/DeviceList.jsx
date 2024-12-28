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
            console.log("Message received:", event.data);
            try {
                const parsedData = parseSnmpMessage(event.data);

                if (!parsedData) {
                    setMessage({ type: "info", text: event.data });
                    setTimeout(() => setMessage(null), 3000);
                    return;
                }

                const { oid, value } = parsedData;

                setDeviceData((prevData) => ({
                    ...prevData,
                    [oid]: value,
                }));
            } catch (error) {
                console.error("Invalid message format:", event.data, "Error:", error.message);
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

    const startCommunication = (deviceId, ipAddress, port) => {
        if (webSocket) {
            const message = {
                action: "startcommunication",
                parameters: { deviceId, ipAddress, port: port.toString() },
            };
            console.log("Sending WebSocket message:", JSON.stringify(message));
            webSocket.send(JSON.stringify(message));
            setMessage({ type: "success", text: `Started communication with ${deviceId}` });
            setTimeout(() => setMessage(null), 3000);
        } else {
            setMessage({ type: "error", text: "WebSocket is not connected!" });
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const stopCommunication = (deviceId) => {
        if (webSocket) {
            const message = { action: "stopcommunication", parameters: { deviceId } };
            console.log("Sending stop command:", JSON.stringify(message));
            webSocket.send(JSON.stringify(message));
            setMessage({ type: "success", text: `Stopped communication with ${deviceId}` });
            setTimeout(() => setMessage(null), 3000);
        } else {
            setMessage({ type: "error", text: "WebSocket is not connected!" });
            setTimeout(() => setMessage(null), 3000);
        }
    };

    const parseSnmpMessage = (message) => {
        if (message.includes("Communication stopped")) {
            return null;
        }

        if (message.startsWith("OID")) {
            const parts = message.split(":");
            const oid = parts[0]?.replace("OID", "").trim();
            const value = parts[1]?.trim();
            if (!oid || value === undefined) {
                throw new Error("Invalid message format");
            }
            return { oid, value };
        }

        throw new Error("Invalid message format");
    };
    const removeLeadingDot = (inputString) => {
        if (inputString.startsWith(".")) {
            return inputString.substring(1);
        }
        return inputString;
    };

    return (
        <div className="device-list-page">
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
                                <React.Fragment key={device.id}>
                                    <tr>
                                        <td>{device.deviceName}</td>
                                        <td>{device.ipAddress}</td>
                                        <td>{device.port}</td>
                                        <td style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
                                            <button
                                                onClick={() => startCommunication(device.id, device.ipAddress, device.port)}
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
                                                onClick={() => stopCommunication(device.id)}
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
                                    {}
                                    
{/* {JSON.stringify(deviceData)} */}
{/* {JSON.stringify(device.oidList)} */}
<tr>
                                            <td colSpan="4">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>OID</th>
                                                            <th>Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                    {device.oidList.map((item,index)=>{
                                                        return (
                                                            <tr key={index}> 
                                                            <td>{item.parameterName}</td>
                                                            <td>{deviceData[removeLeadingDot(item.oid)]}</td>
                                                        </tr>
                                                        )
                                                            
                                    })}


                                                        {/* {Object.entries(deviceData).map(([oid, value]) => (
                                                            <tr key={oid}>
                                                                <td>{oid}</td>
                                                                <td>{value}</td>
                                                            </tr>
                                                        ))} */}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    {/* {Object.keys(deviceData).length > 0 && (
                                        <tr>
                                            <td colSpan="4">
                                                <table>
                                                    <thead>
                                                        <tr>
                                                            <th>OID</th>
                                                            <th>Value</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Object.entries(deviceData).map(([oid, value]) => (
                                                            <tr key={oid}>
                                                                <td>{oid}</td>
                                                                <td>{value}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </td>
                                        </tr>
                                    )} */}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default DeviceListWithCommunication;