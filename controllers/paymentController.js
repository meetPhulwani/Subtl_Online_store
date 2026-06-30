const crypto = require("crypto");
const { getRazorpay } = require("../utils/razorpay");
const userModel = require("../models/userModel");
const orderModel = require("../models/orderModel");
const calculateCartTotals = require("../utils/cartTotals");

async function getCheckoutUser(req) {
    return userModel.findById(req.user._id).populate("cart.product");
}

exports.createRazorpayOrder = async (req, res) => {
    try {
        const razorpay = getRazorpay();
        if (!razorpay) {
            return res.status(503).json({ error: "Payment gateway not configured" });
        }

        const { fullName, phone, addressLine, city, pincode } = req.body;

        if (!fullName || !phone || !addressLine || !city || !pincode) {
            return res.status(400).json({ error: "Delivery address is required" });
        }

        const user = await getCheckoutUser(req);

        if (!user.cart.length) {
            return res.status(400).json({ error: "Cart is empty" });
        }

        const totals = calculateCartTotals(user.cart);
        const amountPaise = Math.round(totals.total * 100);

        if (amountPaise < 100) {
            return res.status(400).json({ error: "Minimum order amount is Rs.1" });
        }

        const razorpayOrder = await razorpay.orders.create({
            amount: amountPaise,
            currency: "INR",
            receipt: `subtl_${user._id.toString().slice(-8)}_${Date.now()}`,
            notes: {
                userId: user._id.toString(),
                email: user.email,
            },
        });

        const items = user.cart
            .filter((item) => item.product)
            .map((item) => ({
                product: item.product._id,
                name: item.product.name,
                price: item.product.price,
                quantity: item.quantity,
                imageContentType: item.product.image?.contentType,
            }));

        await orderModel.create({
            user: user._id,
            items,
            ...totals,
            deliveryAddress: { fullName, phone, addressLine, city, pincode },
            payment: {
                razorpayOrderId: razorpayOrder.id,
                status: "pending",
                amount: totals.total,
            },
            status: "confirmed",
        });

        res.json({
            orderId: razorpayOrder.id,
            amount: amountPaise,
            currency: "INR",
            keyId: process.env.RAZORPAY_KEY_ID,
            name: "SUBTL",
            description: "Order Payment",
            prefill: {
                name: fullName,
                email: user.email,
                contact: phone,
            },
        });
    } catch (err) {
        console.error("Create Razorpay order error:", err);
        res.status(500).json({ error: "Could not initiate payment" });
    }
};

exports.verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature,
        } = req.body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            req.flash("error", "Invalid payment response");
            return res.redirect("/payment/failed");
        }

        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

        const order = await orderModel.findOne({
            "payment.razorpayOrderId": razorpay_order_id,
            user: req.user._id,
        });

        if (!order) {
            req.flash("error", "Order not found");
            return res.redirect("/payment/failed");
        }

        if (expectedSignature !== razorpay_signature) {
            order.payment.status = "failed";
            order.payment.razorpayPaymentId = razorpay_payment_id;
            await order.save();
            req.flash("error", "Payment verification failed");
            return res.redirect("/payment/failed");
        }

        order.payment.status = "paid";
        order.payment.razorpayPaymentId = razorpay_payment_id;
        order.payment.razorpaySignature = razorpay_signature;
        await order.save();

        const user = await userModel.findById(req.user._id);

        user.cart.forEach((item) => {
            if (item.product) {
                user.order.push(item.product);
            }
        });
        user.cart = [];
        await user.save();

        req.flash("success", "Payment successful!");
        res.redirect(`/orders/${order._id}?paid=1`);
    } catch (err) {
        console.error("Verify payment error:", err);
        req.flash("error", "Payment verification failed");
        res.redirect("/payment/failed");
    }
};

exports.getOrders = async (req, res) => {
    const orders = await orderModel
        .find({ user: req.user._id })
        .sort({ createdAt: -1 });

    res.render("orders", {
        orders,
        success: req.flash("success"),
        error: req.flash("error"),
    });
};

exports.getOrderDetail = async (req, res) => {
    const order = await orderModel
        .findOne({ _id: req.params.id, user: req.user._id })
        .populate("items.product");

    if (!order) {
        req.flash("error", "Order not found");
        return res.redirect("/orders");
    }

    res.render("order-detail", {
        order,
        justPaid: req.query.paid === "1",
        success: req.flash("success"),
        error: req.flash("error"),
    });
};
