import { Navigate, Outlet } from "react-router-dom";
import { getDecodedUser } from "../utility/auth";

export default function ProtectedRoute() {
    const user = getDecodedUser();

    if (!user) {
        return <Navigate to="/" replace />;
    }
    return <Outlet />;
}
