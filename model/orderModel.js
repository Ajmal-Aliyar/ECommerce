const mongoose = require ('mongoose')
const  productDetails  = require('../controllers/userController')
const orderSchema = new mongoose.Schema({
    userId:{
        type:String,
        require:true
    },
    shippingAddress:{
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
            }
    },
    product:{
        type:Array,
        require:true
    },
    grandTotalPrice:{
        type:String,
        require:true
    },
    paymentMethod:{
        type:String,
        require:true
    },
    status:{
        type:String, 
        enum:['order placed','shipped','out for delivery','delivered'],
        default:'order placed'
    },
    email:{
        type:String,
        require:true
    },
    createdAt:{ 
        type: Date,
        default: Date.now 
    }
})

module.exports = mongoose.model('order',orderSchema)