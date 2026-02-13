const jwt = require("jsonwebtoken");
const User = require("../models/user");

// helper function to create new token
const signToken = (user) => {
    const SECRET_KEY = process.env.SECRET_KEY;

    return jwt.sign(
        {
            sub: user._id.toString(), //subject: user id
            role: user.role,
            username: user.username,
            isRoot: user.isRoot,
        },
        SECRET_KEY,
        { expiresIn: "7d" },
    );
};

// ----- jwt middleware ----- (auth)
const requireAuth = async (request, response, next) => {
    // inc. request, response, next step
    try {
        const header = request.headers.authorization || "";
        const [type, token] = header.split(" ");

        // format enforce
        if (type !== "Bearer" || !token) {
            return response.status(401).json({ message: "Missing token" });
        }

        const SECRET_KEY = process.env.SECRET_KEY;

        // verify jwt signature, ensure user exists
        const payload = jwt.verify(token, SECRET_KEY);

        const user = await User.findById(payload.sub).select("_id username role isRoot");
        if (!user) return response.status(401).json({ message: "Invalid token user" });

        request.user = user;

        next(); // authentication success
    } catch (error) {
        console.log(error);
        return response.status(401).json({ message: "Unauthorized" });
    }
};

// admin authorization
const requireAdmin = (request, response, next) => {
    if (request.user?.role !== "admin") {
        return response.status(403).json({ message: "Admin required" });
    }
    next(); // authorization success
};

// ----- root middleware -----
const requireRootAdmin = (request, response, next) => {
    if (!request.user?.isRoot) {
        return response.status(403).json({ message: "Root admin required" });
    }
    next();
};

module.exports = { signToken, requireAuth, requireAdmin, requireRootAdmin };
