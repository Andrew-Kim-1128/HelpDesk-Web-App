const express = require("express");
const server = express();
const port = process.env.PORT || 3000;

const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const errorHandler = require("./middleware/errorHandler");
const { uploadDir } = require("./config/uploads");

// models
const User = require("./models/user");

// routes
const authRoutes = require("./routes/auth.routes");
const ticketRoutes = require("./routes/ticket.routes");
const adminRoutes = require("./routes/admin.routes");

const { DB_URI, ROOT_ADMIN_USERNAME, ROOT_ADMIN_PASSWORD } = process.env;

// middleware
server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

// ----- uploads -----
// serve uploaded files (GET) at uploads/filename
server.use("/uploads", express.static(uploadDir));

// ----- root admin seed -----
const ensureRootAdmin = async () => {
    const rootUsername = ROOT_ADMIN_USERNAME;
    const rootPassword = ROOT_ADMIN_PASSWORD;

    // if env file is empty
    if (!rootUsername || !rootPassword) {
        console.warn("Root admin env vars not set, Skipping seed...");
        return;
    }

    const exists = await User.findOne({ username: rootUsername });
    if (exists) {
        let changed = false;
        if (exists.role !== "admin") {
            exists.role = "admin";
            changed = true;
        }
        if (!exists.isRoot) {
            exists.isRoot = true;
            changed = true;
        }
        if (changed) {
            await exists.save();
        }
        return;
    }

    await User.createUser({
        username: rootUsername,
        password: rootPassword,
        role: "admin",
        isRoot: true,
    });

    console.log(`Root admin created: ${rootUsername}`);
};

// ----- db conn -----
mongoose
    .connect(DB_URI)
    .then(async () => {
        await ensureRootAdmin();
        server.listen(port, () => {
            console.log(`Connected to DB\nServer running on http://localhost:${port}`);
        });
    })
    .catch((error) => {
        console.log(error);
    });

// ----- basic route -----
server.get("/", (request, response) => {
    response.send("Server is live");
});

// ----- mounted routes -----
// login and register
server.use(authRoutes);
// tickets
server.use("/tickets", ticketRoutes);
// admin
server.use("/admin", adminRoutes);

// error handler
server.use(errorHandler);
