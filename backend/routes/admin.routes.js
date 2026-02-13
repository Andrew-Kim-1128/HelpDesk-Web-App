const express = require("express");
const router = express.Router();

const User = require("../models/user");
const { requireAuth, requireAdmin, requireRootAdmin } = require("../middleware/auth");

// ----- admin route -----
router.post("/create-admin", requireAuth, requireRootAdmin, async (request, response, next) => {
    const { username, password } = request.body;

    try {
        const exists = await User.findOne({ username });
        if (exists) {
            return response.status(409).json({ message: "Username already exists" });
        }

        const admin = await User.createUser({
            username,
            password,
            role: "admin",
            isRoot: false,
        });

        return response.status(201).json({
            message: "Admin created",
            user: { _id: admin._id, username: admin.username, role: admin.role, isRoot: admin.isRoot },
        });
    } catch (error) {
        next(error);
    }
});

// GET list of users
router.get("/users", requireAuth, requireAdmin, async (_request, response) => {
    try {
        const users = await User.find().select("_id username role isRoot").sort({ username: 1 });
        response.json(users);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
