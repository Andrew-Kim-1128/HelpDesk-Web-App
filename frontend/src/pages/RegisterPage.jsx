import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { registerApi, createAdminApi } from "../utility/api";
import { setToken, getDecodedUser } from "../utility/auth";

// registration page (route: "/create-user")

export default function RegisterPage() {
    // ----- states -----
    const navigate = useNavigate();
    const currentUser = getDecodedUser(); // null if not logged in
    const isRoot = currentUser?.isRoot === true;

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("user"); // default always user
    const [message, setMessage] = useState("");

    // ----- useEffect -----
    useEffect(() => {
        if (currentUser && !isRoot) {
            navigate("/main");
        }
    }, [currentUser, isRoot, navigate]);

    // ----- handlers -----
    const handleRegister = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            // root admin (new admin)
            if (isRoot && role === "admin") {
                await createAdminApi(username, password);
                setMessage("New admin created successfully");
                navigate("/main");

                return;
            }

            // normal registration (new user)
            const response = await registerApi(username, password);
            setToken(response.data.token);
            navigate("/main");
        } catch (error) {
            setMessage(error?.response?.data?.message || "Registration failed");
        }
    };

    return (
        <div>
            <h2>Create User</h2>
            {message && <p>{message}</p>}

            <form onSubmit={handleRegister}>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    type="password"
                />
                {isRoot && (
                    <label>
                        Account type:
                        <select value={role} onChange={(e) => setRole(e.target.value)}>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </label>
                )}
                <button type="submit">Register</button>
            </form>
            <button onClick={() => navigate("/")}>Back to login</button>
        </div>
    );
}
