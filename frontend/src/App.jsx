import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TicketAppContainer from "./Containers/TicketAppContainer";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import AppLayout from "./components/AppLayout.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import RegisterPage from "./pages/RegisterPage.jsx";
import NotAuthorized from "./pages/NotAuthorized.jsx";
import PageNotFound from "./pages/PageNotFound.jsx";
import NewTicketPage from "./pages/NewTicketPage.jsx";
import TicketViewPage from "./pages/TicketViewPage.jsx";
import EditTicketPage from "./pages/EditTicketPage.jsx";

// Main application page to handle routing

function App() {
    return (
        <>
            <Router>
                <Routes>
                    <Route path="/" element={<LoginPage />} />
                    <Route path="/create-user" element={<RegisterPage />} />
                    <Route path="/not-authorized" element={<NotAuthorized />} />

                    <Route element={<ProtectedRoute />}>
                        <Route element={<AppLayout />}>
                            <Route path="/main" element={<TicketAppContainer />} />
                            <Route path="/new-ticket" element={<NewTicketPage />} />
                            <Route path="/tickets/:id" element={<TicketViewPage />} />
                            <Route path="/tickets/:id/edit" element={<EditTicketPage />} />
                        </Route>
                    </Route>

                    <Route path="*" element={<PageNotFound />} />
                </Routes>
            </Router>
        </>
    );
}

export default App;
