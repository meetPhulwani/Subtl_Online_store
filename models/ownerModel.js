const mongoose = require('mongoose');

const ownerSchema = mongoose.Schema({
    fullName: String,
    email: String,
    contact: Number,
    password: String,
    products: {
        type: Array,
        default: [],
    },
    picture: String,
});

module.exports = mongoose.model("owner", ownerSchema)
