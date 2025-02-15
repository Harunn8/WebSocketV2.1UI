import React, { useState, useEffect } from "react";
import "./tcpcss.css";

const TcpDeviceManager = ({ setStatus }) => {
    const [socket, setSocket] = useState(null);
    const [devices, setDevices] = useState([]);
    const [deviceData, setDeviceData] = useState({}); // Gelen verileri saklamak için state
    const [message, setMessage] = useState("");
    const [expandedDevice, setExpandedDevice] = useState(null); // Açık olan cihazın ID'sini tutan state

    useEffect(() => {
        const ws = new WebSocket("ws://localhost:5001/ws/tcp");

        ws.onopen = () => {
            console.log("WebSocket bağlantısı kuruldu.");
            setStatus && setStatus("Connected");
        };

        ws.onmessage = (event) => {
            console.log("WebSocket mesajı alındı:", event.data);
            try {
                const data = JSON.parse(event.data);
                setDeviceData(prevData => ({
                    ...prevData,
                    [data.Device]: data.Data.reduce((acc, item) => {
                        acc[item.ParameterName] = item.Value;
                        return acc;
                    }, {}),
                }));
            } catch (error) {
                console.error("Mesaj işleme hatası:", error.message);
            }
        };

        ws.onclose = () => {
            console.log("WebSocket bağlantısı kapandı.");
            setStatus && setStatus("Disconnected");
        };

        ws.onerror = (error) => {
            console.error("WebSocket hatası:", error.message);
            setStatus && setStatus("Error");
        };

        setSocket(ws);

        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [setStatus]);

    const fetchDevices = async () => {
        try {
            const response = await fetch("http://localhost:5001/api/TcpDevice/GetAllDevice");
            if (response.ok) {
                const data = await response.json();
                setDevices(data);
            } else {
                setMessage("Cihazları alırken hata oluştu.");
            }
        } catch (err) {
            setMessage("Cihazları alırken bir hata oluştu.");
        }
    };

    useEffect(() => {
        fetchDevices();
    }, []);

    const startCommunication = (device) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            setMessage("WebSocket bağlantısı hazır değil.");
            return;
        }

        const command = {
            action: "starttcp",
            parameters: {
                ipAddress: device.ipAddress,
                port: device.port.toString(),
            },
        };

        socket.send(JSON.stringify(command));
        setMessage(`${device.deviceName} için haberleşme başlatıldı.`);
    };

    const stopCommunication = () => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            setMessage("WebSocket bağlantısı hazır değil.");
            return;
        }

        const command = { action: "stoptcp", parameters: {ipAddress : device.ipAddress, port: device.port.toString()}};

        socket.send(JSON.stringify(command));
        setMessage("Haberleşme durduruldu.");
    };

    const toggleExpand = (deviceId) => {
        setExpandedDevice(expandedDevice === deviceId ? null : deviceId);
    };

    return (
        <div className="tcp-device-manager">
            <h1>TCP Device Manager</h1>
            {message && <p>{message}</p>}

            <h2>Devices</h2>
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
                                <td>
                                    <button onClick={() => startCommunication(device)}>Start</button>
                                    <button onClick={stopCommunication}>Stop</button>
                                    <button onClick={() => toggleExpand(device.id)}>
                                        {expandedDevice === device.id ? "Hide Details" : "Show Details"}
                                    </button>
                                </td>
                            </tr>

                            {expandedDevice === device.id && (
                                <tr>
                                    <td colSpan="4">
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Parameter</th>
                                                    <th>Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {deviceData[device.deviceName] &&
                                                    Object.entries(deviceData[device.deviceName]).map(([param, value], index) => (
                                                        <tr key={index}>
                                                            <td>{param}</td>
                                                            <td>{value}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TcpDeviceManager;
