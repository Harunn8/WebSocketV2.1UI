import React, { useState, useEffect } from "react";
import "./alarm.css";

const AlarmFormModal = ({ alarm, onClose, onRefresh }) => {
    const isEdit = !!alarm;

    const [formData, setFormData] = useState({
        alarmName: "",
        alarmDescription: "",
        severity: 1,
        alarmCreateTime: new Date().toISOString(),
        fixedDate: new Date().toISOString(),
        deviceId: "",
        isAlarmActive: true,
        isAlarmFixed: false,
        isMasked: false,
        alarmCondition: "",
        alarmThreshold: "",
        deviceType: "",
        alarmStatus: 1,
        parameterId: "",
        updatedDate: new Date().toISOString(),
    });

    useEffect(() => {
        if (alarm) setFormData({ ...alarm });
    }, [alarm]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const url = isEdit
            ? `http://localhost:5001/api/Alarm/UpdateAlarm`
            : "http://localhost:5001/api/Alarm/CreateAlarm";

        const method = isEdit ? "PUT" : "POST";

        await fetch(url, {
            method,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        });

        onRefresh();
        onClose();
    };

    return (
        <div className="modal-backdrop">
            <div className="modal">
                <h3>{isEdit ? "Edit Alarm" : "Add Alarm"}</h3>
                <form onSubmit={handleSubmit}>
                    <input type="text" name="alarmName" placeholder="Alarm Name" value={formData.alarmName} onChange={handleChange} required />
                    <input type="text" name="alarmDescription" placeholder="Description" value={formData.alarmDescription} onChange={handleChange} />
                    <input type="number" name="severity" placeholder="Severity (1-5)" value={formData.severity} onChange={handleChange} min="1" max="5" />
                    <input type="text" name="deviceId" placeholder="Device ID" value={formData.deviceId} onChange={handleChange} />
                    <input type="text" name="alarmCondition" placeholder="Condition (e.g. >)" value={formData.alarmCondition} onChange={handleChange} />
                    <input type="text" name="alarmThreshold" placeholder="Threshold (e.g. 60)" value={formData.alarmThreshold} onChange={handleChange} />
                    <input type="text" name="deviceType" placeholder="Device Type" value={formData.deviceType} onChange={handleChange} />
                    <input type="text" name="parameterId" placeholder="Parameter ID" value={formData.parameterId} onChange={handleChange} />
                    <div className="checkbox-row">
                        <label>
                            <input type="checkbox" name="isAlarmActive" checked={formData.isAlarmActive} onChange={handleChange} />
                            Active
                        </label>
                        <label>
                            <input type="checkbox" name="isAlarmFixed" checked={formData.isAlarmFixed} onChange={handleChange} />
                            Fixed
                        </label>
                        <label>
                            <input type="checkbox" name="isMasked" checked={formData.isMasked} onChange={handleChange} />
                            Masked
                        </label>
                    </div>
                    <button type="submit">{isEdit ? "Update" : "Add"}</button>
                    <button type="button" onClick={onClose} className="cancel-btn">Cancel</button>
                </form>
            </div>
        </div>
    );
};

export default AlarmFormModal;
