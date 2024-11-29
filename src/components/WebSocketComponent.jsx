import React, { useState, useEffect } from "react";
import "./snmp.css";

const WebSocketComponent = () => {
    const [socket, setSocket] = useState(null);
    const [ipAddress, setIpAddress] = useState("");
    const [data, setData] = useState({});
    const [status, setStatus] = useState("Disconnected");
    const [isVisible, setIsVisible] = useState(true); // Yanıp sönme durumu
    const [isTableVisible, setIsTableVisible] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("token");
        if (!token) {
            window.location.href = "/login";
            return;
        }

        const ws = new WebSocket("ws://localhost:5000/ws");
        setSocket(ws);

        ws.onopen = () => {
            console.log("WebSocket bağlantısı kuruldu");
            setStatus("Connected");
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
                console.error("Hatalı mesaj:", event.data, "Hata:", error.message);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket bağlantısı kapandı");
            setStatus("Disconnected");
        };

        return () => ws.close();
    }, []);

    useEffect(() => {
        let interval;
        if (status === "Connected") {
            interval = setInterval(() => {
                setIsVisible((prev) => !prev);
            }, 500); // 500ms aralıkla yanıp sönme
        } else {
            setIsVisible(true); // Bağlantı yoksa görünür bırak
        }

        return () => clearInterval(interval); // Cleanup
    }, [status]);

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
            alert("WebSocket bağlantısı henüz kurulmadı.");
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
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="Enter IP address"
                />
                <button onClick={startCommunication}>Start Communication</button>
                <button onClick={stopCommunication}>Stop Communication</button>
                <div className="snmp-data">
                    {isTableVisible ? (
                        <>
                            <h4>Gelen SNMP Verileri:</h4>
                            {Object.keys(data).length === 0 ? (
                                <p>Henüz veri yok.</p>
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
            <div
                className={`alarm-icon ${status === "Connected" ? "connected" : ""}`}
                style={{
                    opacity: status === "Connected" && isVisible ? 1 : 0,
                }}
            ></div>
        </div>
    );
};

export default WebSocketComponent;
