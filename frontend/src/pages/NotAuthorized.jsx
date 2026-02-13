import { Link } from "react-router-dom";
import { getDecodedUser } from "../utility/auth";

// not-authorized page

export default function NotAuthorized() {
    const user = getDecodedUser();

    return (
        <div>
            <h1>You are not authorized to visit this page</h1>
            <Link to={user ? "/main" : "/"}>{user ? "Back to main" : "Back to login"}</Link>
        </div>
    );
}
