const mongoose = require ('mongoose')
const  productDetails  = require('../controllers/userController')
const orderSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    shippingAddress:{
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
                required:true
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
            }
    },
    product:{
        type:Array,
        required:true
    },
    grandTotalPrice:{
        type:String,
        required:true
    },
    paymentMethod:{
        type:String,
        required:true
    },
    status:{
        type:String, 
        enum:['order placed','shipped','out for delivery','delivered'],
        default:'order placed'
    },
    email:{
        type:String,
        required:true
    },
    createdAt:{ 
        type: Date,
        default: Date.now 
    }
})

module.exports = mongoose.model('order',orderSchema)