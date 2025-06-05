import React, { useState, useEffect } from "react";
import { FaPlayCircle, FaRegStopCircle, FaChevronDown, FaChevronUp } from "react-icons/fa";
import "./deviceList.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DeviceListWithCommunication = () => {
    const [devices, setDevices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [webSocket, setWebSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [message, setMessage] = useState(null);
    const [deviceData, setDeviceData] = useState({});
    const [openDeviceIds, setOpenDeviceIds] = useState(new Set());
    const [activeDevices, setActiveDevices] = useState(new Set());

    useEffect(() => {
        const fetchDevices = async () => {
            try {
                const response = await fetch("http://localhost:5001/api/Device");
                const data = await response.json();
                setDevices(data);
                setLoading(false);
            } catch (err) {
                console.error("Error fetching devices:", err);
                setLoading(false);
            }
        };

        fetchDevices();

        const ws = new WebSocket("ws://localhost:5001/ws/snmp");
        ws.onopen = () => {
            console.log("WebSocket connected");
            setIsConnected(true);
        };

        ws.onmessage = (event) => {
            const message = event.data;
            try {
                if (message.includes("/")) {
                    const parts = message.split("/");
                    if (parts.length === 3) {
                        const deviceName = parts[0]?.trim();
                        const alarmName = parts[1]?.trim();
                        const severity = parseInt(parts[2]?.trim()) || 1;
                        const { background, title } = getSeverityStyle(severity);
                        toast.success(`${title}: ${alarmName} - Device: ${deviceName}`, {
                            position: "bottom-right",
                            autoClose: 5000,
                            hideProgressBar: false,
                            pauseOnHover: true,
                            closeOnClick: true,
                            style: { background },
                        });
                        return;
                    }
                }

                const parsedData = parseSnmpMessage(message);
                if (!parsedData) return;

                const { oid, value } = parsedData;
                setDeviceData((prevData) => ({
                    ...prevData,
                    [oid]: value,
                }));

            } catch (error) {
                console.error("Invalid message format:", message, "Error:", error.message);
            }
        };

        ws.onclose = () => setIsConnected(false);
        ws.onerror = (error) => console.error("WebSocket error:", error);

        setWebSocket(ws);

        return () => { if (ws) ws.close(); };
    }, []);

    const startCommunication = (deviceId, ipAddress, port) => {
        if (webSocket) {
            const device = devices.find(d => d.id === deviceId);
            const deviceName = device ? device.deviceName : "Unknown Device";
            const message = {
                action: "startcommunication",
                parameters: { deviceId, ipAddress, port: port.toString() },
            };
            webSocket.send(JSON.stringify(message));
            toast.success(`Started communication with ${deviceName}`);
            setActiveDevices(prev => new Set(prev).add(deviceId));
        }
    };

    const stopCommunication = (deviceId) => {
        if (webSocket) {
            const message = { action: "stopcommunication", parameters: { deviceId } };
            webSocket.send(JSON.stringify(message));
            const device = devices.find(d => d.id === deviceId);
            const deviceName1 = device ? device.deviceName : "Unknown Device";
            toast.success(`Stopped communication with device ${deviceName1}`);
            setActiveDevices(prev => {
                const newSet = new Set(prev);
                newSet.delete(deviceId);
                return newSet;
            });
        }
    };

    const parseSnmpMessage = (message) => {
        if (message.includes("Communication stopped")) return null;
        if (message.startsWith("OID")) {
            const parts = message.split(":");
            const oid = parts[0]?.replace("OID", "").trim();
            const value = parts[1]?.trim();
            if (!oid || value === undefined) throw new Error("Invalid message format");
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

    const getSeverityStyle = (severity) => {
        switch (severity) {
            case 1: return { background: "#c8e6c9", title: "Warning" };
            case 2: return { background: "#81c784", title: "Low" };
            case 3: return { background: "#fff176", title: "Medium" };
            case 4: return { background: "#ffb74d", title: "High" };
            case 5: return { background: "#e57373", title: "Critical" };
            default: return { background: "#eeeeee", title: "Info" };
        }
    };

    const toggleDetails = (deviceId) => {
        setOpenDeviceIds((prev) => {
            const updated = new Set(prev);
            if (updated.has(deviceId)) {
                updated.delete(deviceId);
            } else {
                updated.add(deviceId);
            }
            return updated;
        });
    };

    return (
        <>
            <ToastContainer />
            <div className="device-list-page">
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
                                    <th>Detail</th>
                                </tr>
                            </thead>
                            <tbody>
                                {devices.map((device) => (
                                    <React.Fragment key={device.id}>
                                        <tr style={{
                                            backgroundColor: activeDevices.has(device.id) ? "#2e7d32" : "transparent",
                                            color: activeDevices.has(device.id) ? "white" : "inherit",
                                            transition: "background-color 0.3s ease"
                                        }}>
                                            <td>{device.deviceName}</td>
                                            <td>{device.ipAddress}</td>
                                            <td>{device.port}</td>
                                            <td style={{ textAlign: "center" }}>
                                                <button
                                                    onClick={() => toggleDetails(device.id)}
                                                    style={{
                                                        background: "none",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        fontSize: "20px",
                                                        color: "#2196f3",
                                                    }}
                                                >
                                                    {openDeviceIds.has(device.id) ? <FaChevronUp /> : <FaChevronDown />}
                                                </button>
                                            </td>
                                        </tr>

                                        {openDeviceIds.has(device.id) && (
                                            <tr>
                                                <td colSpan="4">
                                                    <div style={{
                                                        margin: "10px 0",
                                                        padding: "15px",
                                                        background: "#333",
                                                        borderRadius: "8px",
                                                        boxShadow: "0 4px 8px rgba(0,0,0,0.5)",
                                                        animation: "fadeIn 0.5s ease-in-out"
                                                    }}>
                                                        <div style={{
                                                            marginBottom: "10px",
                                                            display: "flex",
                                                            gap: "10px",
                                                            justifyContent: "center"
                                                        }}>
                                                            <button onClick={() => startCommunication(device.id, device.ipAddress, device.port)} style={{ fontSize: "20px", color: "#4caf50" }}>
                                                                <FaPlayCircle />
                                                            </button>
                                                            <button onClick={() => stopCommunication(device.id)} style={{ fontSize: "20px", color: "#f44336" }}>
                                                                <FaRegStopCircle />
                                                            </button>
                                                        </div>
                                                        <table style={{ width: "100%" }}>
                                                            <thead>
                                                                <tr>
                                                                    <th>OID</th>
                                                                    <th>Value</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {device.oidList.map((item, index) => (
                                                                    <tr key={index}>
                                                                        <td>{item.parameterName}</td>
                                                                        <td>{deviceData[removeLeadingDot(item.oid)] || "-"}</td>
                                                                    </tr>
                                                                ))}
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
                    )}
                </div>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </>
    );
};

export default DeviceListWithCommunication;
