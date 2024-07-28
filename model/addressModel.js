const mongoose = require('mongoose')
const addressSchema = new mongoose.Schema({
    user_id:{
        type:String,
        require:true
    },
    firstName:{
        type: String,
        require:true
    },
    lastName:{
        type: String,
        require:true
    },
    
    country:{
        type:String,
        require:true
    },
    pinCode:{
        type:Number,
        require:true
    },
    place:{
        type:String,
        require:true
    },
    district:{
        type:String,
        require:true
    },
    state:{
        type:String,
        require:true
    },
    address:{
        type:String,
        requie:true
    },
    city:{
        type:String,
        require:true
    },
    mobile:{
        type:Number,
        require:true
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