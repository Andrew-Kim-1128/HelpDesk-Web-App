import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getDecodedUser } from "../utility/auth";
import { getTicketsByIdApi, updateticketApi, redactTicketApi } from "../utility/api";

// edit ticket page (/tickets/:id/edit)

export default function EditTicketPage() {
    // ----- states -----
    const { id } = useParams();
    const navigate = useNavigate();

    const user = getDecodedUser();
    const isAdmin = user?.role === "admin" || user?.isRoot === true;

    const [ticket, setTicket] = useState(null);

    // shared settings
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // admin-only settings
    const [status, setStatus] = useState("open");
    const [dueAt, setDueAt] = useState("");

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    // ----- useEffects -----

    // load ticket
    const loadTicket = useCallback(async () => {
        setError("");
        try {
            const response = await getTicketsByIdApi(id);
            const ticket = response.data;

            setTicket(ticket);
            setTitle(ticket.title || "");
            setDescription(ticket.description || "");
            setStatus(ticket.status || "open");

            if (ticket.dueAt) {
                const date = new Date(ticket.dueAt);
                setDueAt(date.toISOString().slice(0, 10));
            } else {
                setDueAt("");
            }
        } catch (error) {
            setError(error?.response?.data?.message || "Failed to load ticket");
        }
    }, [id]);

    useEffect(() => {
        loadTicket();
    }, [loadTicket]);

    // ----- handlers -----
    const handleSave = async (e) => {
        e.preventDefault();
        setError("");
        setMessage("");

        try {
            const payload = isAdmin
                ? {
                      status,
                      dueAt: dueAt || undefined,
                      ...(title?.trim() ? { title: title.trim() } : {}),
                      ...(description?.trim() ? { description: description.trim() } : {}),
                  }
                : { title, description };

            await updateticketApi(id, payload);
            setMessage("Changed saved successfully");
            navigate(`/tickets/${id}`);
        } catch (error) {
            setError(error?.response?.data?.message || "Failed to update ticket");
        }
    };

    const handleRedact = async () => {
        setError("");
        setMessage("");

        try {
            await redactTicketApi(id);
            await loadTicket();
            setMessage("Content removed by admin");
        } catch (error) {
            setError(error?.response?.data?.message || "Failed to redact ticket");
        }
    };

    if (!ticket) return <div>Loading...</div>;

    return (
        <div>
            <button type="button" onClick={() => navigate(`/tickets/${id}`)}>
                Back
            </button>

            <h2>Edit Ticket</h2>
            {message && <p>{message}</p>}
            {error && <p>{error}</p>}

            <form onSubmit={handleSave}>
                <label>
                    Title:
                    <input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </label>
                <label>
                    Description:
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={6} />
                </label>
                {isAdmin && (
                    <>
                        <label>
                            Status:
                            <select value={status} onChange={(e) => setStatus(e.target.value)}>
                                <option value="new">new</option>
                                <option value="open">open</option>
                                <option value="in_progress">in_progress</option>
                                <option value="resolved">resolved</option>
                                <option value="closed">closed</option>
                            </select>
                        </label>
                        <label>
                            Due Date:
                            <input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
                        </label>

                        <button type="button" onClick={handleRedact}>
                            Remove content
                        </button>
                    </>
                )}
                <div>
                    <button type="submit">Save</button>
                    <button type="button" onClick={() => navigate("/main")}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
