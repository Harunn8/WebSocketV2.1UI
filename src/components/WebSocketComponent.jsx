import React, { useState, useEffect } from "react";
import "./snmp.css";

const WebSocketComponent = ({ status, setStatus, isVisible, setIsVisible }) => {
    const [socket, setSocket] = useState(null);
    const [ipAddress, setIpAddress] = useState("");
    const [data, setData] = useState({});
    const [isTableVisible, setIsTableVisible] = useState(true);
    const [showNotification, setShowNotification] = useState(false);

    const playNotificationSound = () => {
        const audio = new Audio("/notification-22-270130.mp3");
        audio.play().catch((error) => {
            console.error("Audio playback failed:", error);
        });
    };

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        const ws = new WebSocket("ws://localhost:5001/ws/snmp");
        setSocket(ws);

        ws.onopen = () => {
            console.log("WebSocket was connect");
            setStatus("Connected");
            playNotificationSound();
        };

        ws.onmessage = (event) => {
            try {
                const parsedData = parseSnmpMessage(event.data);
                const { oid, value } = parsedData;

                setData((prevData) => ({
                    ...prevData,
                    [oid]: value,
                }));
            } catch (error) {
                console.error("Wrong Message:", event.data, "Error:", error.message);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket connection was close");
            setStatus("Disconnected");
            setShowNotification(true);
            playNotificationSound();
        };

        return () => ws.close();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setIsVisible((prev) => !prev);
        }, 500);

        return () => clearInterval(interval);
    }, []);

    const startCommunication = () => {
        if (!ipAddress) {
            alert("Please enter a valid IP address.");
            return;
        }
        if (socket && socket.readyState === WebSocket.OPEN) {
            const command = {
                action: "startCommunication",
                parameters: {
                    ipAddress: ipAddress,
                },
            };
            socket.send(JSON.stringify(command));
            setIsTableVisible(true);
        } else {
            alert("WebSocket connection establish is not yet");
        }
    };

    const stopCommunication = () => {
        if (socket) {
            const command = { action: "stopCommunication" };
            socket.send(JSON.stringify(command));
            setIsTableVisible(false);
        }
    };

    const clearData = () => {
        setData({});
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
        <div className="snmpcommunication">
            <h2 className="snmp-title">SNMP Communication</h2>
            <p>Status: {status}</p>
            <div className="snmp-content">
                <label>IP Address:</label>
                <input
                    className="enterIpAddress"
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="Enter IP address"
                />
                <button className="startbutton" onClick={startCommunication}>Start Communication</button>
                <button className="stopbutton" onClick={stopCommunication}>Stop Communication</button>
                <div className="snmp-data">
                    {isTableVisible ? (
                        <>
                            <h4>Gelen SNMP Verileri:</h4>
                            {Object.keys(data).length === 0 ? (
                                <p>No Data</p>
                            ) : (
                                <table>
                                    <thead>
                                        <tr>
                                            <th>OID</th>
                                            <th>Value</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {Object.entries(data).map(([oid, value], index) => (
                                            <tr key={index}>
                                                <td>{oid}</td>
                                                <td>{value}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </>
                    ) : (
                        <p className="connection-down" style={{ color: "red" }}>
                            CONNECTION DOWN
                        </p>
                    )}
                </div>
                <button className="clear-button" onClick={clearData}>
                    Clear
                </button>
            </div>

            {showNotification && (
                <div className="notification">
                </div>
            )}
        </div>
    );
};

export default WebSocketComponent;
