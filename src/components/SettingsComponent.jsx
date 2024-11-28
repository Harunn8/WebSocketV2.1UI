import React, { useState, useEffect } from "react";

const UserManagementComponent = () => {
    const [users, setUsers] = useState([]);
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState(""); // Password for Add User
    const [selectedUser, setSelectedUser] = useState(null); // Selected user for update
    const [message, setMessage] = useState("");

    // Fetch all users
    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:5000/api/User", {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });
            if (response.ok) {
                const data = await response.json();
                setUsers(data);
            } else {
                setMessage("Failed to fetch users.");
            }
        } catch (error) {
            setMessage("An error occurred while fetching users.");
        }
    };

    // Add or Update User
    const handleSaveUser = async () => {
        try {
            const url = selectedUser
                ? `http://localhost:5000/api/User/${selectedUser.id}`
                : "http://localhost:5000/api/User/add";

            const method = selectedUser ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    userName,
                    password: !selectedUser ? password : undefined, // Only send password on add
                }),
            });

            if (response.ok) {
                setMessage(
                    selectedUser ? "User updated successfully." : "User added successfully."
                );
                setUserName("");
                setPassword("");
                setSelectedUser(null);
                fetchUsers();
            } else {
                setMessage("Failed to save user.");
            }
        } catch (error) {
            setMessage("An error occurred while saving user.");
        }
    };

    // Delete a user
    const handleDeleteUser = async (id) => {
        try {
            const response = await fetch(`http://localhost:5000/api/User/${id}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
            });

            if (response.ok) {
                setMessage("User deleted successfully.");
                fetchUsers();
            } else {
                setMessage("Failed to delete user.");
            }
        } catch (error) {
            setMessage("An error occurred while deleting user.");
        }
    };

    // Populate form with user data for editing
    const handleEditUser = (user) => {
        setSelectedUser(user);
        setUserName(user.userName);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
            <h2>User Management</h2>

            {message && <p style={{ color: "red", marginTop: "10px" }}>{message}</p>}

            {/* User Form */}
            <div style={{ marginBottom: "20px" }}>
                <h3>{selectedUser ? "Update User" : "Add User"}</h3>
                <label>User Name</label>
                <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter user name"
                    style={{
                        width: "100%",
                        padding: "10px",
                        margin: "5px 0",
                        borderRadius: "5px",
                        border: "1px solid #ccc",
                    }}
                />
                {!selectedUser && (
                    <>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            style={{
                                width: "100%",
                                padding: "10px",
                                margin: "5px 0",
                                borderRadius: "5px",
                                border: "1px solid #ccc",
                            }}
                        />
                    </>
                )}
                <button
                    onClick={handleSaveUser}
                    style={{
                        padding: "10px 20px",
                        background: "#4caf50",
                        color: "white",
                        border: "none",
                        borderRadius: "5px",
                        cursor: "pointer",
                        marginTop: "10px",
                    }}
                >
                    {selectedUser ? "Update User" : "Add User"}
                </button>
                {selectedUser && (
                    <button
                        onClick={() => {
                            setSelectedUser(null);
                            setUserName("");
                        }}
                        style={{
                            padding: "10px 20px",
                            background: "#f44336",
                            color: "white",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            marginLeft: "10px",
                        }}
                    >
                        Cancel
                    </button>
                )}
            </div>

            {/* User Table */}
            <div>
                <h3>Existing Users</h3>
                <table
                    style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        marginBottom: "20px",
                    }}
                >
                    <thead>
                        <tr>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>ID</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>User Name</th>
                            <th style={{ border: "1px solid #ddd", padding: "8px" }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    {user.id}
                                </td>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    {user.userName}
                                </td>
                                <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                                    <button
                                        onClick={() => handleEditUser(user)}
                                        style={{
                                            padding: "5px 10px",
                                            background: "#ffc107",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "5px",
                                            cursor: "pointer",
                                            marginRight: "5px",
                                        }}
                                    >
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteUser(user.id)}
                                        style={{
                                            padding: "5px 10px",
                                            background: "#f44336",
                                            color: "white",
                                            border: "none",
                                            borderRadius: "5px",
                                            cursor: "pointer",
                                        }}
                                    >
                                        Delete
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UserManagementComponent;
