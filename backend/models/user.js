const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcrypt");

// ----- User schema -----
const userSchema = new Schema(
    {
        username: { type: String, required: true, unique: true, trim: true },
        passwordHash: { type: String, required: true },
        // role controls permissions
        role: { type: String, enum: ["user", "admin"], default: "user" },
        isRoot: { type: Boolean, default: false },
    },
    {
        timestamps: true,
    },
);

// ----- user-related methods -----

// password verification (login)
userSchema.methods.verifyPassword = function (password) {
    // compare hashed input to stored passwordHash
    return bcrypt.compare(password, this.passwordHash);
};

// create user
userSchema.statics.createUser = async function ({ username, password, role, isRoot }) {
    // hash password with salt (encryption)
    const passwordHash = await bcrypt.hash(password, 10);

    // create entry in db
    return this.create({
        username,
        passwordHash,
        role: role ?? "user", // default user
        isRoot: isRoot ?? false,
    });
};

const User = mongoose.model("User", userSchema, "users");
module.exports = User;
