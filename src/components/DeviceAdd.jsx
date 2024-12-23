import React, { useState } from "react";
import "./deviceadd.css";

const DeviceAdd = () => {
    const [deviceName, setDeviceName] = useState("");
    const [ipAddress, setIpAddress] = useState("");
    const [port, setPort] = useState("");
    const [oidList, setOidList] = useState("");
    const [message, setMessage] = useState("");

    const handleAddDevice = async () => {
        if (!deviceName || !ipAddress || !port || !oidList) {
            setMessage("Please fill in all fields.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/device/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    deviceName,
                    ipAddress,
                    port: parseInt(port),
                    oidList: oidList.split(",").map((oid) => oid.trim()), // Virgül ile ayrılmış OID'leri listeye çevir
                }),
            });

            if (response.ok) {
                setMessage("Device added successfully");
                setDeviceName("");
                setIpAddress("");
                setPort("");
                setOidList("");
            } else {
                const error = await response.json();
                setMessage(`Hata: ${error.message}`);
            }
        } catch (err) {
            setMessage("Server Error, please try again later");
        }
    };

    return (
        <div className="device-add-container">
            <h2>Add Device</h2>
            {message && <p className="message">{message}</p>}
            <div className="form-group">
                <label>Device Name:</label>
                <input
                    type="text"
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder="Enter device name"
                />
            </div>
            <div className="form-group">
                <label>IP Address:</label>
                <input
                    type="text"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="Enter IP address"
                />
            </div>
            <div className="form-group">
                <label>Port:</label>
                <input
                    type="number"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    placeholder="Enter port number"
                />
            </div>
            <div className="form-group">
                <label>OID List (comma-separated):</label>
                <input
                    type="text"
                    value={oidList}
                    onChange={(e) => setOidList(e.target.value)}
                    placeholder="Enter OIDs, separated by commas"
                />
            </div>
            <button onClick={handleAddDevice}>Add Device</button>
        </div>
    );
};

export default DeviceAdd;
