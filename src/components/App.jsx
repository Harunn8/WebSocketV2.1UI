import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./Login";
import SNMP from "./WebSocketComponent";
import DeviceAdd from "./DeviceAdd";
import DeviceList from "./DeviceList";
import Devices from "./Devices";
import SettingsComponent from "./SettingsComponent";
import TcpDeviceManager from "./TcpCommunicationManager"; // TCP bileşenini dahil ettik
import { FaCogs } from "react-icons/fa";
import { CommunicationProvider } from "./CommunicationContext";


const App = () => {
    const isLoggedIn = !!localStorage.getItem("token");
    const [status, setStatus] = useState("Disconnected");
    const [isVisible, setIsVisible] = useState(true);
    return (
        <CommunicationProvider>
            <Router>
                <div style={{ display: "flex",   }}>
                    {isLoggedIn && (
                        <nav
                            style={{
                                width: "200px",
                                background: "#f4f4f4",
                                padding: "10px",
                                boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)",
                                position: "fixed",
                                top: "0",
                                left: "0",
                                height: "100%",
                                zIndex: "1000",
                            }}
                        >
                            <h3 style={{ textAlign: "center", marginBottom: "20px", color: "#333" }}>
                                Menu
                            </h3>
                            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                <li style={{ marginBottom: "15px" }}>
                                    <Link to="/snmp" style={menuLinkStyle}>
                                        SNMP Communication
                                    </Link>
                                </li>
                                <li style={{ marginBottom: "15px" }}>
                                    <Link to="/add-device" style={menuLinkStyle}>
                                        Add Device
                                    </Link>
                                </li>
                                <li style={{ marginBottom: "15px" }}>
                                    <Link to="/device-list" style={menuLinkStyle}>
                                        Device List
                                    </Link>
                                </li>
                                <li style={{ marginBottom: "15px" }}>
                                    <Link to="/devices" style={menuLinkStyle}>
                                        Devices
                                    </Link>
                                </li>
                                <li style={{ marginBottom: "15px" }}>
                                    <Link to="/tcp" style={menuLinkStyle}>
                                        TCP Communication
                                    </Link>
                                </li>
                                <li style={{ marginBottom: "15px" }}>
                                    <Link to="/settings" style={menuLinkStyle}>
                                        <FaCogs style={{ marginRight: "10px" }} />
                                        Settings
                                    </Link>
                                </li>
                                <li style={{ position: "absolute", bottom: 22, width: "60%" }}>
                                    <div style={{ display: "flex", marginLeft: "10px" }}>
                                        <div style={{ flex: 1 }}>{status}</div>
                                        <div
                                            className={`alarm-icon ${status === "Connected" ? "connected" : ""}`}
                                            style={{
                                                opacity: isVisible ? 1 : 0,
                                            }}
                                        />
                                    </div>
                                </li>
                                <li>
                                    <button
                                        onClick={() => {
                                            localStorage.removeItem("token");
                                            window.location.href = "/login";
                                        }}
                                        style={{
                                            position: "fixed",
                                            top: "10px",
                                            right: "10px",
                                            background: "#e74c3c",
                                            color: "#fff",
                                            border: "none",
                                            padding: "5px 10px",
                                            cursor: "pointer",
                                            borderRadius: "5px",
                                            zIndex: "1000",
                                            boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
                                            fontSize: "15px",
                                            width: "auto",
                                            minWidth: "50px",
                                            textAlign: "center",
                                        }}
                                    >
                                        Logout
                                    </button>
                                </li>
                            </ul>
                        </nav>
                    )}

                    {/* Sayfa İçeriği */}
                    <div style={{ flex: 1, padding: "20px", marginBottom:20, marginLeft: isLoggedIn ? "200px" : "0", height:"100%" }}>
                        <Routes>
                            <Route path="/login" element={<Login />} />
                            <Route
                                path="/snmp"
                                element={
                                    isLoggedIn ? (
                                        <SNMP
                                            status={status}
                                            setStatus={setStatus}
                                            isVisible={isVisible}
                                            setIsVisible={setIsVisible}
                                        />
                                    ) : (
                                        <Navigate to="/login" />
                                    )
                                }
                            />
                            <Route
                                path="/add-device"
                                element={isLoggedIn ? <DeviceAdd /> : <Navigate to="/login" />}
                            />
                            <Route
                                path="/device-list"
                                element={isLoggedIn ? <DeviceList /> : <Navigate to="/login" />}
                            />
                            <Route
                                path="/devices"
                                element={isLoggedIn ? <Devices /> : <Navigate to="/login" />}
                            />
                            <Route
                                path="/tcp"
                                element={isLoggedIn ? <TcpDeviceManager /> : <Navigate to="/login" />}
                            />
                            <Route
                                path="/settings"
                                element={isLoggedIn ? <SettingsComponent /> : <Navigate to="/login" />}
                            />
                            <Route
                                path="/"
                                element={<Navigate to={isLoggedIn ? "/snmp" : "/login"} />}
                            />
                        </Routes>
                    </div>
                </div>
            </Router>
        </CommunicationProvider>
    );
};

const menuLinkStyle = {
    textDecoration: "none",
    color: "#333",
    padding: "10px 15px",
    display: "block",
    borderRadius: "5px",
    background: "#f8f9fa",
    transition: "all 0.3s ease",
};

menuLinkStyle[":hover"] = {
    background: "#e9ecef",
    color: "#000",
};

export default App;
