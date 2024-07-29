const mongoose = require('mongoose')
const addressSchema = new mongoose.Schema({
    user_id:{
        type:String,
        required:true
    },
    firstName:{
        type: String,
        required:true
    },
    lastName:{
        type: String,
        required:true
    },
    
    country:{
        type:String,
        required:true
    },
    pinCode:{
        type:Number,
        required:true
    },
    place:{
        type:String,
        required:true
    },
    district:{
        type:String,
        required:true
    },
    state:{
        type:String,
        required:true
    },
    address:{
        type:String,
        requied:true
    },
    city:{
        type:String,
        required:true
    },
    mobile:{
        type:Number,
        required:true
    },
    mobile2:{
        type:Number
    },
    landMark:{
        type:String
    },
    shippingAddress:{
        type:Boolean,
        default:false
    }
})

module.exports = mongoose.model('userAdress',addressSchema)