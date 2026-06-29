const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const { generateToken } = require('../utils/generateTokens');
const cookieOptions = require('../utils/cookieOptions');
const crypto = require("crypto");
const sendEmail = require("../utils/sendMail");


module.exports.registerUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            req.flash("error", "All fields are required");
            return res.redirect("/login");
        }

        let existingUser = await userModel.findOne({ email });
        if (existingUser) {
            req.flash("error", "User already exists with this email");
            return res.redirect("/login");
        }

        const hash = await bcrypt.hash(password, 10);

        await userModel.create({
            fullName,
            email,
            password: hash,
        });

        req.flash("success", "Account created! Please login now.");
        return res.redirect("/login");

    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong");
        return res.redirect("/login");
    }
};

module.exports.loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        let user = await userModel.findOne({ email });
        if (!user) {
            req.flash("error", "Invalid email or password");
            return res.redirect("/login");
        }

        const match = await bcrypt.compare(password, user.password);

        if (!match) {
            req.flash("error", "Invalid email or password");
            return res.redirect("/login");
        }

        let token = generateToken(user);
        res.cookie("token", token, cookieOptions.user);

        req.flash("success", "Logged in successfully!");
        return res.redirect("/shop");

    } catch (err) {
        console.error("Login error:", err.message);
        req.flash("error", "Something went wrong. Is the database running?");
        return res.redirect("/login");
    }
};

module.exports.logoutUser = (req, res) => {
    try {
        res.clearCookie("token");

        req.flash("success", "Logged out successfully");

        return res.redirect("/login");
    } catch (err) {
        console.log(err);
        req.flash("error", "Logout failed");
        return res.redirect("/login");
    }
};

module.exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await userModel.findOne({ email });

        if (!user) {
            req.flash("success", "If the email exists, a reset link has been sent");
            return res.redirect("/login");
        }

        const token = crypto.randomBytes(32).toString("hex");

        user.resetPasswordToken = token;
        user.resetPasswordExpiry = Date.now() + 15 * 60 * 1000;
        await user.save();

        const resetLink = `${req.protocol}://${req.get("host")}/users/reset-password/${token}`;

        await sendEmail(
            user.email,
            "Reset Your Password",
            `Click the link below to reset your password:\n\n${resetLink}\n\nLink valid for 15 minutes.`
        );

        req.flash("success", "Password reset link sent to your email");
        res.redirect("/login");

    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("/login");
    }
};

module.exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { password } = req.body;

        const user = await userModel.findOne({
            resetPasswordToken: token,
            resetPasswordExpiry: { $gt: Date.now() },
        });

        if (!user) {
            req.flash("error", "Invalid or expired link");
            return res.redirect("/login");
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpiry = undefined;

        await user.save();

        req.flash("success", "Password reset successful. Please login.");
        res.redirect("/login");

    } catch (err) {
        console.log(err);
        req.flash("error", "Password reset failed");
        res.redirect("/login");
    }
};
