const ownerModel = require("../models/ownerModel");
const bcrypt = require("bcrypt");
const { generateOwnerToken } = require("../utils/generateTokens");
const cookieOptions = require("../utils/cookieOptions");

module.exports.loginOwner = async (req, res) => {
    try {
        const { email, password } = req.body;

        const owner = await ownerModel.findOne({ email });
        if (!owner) {
            req.flash("error", "Invalid email or password");
            return res.redirect("/owners/login");
        }

        const match = await bcrypt.compare(password, owner.password);
        if (!match) {
            req.flash("error", "Invalid email or password");
            return res.redirect("/owners/login");
        }

        const token = generateOwnerToken(owner);
        res.cookie("ownerToken", token, cookieOptions.owner);

        req.flash("success", "Logged in successfully!");
        return res.redirect("/owners/admin");
    } catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong");
        return res.redirect("/owners/login");
    }
};

module.exports.logoutOwner = (req, res) => {
    res.clearCookie("ownerToken");
    req.flash("success", "Logged out successfully");
    return res.redirect("/owners/login");
};
