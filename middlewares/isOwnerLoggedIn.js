const jwt = require("jsonwebtoken");
const ownerModel = require("../models/ownerModel");

module.exports = async (req, res, next) => {
    const token = req.cookies.ownerToken;

    if (!token) {
        req.flash("error", "Owner login required");
        return res.redirect("/owners/login");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_KEY);

        if (decoded.role !== "owner") {
            throw new Error("Not an owner token");
        }

        const owner = await ownerModel.findById(decoded.id).select("-password");

        if (!owner) {
            res.clearCookie("ownerToken");
            req.flash("error", "Owner login required");
            return res.redirect("/owners/login");
        }

        req.owner = owner;
        next();
    } catch (err) {
        res.clearCookie("ownerToken");
        req.flash("error", "Something went wrong");
        return res.redirect("/owners/login");
    }
};
