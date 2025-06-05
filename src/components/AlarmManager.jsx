import React, { useEffect, useState } from "react";
import "./alarm.css";
import AlarmFormModal from "./AlarmFormModal";

const AlarmPage = () => {
    const [selectedTab, setSelectedTab] = useState("active");
    const [activeAlarms, setActiveAlarms] = useState([]);
    const [historicalAlarms, setHistoricalAlarms] = useState([]);
    const [customAlarms, setCustomAlarms] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editAlarm, setEditAlarm] = useState(null);

    useEffect(() => {
        fetch("http://localhost:5001/api/Alarm/GetAllActiveAlarms")
            .then(res => res.json())
            .then(data => setActiveAlarms(data || []));

        fetch("http://localhost:5001/api/Alarm/GetAllHistoricalAlarms")
            .then(res => res.json())
            .then(data => setHistoricalAlarms(data || []));

        fetchCustomAlarms();
    }, []);

    const fetchCustomAlarms = () => {
        fetch("http://localhost:5001/api/Alarm/GetAllAlarms")
            .then(res => res.json())
            .then(data => setCustomAlarms(data || []));
    };

    const formatDate = (str) => {
        const d = new Date(str);
        return isNaN(d) ? "-" : d.toLocaleString();
    };

    const deleteAlarm = async (id) => {
        if (!window.confirm("Are you sure you want to delete this alarm?")) return;
        await fetch(`http://localhost:5001/api/Alarm/${id}`, {
            method: "DELETE",
        });
        fetchCustomAlarms();
    };

    const openEdit = (alarm) => {
        setEditAlarm(alarm);
        setShowModal(true);
    };

    const openAdd = () => {
        setEditAlarm(null);
        setShowModal(true);
    };

    const renderAlarms = (alarms, isCustom = false) => (
        <table className="alarm-table">
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Severity</th>
                    <th>Description</th>
                    <th>Device</th>
                    <th>Time</th>
                    {isCustom && <th>Actions</th>}
                </tr>
            </thead>
            <tbody>
                {alarms.map((alarm, idx) => (
                    <tr key={idx}>
                        <td>{alarm.alarmName}</td>
                        <td>
                            <span className={`severity-badge severity-${alarm.severity}`}>
                                {alarm.severity}
                            </span>
                        </td>
                        <td>{alarm.alarmDescription}</td>
                        <td>{alarm.deviceId}</td>
                        <td>{formatDate(alarm.alarmCreateTime)}</td>
                        {isCustom && (
                            <td>
                                <button onClick={() => openEdit(alarm)}>✏️</button>
                                <button onClick={() => deleteAlarm(alarm.id)}>🗑️</button>
                            </td>
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );

    return (
        <div className="alarm-container">
            <div className="alarm-sidebar">
                <button className={selectedTab === "active" ? "selected" : ""} onClick={() => setSelectedTab("active")}>Active Alarms</button>
                <button className={selectedTab === "historical" ? "selected" : ""} onClick={() => setSelectedTab("historical")}>Historical Alarms</button>
                <button className={selectedTab === "custom" ? "selected" : ""} onClick={() => setSelectedTab("custom")}>Custom Alarms</button>
            </div>

            <div className="alarm-content">
                <h2>{selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1)} Alarms</h2>
                {selectedTab === "active" && renderAlarms(activeAlarms)}
                {selectedTab === "historical" && renderAlarms(historicalAlarms)}
                {selectedTab === "custom" && (
                    <>
                        <button className="add-alarm-btn" onClick={openAdd}>+ Add Alarm</button>
                        {renderAlarms(customAlarms, true)}
                    </>
                )}
            </div>

            {showModal && (
                <AlarmFormModal
                    alarm={editAlarm}
                    onClose={() => setShowModal(false)}
                    onRefresh={fetchCustomAlarms}
                />
            )}
        </div>
    );
};

export default AlarmPage;
