import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createTicket } from "../utility/api";

// new ticket page

export default function NewTicketPage() {
    // ----- states -----
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [dueAt, setDueAt] = useState("");
    const [files, setFiles] = useState([]);
    const [error, setError] = useState("");

    const navigate = useNavigate();

    // ----- useEffect -----

    // ----- handlers -----

    // submit handler
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!title.trim()) {
            setError("Title is required");
            return;
        }

        const allowedTypes = [
            "image/png",
            "image/jpeg",
            "image/jpg",
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        ];

        for (const file of files) {
            if (!allowedTypes.includes(file.type)) {
                setError("Only PNG, JPG, JPEG, PDF, DOC, and DOCX files are allowed");
                return;
            }
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);

        if (dueAt) {
            formData.append("dueAt", dueAt);
        }

        for (const file of files.slice(0, 4)) {
            formData.append("files", file);
        }

        try {
            await createTicket(formData);

            navigate("/main");
        } catch (error) {
            setError(error?.response?.data?.message || "Failed to create ticket");
        }
    };

    return (
        <div>
            <h2>Create New Ticket</h2>
            {error && <p>{error}</p>}

            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <label>
                    Title
                    <input value={title} onChange={(e) => setTitle(e.target.value)} required />
                </label>
                <label>
                    Description
                    <textarea value={description} onChange={(e) => setDescription(e.target.value)} />
                </label>
                <label>
                    Due Date
                    <input type="date" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
                </label>
                <label>
                    Attachments
                    <input
                        type="file"
                        multiple
                        accept=".png,.jpg,.jpeg,.pdf,.doc,.docx"
                        onChange={(e) => setFiles([...e.target.files].slice(0, 4))}
                    />
                </label>
                <button type="submit">Create Ticket</button>
            </form>
            <button onClick={() => navigate("/main")}>Cancel</button>
        </div>
    );
}
