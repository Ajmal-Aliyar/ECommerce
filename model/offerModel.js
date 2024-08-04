const mongoose = require('mongoose')

const offerSchema = new mongoose.Schema({
    offerName:{
        type:String,
        required:true
    },
    offerType:{
        type:String,
        required:true
    },
   
    offerPercentage:{
        type:Number,
        required:true
    },
    offerItem:{
        type:String,
        required:true
    },
    isActive:{
        type:Boolean,
        default:true
    }
}, { timestamps: true })

module.exports = mongoose.model('offerModule',offerSchema)

// offerStart:{
//     type:Date,
//     required:true
// },
// offerEnd:{
//     type:Date,
//     required:true
// },