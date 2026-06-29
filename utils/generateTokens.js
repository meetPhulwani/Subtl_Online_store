const jwt = require("jsonwebtoken");

const generateToken = (user) => {
    return jwt.sign(
        { email: user.email, id: user._id, role: "user" },
        process.env.JWT_KEY,
        { expiresIn: "7d" }
    );
};

const generateOwnerToken = (owner) => {
    return jwt.sign(
        { email: owner.email, id: owner._id, role: "owner" },
        process.env.JWT_KEY,
        { expiresIn: "7d" }
    );
};

module.exports = { generateToken, generateOwnerToken };
