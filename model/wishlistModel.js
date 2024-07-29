const mongoose = require('mongoose')
const wishlistSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    wishlistProducts:{
        type:Array,
        required:true
    }
})

module.exports = mongoose.model('wishlist',wishlistSchema)