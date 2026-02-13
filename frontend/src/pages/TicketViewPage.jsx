import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getTicketsByIdApi } from "../utility/api";
import { getMsLeft, urgencyText } from "../utility/time";
import { BASE_URL } from "../utility/constants";

// ticket view page (individual by id, /tickets/:id

export default function TicketViewPage() {
    // ----- states -----
    const { id } = useParams();
    const navigate = useNavigate();
    const [ticket, setTicket] = useState(null);
    const [error, setError] = useState("");
    const [msLeft, setMsLeft] = useState(0);

    // ----- useEffect -----

    // fetch ticket
    useEffect(() => {
        const load = async () => {
            setError("");

            try {
                const response = await getTicketsByIdApi(id);
                setTicket(response.data);
            } catch (error) {
                setError(error?.response?.data?.message || "Failed to load ticket");
            }
        };
        load();
    }, [id]);

    // due date timer
    useEffect(() => {
        if (!ticket?.dueAt) return;

        const tick = () => setMsLeft(getMsLeft(ticket.dueAt));
        tick();

        const interval = setInterval(tick, 1000);
        return () => clearInterval(interval);
    }, [ticket?.dueAt]);

    const urgency = useMemo(() => {
        if (!ticket?.dueAt) {
            return "No due date";
        }
        return urgencyText(msLeft);
    }, [msLeft, ticket?.dueAt]);

    if (!ticket) return <div>Loading...</div>;
    return (
        <div>
            <button type="button" onClick={() => navigate("/main")}>
                Back
            </button>
            {error && <p>{error}</p>}
            <h2>{ticket.title}</h2>
            <p>Status: {ticket.status}</p>
            <p>Due: {ticket.dueAt ? new Date(ticket.dueAt).toLocaleString() : "—"}</p>
            <p>{urgency}</p>

            <h3>Description</h3>
            <p>{ticket.description}</p>

            {ticket.createdBy && <p>Created by: {ticket.createdBy.username}</p>}
            {Array.isArray(ticket.attachments) && ticket.attachments.length > 0 && (
                <>
                    <h3>Attachments</h3>
                    <ul>
                        {ticket.attachments.map((attachment, index) => (
                            <li key={`${attachment.path}-${index}`}>
                                <a href={`${BASE_URL}${attachment.path}`} target="_blank" rel="noopener noreferrer">
                                    {attachment.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}
