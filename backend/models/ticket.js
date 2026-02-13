const mongoose = require("mongoose");
const { Schema } = mongoose;

// ----- Attachment Schema (nested) -----
const attachmentSchema = new Schema(
    {
        name: { type: String, required: true },
        mimeType: { type: String, required: true }, // file type
        path: { type: String, required: true }, // local storage location
        size: { type: Number, required: true },
        uploadedAt: { type: Date, default: Date.now },
    },
    { _id: false }, // no id required as attachment is nested into ticket
);

// ----- Attachment-related methods -----

// Week in ms
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const ticketSchema = new Schema(
    {
        title: { type: String, required: true, trim: true },
        description: { type: String, required: true, trim: true },
        // urgency status (manual input)
        status: {
            type: String,
            enum: ["new", "open", "in_progress", "resolved", "closed"],
            default: "new",
        },
        createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }, // ObjectId ref to populate user info
        dueAt: { type: Date }, // due date used for urgency (default +1 week)

        attachments: { type: [attachmentSchema], default: [] },
    },
    {
        timestamps: true, // adds createdAt auto
    },
);

// ----- Ticket-related methods -----

// pre-validation
// Auto-set dueAt if not provided (createdAt + 1 week)
ticketSchema.pre("validate", function () {
    const created = this.createdAt ?? new Date();

    if (this.dueAt && this.dueAt < created) {
        throw new Error("Due date must be after created date.");
    }

    if (!this.dueAt) {
        this.dueAt = new Date(created.getTime() + WEEK_MS);
    }
});

const Ticket = mongoose.model("Ticket", ticketSchema, "tickets");
module.exports = Ticket;
