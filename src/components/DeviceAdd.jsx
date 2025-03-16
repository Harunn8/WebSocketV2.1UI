import React, { useState } from "react";
//import { ObjectId } from 'bson';
import "./deviceadd.css";

const DeviceAdd = () => {
    const [deviceName, setDeviceName] = useState("");
    const [ipAddress, setIpAddress] = useState("");
    const [port, setPort] = useState("");
    const [oidParameterList, setOidParameterList] = useState([]);
    const [currentOid, setCurrentOid] = useState("");
    const [currentParameterName, setCurrentParameterName] = useState("");
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

    const requestBody = {
        //id: new ObjectId().toHexString(),
        deviceName,
        ipAddress,
        port: parseInt(port),
        oidList: oidParameterList,
    };

    console.log("Request Payload:", JSON.stringify(requestBody, null, 2));

    try {
        const response = await fetch("http://localhost:5001/api/Device/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
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

            <button className = "addOidParamButtton"onClick={handleAddMapping}>Add Parameters</button>

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
                                    <button className ="handlerRemoveMapping" onClick={() => handleRemoveMapping(index)}>Remove</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <button className = "addDeviceButton"onClick={handleAddDevice}>Add Device</button>
        </div>
    );
};

export default DeviceAdd;