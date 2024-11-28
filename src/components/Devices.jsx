import React, { useState, useEffect } from "react";
import "./devices.css";

const Devices = () => {
    const [data, setData] = useState({}); // OID ve değer çiftleri
    const [webSocket, setWebSocket] = useState(null);

    useEffect(() => {
        // WebSocket bağlantısını başlat
        const ws = new WebSocket("ws://localhost:5000/ws");

        ws.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
            try {
                const receivedData = JSON.parse(event.data); // OID ve değer JSON formatında
                setData((prevData) => ({
                    ...prevData,
                    [receivedData.oid]: receivedData.value,
                }));
            } catch (error) {
                console.error("Invalid data format:", error);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
        };

        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        setWebSocket(ws);

        return () => {
            if (ws) ws.close();
        };
    }, []);

    return (
        <div className="devices-container">
            <h2>Device Communication Values</h2>
            <table>
                <thead>
                    <tr>
                        <th>OID</th>
                        <th>Value</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.keys(data).length > 0 ? (
                        Object.entries(data).map(([oid, value]) => (
                            <tr key={oid}>
                                <td>{oid}</td>
                                <td>{value}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="2">No data available</td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default Devices;
