const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const ownerModel = require('../models/ownerModel');
const isOwnerLoggedIn = require('../middlewares/isOwnerLoggedIn');
const { loginOwner, logoutOwner } = require('../controllers/ownerController');

router.get("/login", (req, res) => {
    res.render("ownerLogin", {
        success: req.flash("success"),
        error: req.flash("error"),
    });
});

router.post("/login", loginOwner);
router.get("/logout", logoutOwner);

if (process.env.NODE_ENV === "development") {
    router.post('/create', async (req, res) => {
        let owners = await ownerModel.find();

        if (owners.length > 0) return res.sendStatus(503);

        let { fullName, email, contact, password } = req.body;

        const hash = await bcrypt.hash(password, 10);

        await ownerModel.create({
            fullName,
            email,
            contact,
            password: hash,
        });

        res.status(201).send("ownerCreated");
    });
}

router.get('/admin', isOwnerLoggedIn, (req, res) => {
    let success = req.flash('success');
    let error = req.flash('error');
    res.render('createProducts', { success, error });
});

module.exports = router;
