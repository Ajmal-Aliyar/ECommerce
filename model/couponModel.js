const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    couponCode:{
        type:String,
        required:true
    },
    couponStart: {
        type: String,
        required: true
    },
    couponExpire: {
        type: String,
        required: true
    },
    minimumAmount: {
        type: Number,
        required: true
    },
    couponDiscount: {
        type: Number,
        required: true
    },
    couponLimit:{
        type:String,
        required:true
    },
    couponDescription: {
        type: String,
        required: true
    },
    couponHide: {
        type: Boolean,
        default: false
    }
});

module.exports = mongoose.model('Coupon', couponSchema);
