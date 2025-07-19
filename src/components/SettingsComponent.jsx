import React, { useState, useEffect } from "react";
import "./user-management.css";

const UserManagementComponent = () => {
    const [users, setUsers] = useState([]);
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [message, setMessage] = useState("");

    const fetchUsers = async () => {
        try {
            const response = await fetch("http://localhost:5001/api/User", {
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

    const handleSaveUser = async () => {
        try {
            const url = selectedUser
                ? `http://10.0.20.33:9000/api/User/${selectedUser.id}`
                : "http://10.0.20.33:9000/api/User/add";

            const method = selectedUser ? "PUT" : "POST";

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${localStorage.getItem("token")}`,
                },
                body: JSON.stringify({
                    userName,
                    password: !selectedUser ? password : undefined,
                    permissions: {
                        view: selectedUser?.permissions?.view || false,
                        control: selectedUser?.permissions?.control || false,
                        delete: selectedUser?.permissions?.delete || false,
                    },
                }),
            });

            if (response.ok) {
                setMessage(selectedUser ? "User updated successfully." : "User added successfully.");
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

    const handleDeleteUser = async (id) => {
        try {
            const response = await fetch(`http://10.0.20.33:9000/api/User/${id}`, {
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

    const handleEditUser = (user) => {
        setSelectedUser(user);
        setUserName(user.userName);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handlePermissionChange = (permissionKey) => {
        setSelectedUser((prev) => ({
            ...prev,
            permissions: {
                ...prev.permissions,
                [permissionKey]: !prev.permissions?.[permissionKey],
            },
        }));
    };

    return (
        <div className="user-management">
            <h2>User Management</h2>

            {message && <p className="message">{message}</p>}

            <div className="form-section">
                <h3>{selectedUser ? "Update User" : "Add User"}</h3>
                <label>User Name</label>
                <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    placeholder="Enter user name"
                />
                {!selectedUser && (
                    <>
                        <label>Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                        />
                    </>
                )}

                {selectedUser && (
                    <div className="permissions">
                        <label>Permissions:</label>
                        {["view", "control", "delete"].map((perm) => (
                            <label key={perm} className="permission-checkbox">
                                <input
                                    type="checkbox"
                                    checked={selectedUser.permissions?.[perm] || false}
                                    onChange={() => handlePermissionChange(perm)}
                                />
                                {perm.charAt(0).toUpperCase() + perm.slice(1)}
                            </label>
                        ))}
                    </div>
                )}

                <div className="button-row">
                    <button className="save-btn" onClick={handleSaveUser}>
                        {selectedUser ? "Update User" : "Add User"}
                    </button>
                    {selectedUser && (
                        <button
                            className="cancel-btn"
                            onClick={() => {
                                setSelectedUser(null);
                                setUserName("");
                            }}
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            <div className="user-list">
                <h3>Existing Users</h3>
                <table>
                    <thead>
                        <tr>
                            <th>User Name</th>
                            <th>Permissions</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td>{user.userName}</td>
                                <td>
                                    {["view", "control", "delete"]
                                        .filter((perm) => user.permissions?.[perm])
                                        .join(", ") || "None"}
                                </td>
                                <td>
                                    <button className="edit-btn" onClick={() => handleEditUser(user)}>Edit</button>
                                    <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>Delete</button>
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
