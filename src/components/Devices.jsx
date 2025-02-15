import React, { useState, useEffect } from "react";
import "./devices.css";

const Devices = () => {
    const [data, setData] = useState({});
    const [webSocket, setWebSocket] = useState(null);

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:5001/ws");

        ws.onopen = () => {
            console.log("WebSocket connected");
        };

        ws.onmessage = (event) => {
            try {
                const receivedData = JSON.parse(event.data);
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
