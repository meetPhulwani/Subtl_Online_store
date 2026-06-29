const express = require('express');
const router = express.Router();
const { registerUser,loginUser,logoutUser,forgotPassword,resetPassword } = require('../controllers/authController');

router.post('/register',registerUser);
router.post('/login',loginUser);
router.get('/logout',logoutUser);

router.get("/forgot-password", (req, res) => {
    res.render("forgot-password");
});

router.get("/reset-password/:token", (req, res) => {
    res.render("resetPass", { token: req.params.token });
});

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);


module.exports = router;
