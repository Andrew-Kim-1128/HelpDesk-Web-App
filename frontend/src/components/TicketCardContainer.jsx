import TicketCard from "./TicketCard";

// ticket-card container component

export default function TicketCardContainer({ tickets, isAdmin, onDelete, onComplete }) {
    if (!tickets || tickets.length === 0) {
        return <h2>No tickets found.</h2>;
    }

    return (
        <div>
            {tickets.map((ticket) => (
                <TicketCard
                    key={ticket._id}
                    ticket={ticket}
                    isAdmin={isAdmin}
                    onDelete={onDelete}
                    onComplete={onComplete}
                />
            ))}
        </div>
    );
}
