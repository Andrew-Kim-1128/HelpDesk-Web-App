import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../utility/api";
import { setToken, clearToken } from "../utility/auth";

// login page (route "/")

export default function LoginPage() {
    // ----- states -----
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");

    // ----- useEffect -----
    useEffect(() => {
        clearToken();
    }, []);

    // ----- handlers -----
    const handleLogin = async (e) => {
        e.preventDefault();
        setMessage("");

        try {
            const response = await loginApi(username, password);
            setToken(response.data.token);
            navigate("/main");
        } catch (error) {
            setMessage(error?.response?.data?.message || "Login failed");
        }
    };

    return (
        <div>
            <h2>Login</h2>
            {message && <p>{message}</p>}

            <form onSubmit={handleLogin}>
                <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="username" />
                <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="password"
                    type="password"
                />
                <button type="submit">Login</button>
            </form>

            <button onClick={() => navigate("/create-user")}>Create Account</button>
        </div>
    );
}
