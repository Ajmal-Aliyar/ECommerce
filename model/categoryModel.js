const mongoose = require('mongoose')
const categorySchema = new mongoose.Schema({
    categoryName: {
        type: String,
        require: true
    },
    categoryImage: {
        type: Array,
        require: true
    },
    isBlocked: {
        type: Boolean,
        default: false
    }
})

module.exports = mongoose.model('category',categorySchema)