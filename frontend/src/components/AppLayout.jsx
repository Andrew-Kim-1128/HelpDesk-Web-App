import { Outlet } from "react-router-dom";
import NavBar from "./NavBar";

export default function AppLayout() {
    return (
        <div>
            <NavBar />
            <main>
                <Outlet />
            </main>
        </div>
    );
}
