import React, { useState } from "react";
import "./deviceadd.css";

const DeviceAdd = () => {
    const [deviceName, setDeviceName] = useState("");
    const [ipAddress, setIpAddress] = useState("");
    const [port, setPort] = useState("");
    const [oidParameterList, setOidParameterList] = useState([]); // OID ve Parameter Name çiftlerini tutar
    const [currentOid, setCurrentOid] = useState(""); // Mevcut OID girdisi
    const [currentParameterName, setCurrentParameterName] = useState(""); // Mevcut Parameter Name girdisi
    const [message, setMessage] = useState("");

    const handleAddMapping = () => {
        if (!currentOid || !currentParameterName) {
            setMessage("OID and Parameter Name are required!");
            return;
        }

        setOidParameterList([...oidParameterList, { oid: currentOid, parameterName: currentParameterName }]);
        setCurrentOid("");
        setCurrentParameterName("");
    };

    const handleRemoveMapping = (index) => {
        const updatedList = oidParameterList.filter((_, i) => i !== index);
        setOidParameterList(updatedList);
    };

    const handleAddDevice = async () => {
        if (!deviceName || !ipAddress || !port || oidParameterList.length === 0) {
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
                    oidList: oidParameterList, // OID ve Parameter Name çiftlerini gönder
                }),
            });

            if (response.ok) {
                setMessage("Device added successfully");
                setDeviceName("");
                setIpAddress("");
                setPort("");
                setOidParameterList([]);
            } else {
                const error = await response.json();
                setMessage(`Error: ${error.message}`);
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
                <label>OID:</label>
                <input
                    type="text"
                    value={currentOid}
                    onChange={(e) => setCurrentOid(e.target.value)}
                    placeholder="Enter OID"
                />
            </div>

            <div className="form-group">
                <label>Parameter Name:</label>
                <input
                    type="text"
                    value={currentParameterName}
                    onChange={(e) => setCurrentParameterName(e.target.value)}
                    placeholder="Enter Parameter Name"
                />
            </div>

            <button onClick={handleAddMapping}>Add OID-Parameter Mapping</button>

            <h3>OID-Parameter List</h3>
            {oidParameterList.length > 0 && (
                <table>
                    <thead>
                        <tr>
                            <th>OID</th>
                            <th>Parameter Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {oidParameterList.map((mapping, index) => (
                            <tr key={index}>
                                <td>{mapping.oid}</td>
                                <td>{mapping.parameterName}</td>
                                <td>
                                    <button onClick={() => handleRemoveMapping(index)}>Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <button onClick={handleAddDevice}>Add Device</button>
        </div>
    );
};

export default DeviceAdd;
