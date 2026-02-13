import { useNavigate } from "react-router-dom";
import { getDecodedUser, clearToken } from "../utility/auth";

// navbar component

export default function NavBar() {
    const navigate = useNavigate();
    const user = getDecodedUser();
    const isRoot = user?.isRoot === true;

    const logout = () => {
        clearToken();
        navigate("/");
    };

    return (
        <nav className="NavBar">
            <div className="NavUser">
                <h3>{user ? user.username : "Guest"}</h3>
                {isRoot && (
                    <button type="button" onClick={() => navigate("/create-user")}>
                        Create new user
                    </button>
                )}
                {user && <button onClick={logout}>Logout</button>}
            </div>
            <div>
                <h2>Helpdesk Application</h2>
            </div>
        </nav>
    );
}
