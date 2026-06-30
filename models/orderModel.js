const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "product",
    },
    name: String,
    price: Number,
    quantity: Number,
    imageContentType: String,
});

const orderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "user",
            required: true,
        },
        items: [orderItemSchema],
        subtotal: Number,
        productDiscount: Number,
        extraDiscount: Number,
        deliveryFee: Number,
        platformFee: Number,
        total: Number,
        deliveryAddress: {
            fullName: String,
            phone: String,
            addressLine: String,
            city: String,
            pincode: String,
        },
        payment: {
            razorpayOrderId: String,
            razorpayPaymentId: String,
            razorpaySignature: String,
            status: {
                type: String,
                enum: ["pending", "paid", "failed"],
                default: "pending",
            },
            amount: Number,
        },
        status: {
            type: String,
            enum: ["confirmed", "processing", "shipped", "delivered", "cancelled"],
            default: "confirmed",
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("order", orderSchema);
