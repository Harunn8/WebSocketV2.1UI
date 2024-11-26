import React, { useState } from "react";

const SettingsComponent = () => {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [message, setMessage] = useState("");

    const handlePasswordChange = async () => {
        if (newPassword !== confirmPassword) {
            setMessage("New password and confirm password do not match.");
            return;
        }

        try {
            const response = await fetch("http://localhost:5000/api/Settings/change-password", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`, // Token ekleniyor
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            if (response.ok) {
                setMessage("Password changed successfully.");
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } else {
                const errorData = await response.json();
                setMessage(errorData.message || "Failed to change password.");
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
        }
    };

    return (
        <div style={{ padding: "20px", maxWidth: "400px", margin: "0 auto" }}>
            <h2>Settings</h2>
            <div style={{ marginBottom: "15px" }}>
                <label>Current Password</label>
                <input
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    style={{
                        width: "100%",
                        padding: "10px",
                        margin: "5px 0",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                    }}
                />
            </div>
            <div style={{ marginBottom: "15px" }}>
                <label>New Password</label>
                <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    style={{
                        width: "100%",
                        padding: "10px",
                        margin: "5px 0",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                    }}
                />
            </div>
            <div style={{ marginBottom: "15px" }}>
                <label>Confirm Password</label>
                <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    style={{
                        width: "100%",
                        padding: "10px",
                        margin: "5px 0",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                    }}
                />
            </div>
            <button
                onClick={handlePasswordChange}
                style={{
                    padding: "10px 20px",
                    background: "#4caf50",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                }}
            >
                Change Password
            </button>
            {message && <p style={{ color: "red", marginTop: "10px" }}>{message}</p>}
        </div>
    );
};

export default SettingsComponent;
