const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const path = require("path");

const Ticket = require("../models/ticket");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../config/uploads");

// helper function to filter using due dates (dueAt ranges)
const queryUrgency = (status) => {
    const now = new Date();
    const day = 24 * 60 * 60 * 1000;

    //$lte <= , $gt >
    if (status === "overdue") {
        return { dueAt: { $lte: now } };
    }
    if (status === "urgent") {
        return {
            dueAt: {
                $gt: now,
                $lte: new Date(now.getTime() + day),
            },
        };
    }
    if (status === "soon") {
        return {
            dueAt: {
                $gt: new Date(now.getTime() + day),
                $lte: new Date(now.getTime() + 3 * day),
            },
        };
    }
    if (status === "new") {
        return {
            dueAt: {
                $gt: new Date(now.getTime() + 3 * day),
            },
        };
    }
    return {}; // default return empty
};

// GET ticket (users: only their own, admin: all tickets + sorting options)
router.get("/", requireAuth, async (request, response, next) => {
    try {
        const { userId = "all", urgency = "all", sort = "dueAtAsc" } = request.query;
        const query = {};

        // user access restriction
        if (request.user.role !== "admin") {
            query.createdBy = request.user._id;
        } else {
            // admin filtering options
            if (userId !== "all") {
                query.createdBy = userId;
            }
            if (urgency !== "all") {
                Object.assign(query, queryUrgency(urgency)); // merge into main query
            }
        }

        // sort options
        let sortedObject = { dueAt: 1 }; // default sorted by most urgent
        if (sort === "dueAtDesc") sortedObject = { dueAt: -1 };
        if (sort === "createdAtDesc") sortedObject = { createdAt: -1 };
        if (sort === "createdAtAsc") sortedObject = { createdAt: 1 };

        // populate createdBy and send to frontend
        const tickets = await Ticket.find(query).populate("createdBy", "_id username role").sort(sortedObject);

        response.json(tickets);
    } catch (error) {
        next(error);
    }
});

// POST ticket route + file upload
router.post("/", requireAuth, upload.array("files", 4), async (request, response, next) => {
    try {
        const { title, description, status, dueAt } = request.body;

        // convert multer metadata to db format
        const attachments = (request.files || []).map((file) => ({
            name: file.originalname,
            mimeType: file.mimetype,
            path: `/uploads/${path.basename(file.path)}`, // frontend can open URL
            size: file.size,
        }));

        // validate dueAt date
        const validDueAt = dueAt ? new Date(dueAt) : undefined;
        if (validDueAt && isNaN(validDueAt.getTime())) {
            return response.status(400).json({ message: "Invalid date format" });
        }

        const ticket = await Ticket.create({
            title,
            description,
            status: status ?? "new",
            createdBy: request.user._id,
            dueAt: validDueAt,
            attachments,
        });

        // populated createdBy for frontend
        const populated = await Ticket.findById(ticket._id).populate("createdBy", "_id username role");

        return response.status(201).json(populated);
    } catch (error) {
        next(error);
    }
});

// GET ticket view page
router.get("/:id", requireAuth, async (request, response, next) => {
    try {
        const { id } = request.params;

        if (!mongoose.isValidObjectId(id)) {
            return response.status(400).json({ message: "Invalid ticket id" });
        }

        const ticket = await Ticket.findById(id).populate("createdBy", "_id username role");
        if (!ticket) {
            return response.status(404).json({ message: "Ticket not found" });
        }

        const isOwner = ticket.createdBy._id.toString() === request.user._id.toString();
        const isAdmin = request.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return response.status(403).json({ message: "Not authorized to view this ticket" });
        }

        return response.json(ticket);
    } catch (error) {
        next(error);
    }
});

// PATCH ticket route (Edit)
router.patch("/:id", requireAuth, async (request, response, next) => {
    try {
        const { id } = request.params;

        if (!mongoose.isValidObjectId(id)) {
            return response.status(400).json({ message: "Invalid ticket id" });
        }

        const ticket = await Ticket.findById(id);
        // no ticket found

        if (!ticket) {
            return response.status(404).json({ message: "Ticket not found" });
        }

        // user validation
        const isOwner = ticket.createdBy.toString() === request.user._id.toString();
        const isAdmin = request.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return response.status(403).json({ message: "Not authorized to edit this ticket" });
        }

        // block non-admin edit to admin-only fields
        if (!isAdmin && ("status" in request.body || "dueAt" in request.body || request.body.redact === true)) {
            return response.status(403).json({ message: "Admin required" });
        }

        // admin redaction (remove contents)
        if (isAdmin && request.body.redact === true) {
            ticket.title = "Removed by admin";
            ticket.description = "Removed by admin";
        } else {
            // edit title/desc
            if (typeof request.body.title === "string") {
                ticket.title = request.body.title;
            }
            if (typeof request.body.description === "string") {
                ticket.description = request.body.description;
            }
        }

        // edit status/dueAt (admin only)
        if (isAdmin) {
            const { status, dueAt } = request.body;

            if (typeof status === "string") {
                ticket.status = status;
            }

            if (dueAt !== undefined) {
                if (dueAt === "" || dueAt === null) {
                    ticket.dueAt = undefined; // reset to 1 week if edit field undefined
                } else {
                    const parsed = new Date(dueAt);
                    if (isNaN(parsed.getTime())) {
                        return response.status(400).json({ message: "Invalid date format" });
                    }

                    parsed.setHours(23, 59, 59, 999);

                    ticket.dueAt = parsed;
                }
            }
        }

        await ticket.save();

        const populated = await Ticket.findById(ticket._id).populate("createdBy", "_id username role");
        return response.json({ message: "Ticket updated", ticket: populated });
    } catch (error) {
        next(error);
    }
});

// PATCH ticket route (mark complete)
router.patch("/:id/complete", requireAuth, async (request, response, next) => {
    try {
        const { id } = request.params;

        if (!mongoose.isValidObjectId(id)) {
            return response.status(400).json({ message: "Invalid ticket id" });
        }

        const ticket = await Ticket.findById(id);

        if (!ticket) {
            return response.status(404).json({ message: "Ticket not found" });
        }

        const isOwner = ticket.createdBy.toString() === request.user._id.toString();
        const isAdmin = request.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return response.status(403).json({ message: "Not authorized to complete this ticket" });
        }

        ticket.status = "closed";
        await ticket.save();

        const populated = await Ticket.findById(ticket._id).populate("createdBy", "_id username role");
        return response.json({ message: "Ticket marked as completed", ticket: populated });
    } catch (error) {
        next(error);
    }
});

// DELETE ticket route
router.delete("/:id", requireAuth, async (request, response, next) => {
    try {
        const { id } = request.params;

        if (!mongoose.isValidObjectId(id)) {
            return response.status(400).json({ message: "Invalid ticket id" });
        }

        const ticket = await Ticket.findById(id);

        if (!ticket) return response.status(404).json({ message: "Ticket not found" });

        const isOwner = ticket.createdBy.toString() === request.user._id.toString();
        const isAdmin = request.user.role === "admin";

        if (!isOwner && !isAdmin) {
            return response.status(403).json({ message: "Not authorized to delete this ticket" });
        }

        if (ticket.status !== "closed") {
            return response.status(400).json({ message: "Ticket must be marked as complete before deletion" });
        }

        await Ticket.deleteOne({ _id: id });
        return response.json({ message: "Ticket deleted" });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
