const mongoose = require('mongoose')
const reviewSchema = new mongoose.Schema({
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                require:true
            },
            userName:{
                type:String,
                required:true
            },
            productId: {
                type: String,
                required: true
            },
            reviewRating: {
                type: String,
                required: true
            },
            reviewTitle:{
                type:String,
                required:true
            },
            reviewComment: {
                type: String,
                required: true
            },
            createdAt:{
                type:Date,
                default:Date.now
            }
})

module.exports = mongoose.model('review',reviewSchema)