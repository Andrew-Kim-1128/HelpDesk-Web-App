const express = require("express");
const router = express.Router();
const User = require("../models/user");
const { signToken } = require("../middleware/auth");

// registration
router.post("/register", async (request, response, next) => {
    const { username, password } = request.body;

    try {
        const exists = await User.findOne({ username });
        if (exists) {
            return response.status(409).json({ message: "Username already exists" });
        }

        const user = await User.createUser({ username, password, role: "user" });

        // sign JWT
        const token = signToken(user);

        return response.status(201).json({
            message: "User created",
            token,
            user: {
                _id: user._id,
                username: user.username,
                role: user.role,
                isRoot: user.isRoot,
            },
        });
    } catch (error) {
        next(error);
    }
});

// login
router.post("/login", async (request, response, next) => {
    const { username, password } = request.body;

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return response.status(400).json({ message: "Invalid username or password" });
        }
        const valid = await user.verifyPassword(password);
        if (!valid) {
            return response.status(400).json({ message: "Invalid username or password" });
        }

        const token = signToken(user);
        response.status(200).json({
            message: "Login success",
            token,
            user: {
                _id: user._id,
                username: user.username,
                role: user.role,
                isRoot: user.isRoot,
            },
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;
