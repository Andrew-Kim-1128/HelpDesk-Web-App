import { isCompleteStatus } from "../utility/time";

// admin-controls component (visible only to admins)
export default function AdminControls({ ticket, isAdmin, onDelete, onComplete }) {
    if (!isAdmin) {
        return null;
    }

    const canDelete = isCompleteStatus(ticket.status);

    return (
        <div>
            <button type="button" onClick={() => onComplete(ticket._id)} disabled={ticket.status === "closed"}>
                Mark as complete
            </button>
            <button
                type="button"
                onClick={() => onDelete(ticket._id)}
                disabled={!canDelete}
                title={!canDelete ? "Must be complete first" : ""}
            >
                Delete
            </button>
        </div>
    );
}
