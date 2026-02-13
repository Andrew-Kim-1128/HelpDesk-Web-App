import { Link } from "react-router-dom";
import { getDecodedUser } from "../utility/auth";

// page not found page

export default function PageNotFound() {
    const user = getDecodedUser();

    return (
        <div>
            <h1>Page Not Found</h1>
            <Link to={user ? "/main" : "/"}>{user ? "Back to main" : "Back to login"}</Link>
        </div>
    );
}
