const express = require('express');
const router = express.Router();
const isLoggedIn = require('../middlewares/isLoggedIn');
const productModel = require('../models/productModel');
const userModel = require('../models/userModel');
const calculateCartTotals = require('../utils/cartTotals');
const {
    createRazorpayOrder,
    verifyPayment,
    getOrders,
    getOrderDetail,
} = require('../controllers/paymentController');

router.get("/", (req, res) => {
    res.render("app");
});

router.get("/login", (req, res) => {
    res.render('loginPg', {
        success: req.flash("success"),
        error: req.flash("error")
    });
});

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

router.route('/cart').get(isLoggedIn, async (req, res) => {
    const user = await userModel
        .findById(req.user._id)
        .populate("cart.product");

    const totals = calculateCartTotals(user.cart);

    res.render('cart', {
        cartItems: user.cart,
        ...totals
    });
})

.post(isLoggedIn, async (req, res) => {
    const { productId, action } = req.body;

    const user = await userModel
        .findById(req.user._id)
        .populate("cart.product");

    if (action === "clear") {
        user.cart = [];
        await user.save();
        return res.json({ reload: true });
    }

    const item = user.cart.find(
        i => i.product && i.product._id.toString() === productId
    );

    if (!item) return res.json({ reload: true });

    if (action === "remove") {
        user.cart = user.cart.filter(
            i => i.product._id.toString() !== productId
        );
        await user.save();
        return res.json({ reload: true });
    }

    if (action === "increase") {
        item.quantity += 1;
    }

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

    const totals = calculateCartTotals(user.cart);

    if (user.cart.length === 0) {
        return res.json({ reload: true });
    }

    res.json({
        quantity: item.quantity,
        ...totals
    });
});

router.get('/checkout', isLoggedIn, async (req, res) => {
    const user = await userModel
        .findById(req.user._id)
        .populate("cart.product");

    if (!user.cart.length) {
        req.flash("error", "Your cart is empty");
        return res.redirect("/cart");
    }

    const totals = calculateCartTotals(user.cart);

    res.render("checkout", {
        cartItems: user.cart,
        ...totals,
        user: req.user,
        razorpayKeyId: process.env.RAZORPAY_KEY_ID || "",
        success: req.flash("success"),
        error: req.flash("error"),
    });
});

router.post("/checkout/create-order", isLoggedIn, createRazorpayOrder);
router.post("/checkout/verify", isLoggedIn, verifyPayment);

router.get("/payment/failed", isLoggedIn, (req, res) => {
    res.render("payment-failed", {
        error: req.flash("error"),
    });
});

router.get("/orders", isLoggedIn, getOrders);
router.get("/orders/:id", isLoggedIn, getOrderDetail);

router.post('/checkout', isLoggedIn, async (req, res) => {
    req.flash("error", "Please use secure payment at checkout");
    res.redirect("/checkout");
});

router.get('/profile', isLoggedIn, async (req, res) => {
    const user = await userModel
        .findById(req.user._id)
        .populate("order");

    res.render("profile", {
        user,
        success: req.flash("success"),
        error: req.flash("error"),
    });
});

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
