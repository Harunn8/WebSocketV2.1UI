import React, { useEffect, useState } from "react";
import "./login.css"; // Eğer bir CSS dosyanız varsa

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const token = localStorage.getItem("token");

    // Uygulama versiyonu
    const APP_VERSION = "1.0.0";

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/Login/authenticate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("data", data);

                localStorage.setItem("token", JSON.stringify(data.token)); // Token'ı kaydet
                window.location.href = "/snmp"; // SNMP ekranına yönlendir
            } else {
                setError("Invalid username or password");
            }
        } catch (err) {
            setError("An error occurred while logging in. Please try again.");
        }
    };

    useEffect(() => {
        // Kullanıcı giriş yapmış mı kontrol et
        if (token) {
            window.location.href = "/snmp"; // SNMP ekranına yönlendir
        }
    }, [token]);

    return (
        <div className="login-container">
            <h2>Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="login-input"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="login-input"
            />
            <button onClick={handleLogin} className="login-button">
                Login
            </button>

            {/* Uygulama versiyonunu göster */}
            <div className="app-version">
                <p>Version: {APP_VERSION}</p>
            </div>
        </div>
    );
};

export default Login;
