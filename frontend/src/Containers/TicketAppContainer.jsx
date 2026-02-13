import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";

import FilterComponent from "../components/FilterComponent";
import TicketCardContainer from "../components/TicketCardContainer";

import { getDecodedUser } from "../utility/auth";
import { getTicketsApi, deleteTicketApi, completeTicketApi } from "../utility/api";

// main application container

export default function TicketAppContainer() {
    // ----- states -----
    const navigate = useNavigate();
    const user = getDecodedUser();
    const isAdmin = user?.role === "admin" || user?.isRoot === true;

    const [tickets, setTickets] = useState([]);
    const [error, setError] = useState("");

    const [searchText, setSearchText] = useState("");
    const [sortMode, setSortMode] = useState("due_asc");

    // ----- useEffects -----
    useEffect(() => {
        if (!user) {
            navigate("/");
        }
    }, [user, navigate]);

    const fetchTickets = async () => {
        setError("");
        try {
            const response = await getTicketsApi({ sort: "dueAtAsc" });
            setTickets(response.data);
        } catch (error) {
            setError(error?.response?.data?.message || "Failed to load tickets");
        }
    };

    useEffect(() => {
        fetchTickets();
    }, []);

    const filteredSortedTickets = useMemo(() => {
        const search = searchText.trim().toLowerCase();
        const filtered = tickets.filter((ticket) => (ticket.title || "").toLowerCase().includes(search));

        return [...filtered].sort((a, b) => {
            if (sortMode === "title_asc") {
                return (a.title || "").localeCompare(b.title || "");
            }
            if (sortMode === "title_desc") {
                return (b.title || "").localeCompare(a.title || "");
            }

            const aDue = a.dueAt ? new Date(a.dueAt).getTime() : Number.POSITIVE_INFINITY;
            const bDue = b.dueAt ? new Date(b.dueAt).getTime() : Number.POSITIVE_INFINITY;

            if (sortMode === "due_asc") {
                return aDue - bDue;
            }
            if (sortMode === "due_desc") {
                return bDue - aDue;
            }

            return 0;
        });
    }, [tickets, searchText, sortMode]);

    // ----- handlers -----
    const handleComplete = async (id) => {
        setError("");

        try {
            await completeTicketApi(id);
            await fetchTickets();
        } catch (error) {
            setError(error?.response?.data?.message || "Failed to complete ticket");
        }
    };

    const handleDelete = async (id) => {
        setError("");

        try {
            await deleteTicketApi(id);
            await fetchTickets();
        } catch (error) {
            setError(error?.response?.data?.message || "Failed to delete ticket");
        }
    };

    return (
        <div>
            <div>
                <h2>Tickets</h2>
                <button type="button" onClick={() => navigate("/new-ticket")}>
                    New ticket
                </button>
            </div>
            {error && <p>{error}</p>}
            <div>
                <FilterComponent
                    searchText={searchText}
                    onSearchTextChange={setSearchText}
                    sortMode={sortMode}
                    onSortModeChange={setSortMode}
                    ticketsCount={tickets.length}
                    filteredCount={filteredSortedTickets.length}
                />
            </div>
            <div>
                <TicketCardContainer
                    tickets={filteredSortedTickets}
                    isAdmin={isAdmin}
                    onDelete={handleDelete}
                    onComplete={handleComplete}
                />
            </div>
        </div>
    );
}
