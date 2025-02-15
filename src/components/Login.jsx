import React, { useEffect, useState } from "react";
import "./login.css";

const Login = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const token = localStorage.getItem("token");

    const APP_VERSION = "1.3.12";

    const handleLogin = async () => {
        try {
            const response = await fetch("http://localhost:5001/api/Login/authenticate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password }),
            });

            if (response.ok) {
                const data = await response.json();
                console.log("data", data);

                localStorage.setItem("token", JSON.stringify(data.token));
                window.location.href = "/snmp";
            } else {
                setError("Invalid username or password");
            }
        } catch (err) {
            setError("An error occurred while logging in. Please try again.");
        }
    };

    const handleKeyPress = (event) =>
    {
        if(event.key == "Enter")
        {
            handleLogin();
        }
    }

    useEffect(() => {
        if (token) {
            window.location.href = "/snmp";
        }
    }, [token]);

    return (
        <div className="login-container">
            <h2 className ="login-title">Login</h2>
            {error && <p style={{ color: "red" }}>{error}</p>}
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                onKeyDown={handleKeyPress}
                className="login-input"
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={handleKeyPress}
                className="login-input"
            />
            <button onClick={handleLogin} className="login-button">
                Login
            </button>

            { }
            <div className="app-version">
                <p>Version: {APP_VERSION}</p>
                <p>Author: {"HK"}</p>
            </div>
        </div>
    );
};

export default Login;
