import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AdminControls from "./AdminControls";
import { getMsLeft, urgencyText } from "../utility/time";

// ticket-card component

export default function TicketCard({ ticket, isAdmin, onDelete, onComplete }) {
    // ----- states -----
    const navigate = useNavigate();
    const [msLeft, setMsLeft] = useState(() => (ticket.dueAt ? getMsLeft(ticket.dueAt) : 0));

    // ----- useEffect -----

    // countdown timer
    useEffect(() => {
        if (!ticket.dueAt) {
            return;
        }

        const id = setInterval(() => setMsLeft(getMsLeft(ticket.dueAt)), 1000);

        return () => clearInterval(id); // cleanup
    }, [ticket.dueAt]);

    // ----- handlers -----

    // status display
    const urgency = useMemo(() => {
        if (!ticket.dueAt) {
            return "No due date";
        }
        return urgencyText(msLeft);
    }, [msLeft, ticket.dueAt]);

    return (
        <div>
            <div>
                <div>
                    <h3>{ticket.title}</h3>
                    <div>
                        <p>Status: {ticket.status}</p>
                        <p>Due: {ticket.dueAt ? new Date(ticket.dueAt).toLocaleString() : "—"}</p>
                    </div>
                </div>
                <div>
                    <p>{urgency}</p>
                    <button type="button" onClick={() => navigate(`/tickets/${ticket._id}`)}>
                        View
                    </button>
                    <button type="button" onClick={() => navigate(`/tickets/${ticket._id}/edit`)}>
                        Edit
                    </button>
                </div>
            </div>
            <p>{ticket.description?.length > 140 ? ticket.description.slice(0, 140) + "..." : ticket.description}</p>
            <AdminControls ticket={ticket} isAdmin={isAdmin} onDelete={onDelete} onComplete={onComplete} />
        </div>
    );
}
