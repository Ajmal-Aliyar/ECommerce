const mongoose = require('mongoose')
const cartSchema = new mongoose.Schema({
    userId: {
        type: String,
        require: true
    },
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        require: true
    },
    quantity: {
        type: Number,
        default: 1
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('cart', cartSchema)