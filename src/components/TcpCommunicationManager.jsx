import React, { useState, useEffect } from "react";
import "./tcpcss.css";

const TcpDeviceManager = ({ setStatus }) => {
    const [socket, setSocket] = useState(null);
    const [devices, setDevices] = useState([]);
    const [deviceData, setDeviceData] = useState({});
    const [message, setMessage] = useState("");
    const [expandedDevice, setExpandedDevice] = useState(null);
    const [showAddDeviceForm, setShowAddDeviceForm] = useState(false);

    // Yeni cihaz ekleme form state'leri
    const [deviceName, setDeviceName] = useState("");
    const [ipAddress, setIpAddress] = useState("");
    const [port, setPort] = useState("");
    const [tcpFormat, setTcpFormat] = useState("");
    const [tcpData, setTcpData] = useState("");

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
                if (data.action === "tcpData") {
                    const parsedData = parseTcpMessage(data.message, data.deviceId);

                    console.log("Parsed TCP Data:", parsedData); // Debug için

                    setDeviceData(prevData => {
                        const updatedData = {
                            ...prevData,
                            [data.deviceId]: parsedData
                        };
                        console.log("Updated Device Data State:", updatedData); // Debug için
                        return updatedData;
                    });
                }
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
                deviceId: device.id,
                ipAddress: device.ipAddress,
                port: device.port.toString(),
            },
        };

        socket.send(JSON.stringify(command));
        setMessage(`${device.deviceName} için haberleşme başlatıldı.`);
    };

    const stopCommunication = (device) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            setMessage("WebSocket bağlantısı hazır değil.");
            return;
        }

        const command = {
            action: "stoptcp",
            parameters: { deviceId: device.id, ipAddress: device.ipAddress, port: device.port.toString() },
        };

        socket.send(JSON.stringify(command));
        setMessage("Haberleşme durduruldu.");
    };

    const toggleExpand = (deviceId) => {
        setExpandedDevice(expandedDevice === deviceId ? null : deviceId);
    };

    const parseTcpMessage = (message, deviceId) => {
        try {
            const device = devices.find(d => d.id === deviceId);
            if (!device || !device.tcpData) {
                console.error("Cihaz veya TCP format bilgisi eksik!");
                return {};
            }

            const parsedData = {};
            const values = message.split(",");

            device.tcpData.forEach((param, index) => {
                if (values[index] !== undefined) {
                    parsedData[param.parameterName] = values[index].trim();
                }
            });

            console.log("Parsed TCP Message:", parsedData); // Debug için
            return parsedData;
        } catch (error) {
            console.error("Parsing error:", error);
            return {};
        }
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
                                    <button onClick={() => startCommunication(device)}>▶️</button>
                                    <button onClick={() => stopCommunication(device)}>⏹️</button>
                                    <button onClick={() => toggleExpand(device.id)}>
                                        {expandedDevice === device.id ? "▲" : "▼"}
                                    </button>
                                </td>
                            </tr>
                            {expandedDevice === device.id && (
                                <tr>
                                    <td colSpan="4">
                                        <h3>Device Data</h3>
                                        <table>
                                            <thead>
                                                <tr>
                                                    <th>Parameter</th>
                                                    <th>Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {deviceData[device.id] && Object.keys(deviceData[device.id]).length > 0 ? (
                                                    Object.entries(deviceData[device.id]).map(([param, value]) => (
                                                        <tr key={param}>
                                                            <td>{param}</td>
                                                            <td>{value}</td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan="2">No data received yet</td>
                                                    </tr>
                                                )}
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
