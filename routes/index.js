const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middlewares/isLoggedIn');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');

// LOGIN PAGE
router.get("/login", (req, res) => {
    res.render('loginPg', {
        success: req.flash("success"),
        error: req.flash("error")
    });
});

// ADD TO CART
router.get('/addToCart/:productId', isLoggedIn, async (req, res) => {
    try {
        const user = await userModel.findById(req.user._id);

        const existingItem = user.cart.find(
            item => item.product?.toString() === req.params.productId
        );

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            user.cart.push({
                product: req.params.productId,
                quantity: 1
            });
        }

        await user.save();

        req.flash("success", "Item added to cart successfully!");
        res.redirect('/shop');

    } catch (err) {
        console.log(err);
        req.flash("error", "Failed to add item to cart");
        res.redirect('/shop');
    }
});




// CART PAGE (WITH PRICE DETAILS)
router.route('/cart').get(isLoggedIn, async (req, res) => {
    const user = await userModel
        .findById(req.user._id)
        .populate("cart.product");

    let subtotal = 0;
    let productDiscount = 0;

    user.cart.forEach(item => {
        // 🔒 SAFETY CHECK (IMPORTANT)
        if (!item.product || !item.quantity) return;

        subtotal += item.product.price * item.quantity;

        if (item.product.discount) {
            productDiscount += item.product.discount * item.quantity;
        }
    });

    let extraDiscount = subtotal > 2000 ? Math.floor(subtotal * 0.10) : 0;
    let deliveryFee = subtotal > 1500 ? 0 : 80;
    let platformFee = subtotal > 1500 ? 0 : 20;


    let total =
        subtotal -
        productDiscount -
        extraDiscount +
        deliveryFee +
        platformFee;

    res.render('cart', {
        cartItems: user.cart,
        subtotal,
        productDiscount,
        extraDiscount,
        deliveryFee,
        platformFee,
        total
    });
})

.post(isLoggedIn, async (req, res) => {
    const { productId, action } = req.body;

    const user = await userModel
        .findById(req.user._id)
        .populate("cart.product");

    // CLEAR CART
    if (action === "clear") {
        user.cart = [];
        await user.save();
        return res.json({ reload: true });
    }

    const item = user.cart.find(
        i => i.product && i.product._id.toString() === productId
    );

    if (!item) return res.json({ reload: true });

    // REMOVE ITEM
    if (action === "remove") {
        user.cart = user.cart.filter(
            i => i.product._id.toString() !== productId
        );
        await user.save();
        return res.json({ reload: true });
    }

    // INCREASE
    if (action === "increase") {
        item.quantity += 1;
    }

    // DECREASE
    if (action === "decrease") {
        if (item.quantity > 1) {
            item.quantity -= 1;
        } else {
            user.cart = user.cart.filter(
                i => i.product._id.toString() !== productId
            );
        }
    }

    await user.save();

    // RECALCULATE TOTALS
    let subtotal = 0;
    let productDiscount = 0;

    user.cart.forEach(i => {
        subtotal += i.product.price * i.quantity;
        if (i.product.discount) {
            productDiscount += i.product.discount * i.quantity;
        }
    });

    let extraDiscount = subtotal > 2000 ? Math.floor(subtotal * 0.10) : 0;
    let deliveryFee = subtotal > 1500 ? 0 : 80;
    let platformFee = subtotal > 1500 ? 0 : 20;

    let total =
        subtotal -
        productDiscount -
        extraDiscount +
        deliveryFee +
        platformFee;

    if (user.cart.length === 0) {
        return res.json({ reload: true });
    }

    res.json({
        quantity: item.quantity,
        subtotal,
        productDiscount,
        extraDiscount,
        deliveryFee,
        platformFee,
        total
    });
});

// SHOP PAGE
router.get('/shop', isLoggedIn, async (req, res) => {
    const { sort } = req.query;

    let sortOption = {};

    if (sort === 'price_asc') {
        sortOption = { price: 1 };
    }
    else if (sort === 'price_desc') {
        sortOption = { price: -1 };
    }
    else if (sort === 'newest') {
        sortOption = { createdAt: -1 };
    }

    const products = await productModel
        .find()
        .sort(sortOption);

    res.render('shop', {
        products,
        sort,
        success: req.flash("success"),
        error: req.flash("error")
    });
});


module.exports = router;
