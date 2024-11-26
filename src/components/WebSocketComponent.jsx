import React, { useState, useEffect } from "react";
import DataDisplay from "./DataDisplay";
import "./snmp.css";

const WebSocketComponent = () => {
    const [socket, setSocket] = useState(null);
    const [ipAddress, setIpAddress] = useState("");
    const [data, setData] = useState([]);
    const [status, setStatus] = useState("Disconnected");

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
            setData((prevData) => [...prevData, event.data]);
        };

        ws.onclose = () => {
            console.log("WebSocket bağlantısı kapandı");
            setStatus("Disconnected");
        };

        return () => ws.close();
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
        } else {
            alert("WebSocket bağlantısı henüz kurulmadı.");
        }
    };

    const stopCommunication = () => {
        if (socket) {
            const command = { action: "stopCommunication" };
            socket.send(JSON.stringify(command));
        }
    };

    const clearData = () => {
        setData([]);
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
                    <h4>Gelen SNMP Verileri:</h4>
                    {data.length === 0 ? (
                        <p>Henüz veri yok.</p>
                    ) : (
                        <ul>
                            {data.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    )}
                </div>
                <button className="clear-button" onClick={clearData}>
                    Clear
                </button>
            </div>
            <div
                className={`alarm-icon ${
                    status === "Connected" ? "connected" : ""
                }`}
            ></div>
        </div>
    );
};

export default WebSocketComponent;
