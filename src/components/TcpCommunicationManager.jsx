import React, { useState, useEffect } from "react";

const TcpDeviceManager = () => {
    const [devices, setDevices] = useState([]);
    const [deviceName, setDeviceName] = useState("");
    const [ipAddress, setIpAddress] = useState("");
    const [port, setPort] = useState("");
    const [tcpFormat, setTcpFormat] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        fetchDevices();
    }, []);

    // GET - Tüm cihazları getir
    const fetchDevices = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/TcpDevice/GetAllDevice");
            const data = await response.json();
            setDevices(data);
        } catch (err) {
            setMessage("Failed to fetch devices");
        }
    };

    // POST - Yeni cihaz ekle
    const addDevice = async () => {
        if (!deviceName || !ipAddress || !port || !tcpFormat) {
            setMessage("Please fill all fields");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/TcpDevice/AddTcpDevice", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    deviceName,
                    ipAddress,
                    port: parseInt(port),
                    tcpFormat: tcpFormat.split(","),
                }),
            });

            if (response.ok) {
                setMessage("Device added successfully");
                fetchDevices();
                setDeviceName("");
                setIpAddress("");
                setPort("");
                setTcpFormat("");
            } else {
                setMessage("Failed to add device");
            }
        } catch (err) {
            setMessage("Error adding device");
        }
    };

    // PUT - Cihaz güncelle
    const updateDevice = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/TcpDevice/UpdateTcpDevice`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id,
                    deviceName,
                    ipAddress,
                    port: parseInt(port),
                    tcpFormat: tcpFormat.split(","),
                }),
            });

            if (response.ok) {
                setMessage("Device updated successfully");
                fetchDevices();
            } else {
                setMessage("Failed to update device");
            }
        } catch (err) {
            setMessage("Error updating device");
        }
    };

    // DELETE - Cihaz sil
    const deleteDevice = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/TcpDevice/${id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                setMessage("Device deleted successfully");
                fetchDevices();
            } else {
                setMessage("Failed to delete device");
            }
        } catch (err) {
            setMessage("Error deleting device");
        }
    };

    // POST - Haberleşmeyi başlat
    const startCommunication = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/TcpDevice/StartTcpCommunication`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({id, ipAddress,port }),
            });

            if (response.ok) {
                setMessage("Communication started");
            } else {
                setMessage("Failed to start communication");
            }
        } catch (err) {
            setMessage("Error starting communication");
        }
    };

    // POST - Haberleşmeyi durdur
    const stopCommunication = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/TcpDevice/StopCommunication`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });

            if (response.ok) {
                setMessage("Communication stopped");
            } else {
                setMessage("Failed to stop communication");
            }
        } catch (err) {
            setMessage("Error stopping communication");
        }
    };

    return (
        <div className="tcp-device-manager">
            <h1>TCP Device Manager</h1>
            {message && <p>{message}</p>}

            <div className="form-group">
                <label>Device Name:</label>
                <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>IP Address:</label>
                <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>Port:</label>
                <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                />
            </div>

            <div className="form-group">
                <label>TCP Format (comma-separated):</label>
                <input
                    type="text"
                    value={tcpFormat}
                    onChange={(e) => setTcpFormat(e.target.value)}
                />
            </div>

            <button onClick={addDevice}>Add Device</button>

            <h2>Devices</h2>
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
                                <button onClick={() => updateDevice(device.id)}>Update</button>
                                <button onClick={() => deleteDevice(device.id)}>Delete</button>
                                <button onClick={() => startCommunication(device.id)}>Start</button>
                                <button onClick={() => stopCommunication(device.id)}>Stop</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default TcpDeviceManager;
