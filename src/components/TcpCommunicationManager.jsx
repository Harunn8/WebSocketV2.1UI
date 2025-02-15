import React, { useState, useEffect } from "react";
import "./tcpcss.css";

const TcpDeviceManager = ({ setStatus }) => {
    const [socket, setSocket] = useState(null);
    const [devices, setDevices] = useState([]);
    const [deviceName, setDeviceName] = useState("");
    const [ipAddress, setIpAddress] = useState("");
    const [port, setPort] = useState("");
    const [tcpFormat, setTcpFormat] = useState("");
    const [message, setMessage] = useState("");
    const [editingDevice, setEditingDevice] = useState(null);

    // WebSocket bağlantısını başlat
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
                setMessage(`WebSocket Mesajı: ${data.message || "Mesaj alındı."}`);
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

        // Cleanup WebSocket bağlantısını kapatır
        return () => {
            if (ws.readyState === WebSocket.OPEN) {
                ws.close();
            }
        };
    }, [setStatus]);

    // Tüm cihazları getir
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

    // Haberleşmeyi başlat
    const startCommunication = (device) => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            setMessage("WebSocket bağlantısı hazır değil.");
            return;
        }

        const command = {
            action: "starttcp",
            parameters: {
                ipAddress: device.ipAddress,
                port: device.port,
            },
        };

        socket.send(JSON.stringify(command));
        setMessage(`${device.deviceName} için haberleşme başlatıldı.`);
    };

    // Haberleşmeyi durdur
    const stopCommunication = () => {
        if (!socket || socket.readyState !== WebSocket.OPEN) {
            setMessage("WebSocket bağlantısı hazır değil.");
            return;
        }

        const command = {
            action: "stoptcp",
        };

        socket.send(JSON.stringify(command));
        setMessage("Haberleşme durduruldu.");
    };

    // Yeni cihaz ekle veya mevcut cihazı güncelle
    const addOrUpdateDevice = async () => {
        if (!deviceName || !ipAddress || !port || !tcpFormat) {
            setMessage("Lütfen tüm alanları doldurun.");
            return;
        }

        try {
            const url = editingDevice
                ? `http://localhost:5001/api/TcpDevice/UpdateTcpDevice`
                : `http://localhost:5001/api/TcpDevice/AddTcpDevice`;

            const method = editingDevice ? "PUT" : "POST";

            const requestBody = {
                id: editingDevice?.id,
                deviceName,
                ipAddress,
                port: parseInt(port),
                tcpFormat: tcpFormat.split(","),
                tcpData: [],
            };

            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(requestBody),
            });

            if (response.ok) {
                setMessage(editingDevice ? "Cihaz başarıyla güncellendi." : "Cihaz başarıyla eklendi.");
                fetchDevices();
                clearForm();
            } else {
                const errorData = await response.json();
                setMessage(`Cihaz ekleme/güncelleme başarısız: ${errorData.message || "Bilinmeyen hata"}`);
            }
        } catch (err) {
            setMessage("Cihaz eklerken/güncellerken hata oluştu.");
        }
    };

    // Cihazı sil
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

    const editDevice = (device) => {
        setEditingDevice(device);
        setDeviceName(device.deviceName);
        setIpAddress(device.ipAddress);
        setPort(device.port.toString());
        setTcpFormat(device.tcpFormat.join(","));
    };

    const clearForm = () => {
        setEditingDevice(null);
        setDeviceName("");
        setIpAddress("");
        setPort("");
        setTcpFormat("");
    };

    return (
        <div className="tcp-device-manager">
            <h1>TCP Device Manager</h1>
            {message && <p>{message}</p>}

            <div className="form-group">
                <label>Device Name:</label>
                <input type="text" value={deviceName} onChange={(e) => setDeviceName(e.target.value)} />
            </div>

            <div className="form-group">
                <label>IP Address:</label>
                <input type="text" value={ipAddress} onChange={(e) => setIpAddress(e.target.value)} />
            </div>

            <div className="form-group">
                <label>Port:</label>
                <input type="number" value={port} onChange={(e) => setPort(e.target.value)} />
            </div>

            <div className="form-group">
                <label>TCP Format (comma-separated):</label>
                <input type="text" value={tcpFormat} onChange={(e) => setTcpFormat(e.target.value)} />
            </div>

            <button onClick={addOrUpdateDevice}>{editingDevice ? "Update Device" : "Add Device"}</button>
            {editingDevice && <button onClick={clearForm}>Cancel Edit</button>}

            <h2>Devices</h2>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Device Name</th>
                            <th>IP Address</th>
                            <th>Port</th>
                            <th>TCP Format</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {devices.map((device) => (
                            <tr key={device.id}>
                                <td>{device.deviceName}</td>
                                <td>{device.ipAddress}</td>
                                <td>{device.port}</td>
                                <td>{device.tcpFormat.join(", ")}</td>
                                <td>
                                    <button onClick={() => startCommunication(device)}>Start</button>
                                    <button onClick={stopCommunication}>Stop</button>
                                    <button onClick={() => editDevice(device)}>Edit</button>
                                    <button onClick={() => deleteDevice(device.id)}>Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default TcpDeviceManager;
