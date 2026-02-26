const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
    image: String,
    name: String,
    price: number,
    discount:{
        type: number,
        default: 0,
    },
    panelClr:{
        type:String,
        default: 0,
    },
    txtClr:{
        type:String,
        default: 0,
    }
});

module.exports = mongoose.model("product", productSchema)