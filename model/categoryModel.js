const mongoose = require('mongoose')
const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        required: true
    },
    categoryImage: {
        type: Array,
        required: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('category',categorySchema)