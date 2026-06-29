const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

module.exports = async (req, res , next)=>{

    const token = req.cookies.token;

    if(!token){
        req.flash("error","login first")
        return res.redirect('/login')
    }

    try{
        let decoded = jwt.verify(token, process.env.JWT_KEY);
        let user = await userModel.findOne({email: decoded.email}).select('-password');

        if (!user) {
            res.clearCookie("token");
            req.flash("error", "login first");
            return res.redirect("/login");
        }

        req.user = user;
        next();
    }
    catch(err){
        res.clearCookie("token");
        req.flash("error", "Session expired. Please login again.");
        return res.redirect('/login');
    }

}
