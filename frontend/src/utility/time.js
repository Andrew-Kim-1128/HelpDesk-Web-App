export const DAY_MS = 24 * 60 * 60 * 1000; // 1 day in milliseconds

// function to format ms to user friendly format
export function formatDuration(ms) {
    const abs = Math.abs(ms); //absolute
    const totalSeconds = Math.floor(abs / 1000);

    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (days > 0) {
        return `${days}d ${hours}h`;
    }
    if (hours > 0) {
        return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
        return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
}

// function to get time left in ms
export function getMsLeft(dueAt) {
    return new Date(dueAt).getTime() - Date.now();
}

// function to generate status text
export function urgencyText(msLeft) {
    if (msLeft <= 0) {
        return `Overdue by ${formatDuration(msLeft)}`;
    }
    if (msLeft <= DAY_MS) {
        return `Urgent - due in ${formatDuration(msLeft)}`;
    }
    if (msLeft <= 3 * DAY_MS) {
        return `Soon - due in ${formatDuration(msLeft)}`;
    }
    return `New - due in ${formatDuration(msLeft)}`;
}

// function to change status to closed
export function isCompleteStatus(status) {
    return status === "closed";
}
