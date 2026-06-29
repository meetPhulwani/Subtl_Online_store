const express = require('express');
const router = express.Router();
const upload = require('../config/multer-config');
const productModel = require('../models/productModel');
const isOwnerLoggedIn = require('../middlewares/isOwnerLoggedIn');


router.post('/create', isOwnerLoggedIn, upload.single("image"), async function (req, res) {
try {
        let { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;

        if (!req.file) {
            req.flash("error", "Image is required");
            return res.redirect('/owners/admin');
        }

        await productModel.create({
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            },
            name,
            price: Number(price),
            discount: Number(discount) || 0,
            bgcolor,
            panelcolor,
            textcolor
        });

        req.flash("success", "YEYYYY!!! Product created successfully");
        return res.redirect('/owners/admin');
    }
    catch (err) {
        console.log(err);
        req.flash("error", "Something went wrong");
        return res.redirect('/owners/admin');
    }
});


module.exports = router;
