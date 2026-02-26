const express = require('express');
const router = express.Router();
const upload = require('../config/multer-config');
const multer = require('multer');
const productModel = require('../models/productModel');


router.post('/create',upload.single("image"), async function (req, res) {
try {
        let { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;

        if (!req.file) {
            req.flash("error", "Image is required");
            return res.redirect('/owners/admin');
        }

        let product = await productModel.create({
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            },
            name,
            price,
            discount,
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