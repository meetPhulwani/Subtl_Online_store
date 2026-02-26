const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel');

module.exports = async (req, res , next)=>{

    const token = req.cookies.token;

    if(!token){
        req.flash("error","login first")
        return res.redirect('/login')
    }

    try{
        let decoded =jwt.verify(token, process.env.JWT_KEY);
        let user = await userModel.findOne({email: decoded.email}).select('-password');
        req.user = user;
        next();
    }
    catch(err){
        req.flash("error","something went wrong");
        return res.redirect('/login');
    }

}