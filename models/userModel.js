const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    fullName: String,
    email: String,
    contact: Number,
    password: String,

    resetPasswordToken: String,
    resetPasswordExpiry: Date,
    
    order: [{
        type: mongoose.Schema.Types.ObjectId,
        ref:"product"
    }],
cart: [
    {
        product: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "product"
        },
        quantity: {
            type: Number,
            default: 1
        }
    }
],

    picture: String,
});

module.exports = mongoose.model("user", userSchema)