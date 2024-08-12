const mongoose = require('mongoose')
const returnSchema = new mongoose.Schema({
    orderId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    productId:{
        type:mongoose.Schema.Types.ObjectId,
        required:true
    },
    fullName:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    reason:{
        type:String,
        required:true
    },
    productActualPrice:{
        type:Number,
        required:true
    },
    productOfferredPrice:{
        type:Number,
        required:true
    },
    quantity:{
        type:Number,
        required:true
    },
    refundAmount:{
        type:Number,
        required:true
    },
    approved:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model('returnOrder',returnSchema)