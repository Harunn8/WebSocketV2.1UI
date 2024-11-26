import React from "react";
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import Login from "./Login";
import SNMP from "./WebSocketComponent";
import DeviceAdd from "./DeviceAdd";
import DeviceList from "./DeviceList";
import SettingsComponent from "./SettingsComponent"; // Settings bileşeni
import { FaCogs } from "react-icons/fa"; // Ayarlar ikonu için react-icons kullanılıyor

const App = () => {
    const isLoggedIn = !!localStorage.getItem("token"); // Giriş kontrolü

    return (
        <Router>
            <div style={{ display: "flex", height: "100vh" }}>
                {/* Sol Menü */}
                {isLoggedIn && (
                    <nav
                        style={{
                            width: "200px", // Menü genişliği
                            background: "#f4f4f4", // Arkaplan rengi
                            padding: "10px", // İçerik boşluğu
                            boxShadow: "2px 0 5px rgba(0, 0, 0, 0.1)", // Hafif gölge
                            position: "fixed", // Sabitleme
                            top: "0", // Üste hizala
                            left: "0", // Sola hizala
                            height: "100%", // Yükseklik tam ekran
                            zIndex: "1000", // Diğer içeriklerin üstünde olsun
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
                                <Link to="/settings" style={menuLinkStyle}>
                                    <FaCogs style={{ marginRight: "10px" }} />
                                    Settings
                                </Link>
                            </li>
                            <li>
                                <button
                                    onClick={() => {
                                        localStorage.removeItem("token"); // Token'ı kaldır
                                        window.location.href = "/login"; // Login sayfasına yönlendir
                                    }}
                                    style={{
                                        position: "fixed", // Sabit konum
                                        top: "10px", // Üstten boşluk
                                        right: "10px", // Sağdan boşluk
                                        background: "#e74c3c", // Arkaplan rengi
                                        color: "#fff", // Yazı rengi
                                        border: "none", // Kenarlık yok
                                        padding: "5px 10px", // Dolgu (kısa olacak şekilde düzenlendi)
                                        cursor: "pointer", // İşaretçi ikonu
                                        borderRadius: "5px", // Köşeleri yuvarlat
                                        zIndex: "1000", // En üst katmanda göster
                                        boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)", // Hafif gölge
                                        fontSize: "15px", // Yazı boyutunu küçült
                                        width: "auto", // Genişlik içeriğe göre ayarlanır
                                        minWidth: "50px", // Çok küçük olmaması için minimum genişlik
                                        textAlign: "center", // Yazıyı ortala
                                    }}
                                >
                                    Logout
                                </button>
                            </li>
                        </ul>
                    </nav>
                )}

                {/* Sayfa İçeriği */}
                <div style={{ flex: 1, padding: "20px", marginLeft: isLoggedIn ? "200px" : "0" }}>
                    <Routes>
                        <Route path="/login" element={<Login />} />
                        <Route path="/snmp" element={isLoggedIn ? <SNMP /> : <Navigate to="/login" />} />
                        <Route path="/add-device" element={isLoggedIn ? <DeviceAdd /> : <Navigate to="/login" />} />
                        <Route path="/device-list" element={isLoggedIn ? <DeviceList /> : <Navigate to="/login" />} />
                        <Route path="/settings" element={isLoggedIn ? <SettingsComponent /> : <Navigate to="/login" />} />
                        <Route path="/" element={<Navigate to={isLoggedIn ? "/snmp" : "/login"} />} />
                    </Routes>
                </div>
            </div>
        </Router>
    );
};

// Sol menü linkleri için ortak stil
const menuLinkStyle = {
    textDecoration: "none",
    color: "#333",
    padding: "10px 15px",
    display: "block",
    borderRadius: "5px",
    background: "#f8f9fa",
    transition: "all 0.3s ease",
};

// Hover efekti
menuLinkStyle[":hover"] = {
    background: "#e9ecef",
    color: "#000",
};

export default App;
