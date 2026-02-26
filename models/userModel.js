const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    fullName: String,
    email: String,
    contact: Number,
    password: String,
    isAdmin: Boolean,
    order: {
        type: Array,
        default: [],
    },
    cart: {
        type: Array,
        default: [],
    },
    picture: String,
});

module.exports = mongoose.model("user", userSchema)