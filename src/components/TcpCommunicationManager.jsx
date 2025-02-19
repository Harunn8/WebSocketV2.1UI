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

    const stopCommunication = (device) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            setMessage("WebSocket bağlantısı hazır değil.");
            return;
        }

        const command = {
            action: "stoptcp",
            parameters: { ipAddress: device.ipAddress, port: device.port.toString() },
        };

        socket.send(JSON.stringify(command));
        setMessage("Haberleşme durduruldu.");
    };

    const toggleExpand = (deviceId) => {
        setExpandedDevice(expandedDevice === deviceId ? null : deviceId);
    };

    const addDevice = async () => {
        if (!deviceName || !ipAddress || !port || !tcpFormat || !tcpData) {
            setMessage("Lütfen tüm alanları doldurun.");
            return;
        }

        try {
            const formattedTcpData = tcpData.split(",").map(item => {
                const [request, parameterName] = item.split("-");
                return { request, parameterName };
            });

            const response = await fetch("http://localhost:5001/api/TcpDevice/AddTcpDevice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    deviceName,
                    ipAddress,
                    port: parseInt(port, 10),
                    tcpFormat: tcpFormat.split(","),
                    tcpData: formattedTcpData,
                }),
            });

            if (response.ok) {
                setMessage("Cihaz başarıyla eklendi.");
                setShowAddDeviceForm(false);
                fetchDevices();
                clearForm();
            } else {
                setMessage("Cihaz eklenirken hata oluştu.");
            }
        } catch (err) {
            setMessage("Cihaz eklerken hata oluştu.");
        }
    };

    const deleteDevice = async (id) => {
        try {
            const response = await fetch(`http://localhost:5001/api/TcpDevice/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setMessage("Cihaz başarıyla silindi.");
                fetchDevices();
            } else {
                setMessage("Cihaz silinirken hata oluştu.");
            }
        } catch (err) {
            setMessage("Cihaz silinirken hata oluştu.");
        }
    };

    const clearForm = () => {
        setDeviceName("");
        setIpAddress("");
        setPort("");
        setTcpFormat("");
        setTcpData("");
    };

    return (
        <div className="tcp-device-manager">
            <h1>TCP Device Manager</h1>
            {message && <p>{message}</p>}

            <button onClick={() => setShowAddDeviceForm(!showAddDeviceForm)}>
                {showAddDeviceForm ? "Cancel" : "Add Device"}
            </button>

            {showAddDeviceForm && (
                <div className="add-device-form">
                    <h2>Add New Device</h2>
                    <label>Device Name:</label>
                    <input type="text" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} />

                    <label>IP Address:</label>
                    <input type="text" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} />

                    <label>Port:</label>
                    <input type="number" value={port} onChange={(e) => setPort(e.target.value)} />

                    <label>TCP Format:</label>
                    <input type="text" value={tcpFormat} onChange={(e) => setTcpFormat(e.target.value)} />

                    <label>TCP Data:</label>
                    <input type="text" value={tcpData} onChange={(e) => setTcpData(e.target.value)} />

                    <button onClick={addDevice}>Save Device</button>
                </div>
            )}

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
                                    <button onClick={() => stopCommunication(device)}>Stop</button>
                                    <button onClick={() => deleteDevice(device.id)}>Delete</button>
                                    <button onClick={() => toggleExpand(device.id)}>
                                        {expandedDevice === device.id ? "Hide Details" : "Show Details"}
                                    </button>
                                </td>
                            </tr>
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TcpDeviceManager;
